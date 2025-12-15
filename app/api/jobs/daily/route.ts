import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/firebase';
import { obtenerDocumentosDOF, obtenerExtracto, determinarEdicionActual } from '@/lib/services/scraper';
import { clasificarDocumento } from '@/lib/services/clasificador';
import { enviarEmailAlerta } from '@/lib/services/emailer';
import { generateAndUploadDocumentImage } from '@/lib/services/image-storage';
import { generateImageWithFallback } from '@/lib/services/dalle-image-generator';
import { DocumentoDOF } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    // Verificar API key para seguridad
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== Iniciando job diario ===');
    
    // Determinar qué edición procesar
    const edicionActual = determinarEdicionActual();
    console.log(`Edición a procesar: ${edicionActual}`);

    // PASO 1: Scraping del DOF
    console.log('PASO 1: Scraping DOF...');
    const hoy = new Date();
    const documentosRaw = await obtenerDocumentosDOF(hoy);
    console.log(`Encontrados ${documentosRaw.length} documentos`);

    // Guardar documentos en Firestore
    for (const doc of documentosRaw) {
      // Verificar si ya existe
      const existenteQuery = await db
        .collection(collections.documentosDof)
        .where('url_dof', '==', doc.url_dof)
        .limit(1)
        .get();

      if (existenteQuery.empty) {
        // Obtener extracto del documento
        console.log(`Obteniendo extracto de: ${doc.titulo.substring(0, 50)}...`);
        const extracto = await obtenerExtracto(doc.url_dof);

        await db.collection(collections.documentosDof).add({
          fecha_publicacion: doc.fecha_publicacion.toISOString().split('T')[0],
          titulo: doc.titulo,
          tipo_documento: doc.tipo_documento,
          url_dof: doc.url_dof,
          contenido_extracto: extracto,
          edicion: doc.edicion,
          procesado: false,
          created_at: FieldValue.serverTimestamp(),
        });
      }
    }

    // PASO 2: Clasificación con IA
    console.log('PASO 2: Clasificación con IA...');
    const documentosPendientesQuery = await db
      .collection(collections.documentosDof)
      .where('procesado', '==', false)
      .limit(50)
      .get();

    for (const docSnapshot of documentosPendientesQuery.docs) {
      const doc = docSnapshot.data();
      console.log(`Clasificando: ${doc.titulo.substring(0, 50)}...`);

      const resultado = await clasificarDocumento(
        doc.titulo,
        doc.contenido_extracto || ''
      );

      await docSnapshot.ref.update({
        areas_detectadas: resultado.areas,
        resumen_ia: resultado.resumen,
        procesado: true,
      });

      // PASO 2.5: Generar imagen con Vertex AI
      console.log(`Generando imagen con Vertex AI para: ${doc.titulo.substring(0, 50)}...`);
      
      // Obtener categoría principal
      const categoriaPrincipal = resultado.areas && resultado.areas.length > 0 
        ? resultado.areas[0] 
        : 'Administrativo';
      
      // Generar imagen con Vertex AI (con copy social y fallback a imagen de categoría)
      const { buffer, isGenerated, copy } = await generateImageWithFallback({
        categoria: categoriaPrincipal,
        titulo: doc.titulo,
        tipo: doc.tipo_documento || 'Documento',
        documentoId: docSnapshot.id,
        resumen: resultado.resumen, // Pasar resumen para generar copy social
      });
      
      if (buffer && isGenerated) {
        // Subir imagen generada a Firebase Storage
        const imageResult = await generateAndUploadDocumentImage({
          documentId: docSnapshot.id,
          titulo: doc.titulo,
          tipo_documento: doc.tipo_documento || 'Documento',
          fecha_publicacion: doc.fecha_publicacion,
          areas_detectadas: resultado.areas,
          edicion: doc.edicion,
          customImageBuffer: buffer, // Pasar buffer generado
        });
        
        if (imageResult.success) {
          await docSnapshot.ref.update({
            image_url: imageResult.publicUrl,
            image_storage_path: imageResult.storagePath,
            image_generated_with_ai: true,
            // Guardar copy social para usar en redes sociales
            social_headline: copy?.headline,
            social_tagline: copy?.tagline,
            social_impact_data: copy?.impactData,
          });
          console.log(`✅ Imagen generada con Vertex AI: ${imageResult.publicUrl}`);
          if (copy) {
            console.log(`   Headline: ${copy.headline}`);
            console.log(`   Tagline: ${copy.tagline}`);
          }
        } else {
          console.error(`❌ Error subiendo imagen: ${imageResult.error}`);
        }
      } else {
        // Fallback: usar imagen de categoría estática
        console.log(`ℹ️  Usando imagen de categoría estática para: ${categoriaPrincipal}`);
        await docSnapshot.ref.update({
          image_category: categoriaPrincipal,
          image_generated_with_ai: false,
        });
      }

      // Pequeña pausa para no saturar la API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // PASO 3: Matching y envío de emails
    console.log('PASO 3: Matching y envío de emails...');

    // Obtener usuarios activos
    const usuariosQuery = await db
      .collection(collections.usuarios)
      .where('status', '==', 'active')
      .get();

    if (usuariosQuery.empty) {
      console.log('No hay usuarios activos');
      return NextResponse.json({
        success: true,
        message: 'Job completado - sin usuarios activos',
      });
    }

    const fechaHoy = hoy.toISOString().split('T')[0];
    let emailsEnviados = 0;

    for (const usuarioSnapshot of usuariosQuery.docs) {
      const usuario = usuarioSnapshot.data();

      // Obtener áreas del usuario
      const areasQuery = await db
        .collection(collections.areasUsuario)
        .where('usuario_id', '==', usuarioSnapshot.id)
        .get();

      if (areasQuery.empty) continue;

      const codigosAreas = areasQuery.docs.map((doc) => doc.data().area_codigo);

      // Buscar documentos relevantes de hoy y de la edición actual
      const documentosQuery = await db
        .collection(collections.documentosDof)
        .where('fecha_publicacion', '==', fechaHoy)
        .where('edicion', '==', edicionActual)
        .where('procesado', '==', true)
        .get();

      if (documentosQuery.empty) continue;

      // Filtrar documentos que coincidan con las áreas del usuario
      const documentosParaEnviar = documentosQuery.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((doc: any) => {
          if (!doc.areas_detectadas || doc.areas_detectadas.length === 0) return false;
          return doc.areas_detectadas.some((area: string) => codigosAreas.includes(area));
        });

      // Si no hay documentos nuevos hoy, obtener últimos 10 históricos
      let documentosHistoricos: any[] = [];
      if (documentosParaEnviar.length === 0) {
        console.log(`Sin documentos nuevos para ${usuario.email}, obteniendo históricos...`);
        
        const historicosQuery = await db
          .collection(collections.documentosDof)
          .where('procesado', '==', true)
          .orderBy('fecha_publicacion', 'desc')
          .limit(100) // Obtener últimos 100 para filtrar
          .get();
        
        documentosHistoricos = historicosQuery.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((doc: any) => {
            if (!doc.areas_detectadas || doc.areas_detectadas.length === 0) return false;
            return doc.areas_detectadas.some((area: string) => codigosAreas.includes(area));
          })
          .slice(0, 10); // Tomar solo los 10 más recientes
      }

      // Enviar email siempre (con documentos nuevos o históricos)
      const hayDocumentosNuevos = documentosParaEnviar.length > 0;
      console.log(
        `Enviando email a ${usuario.email}: ${documentosParaEnviar.length} nuevos, ${documentosHistoricos.length} históricos`
      );

      const emailId = await enviarEmailAlerta({
        email: usuario.email,
        nombre: usuario.nombre,
        documentos: documentosParaEnviar as any,
        documentosHistoricos: documentosHistoricos as any,
        fecha: fechaHoy,
        hayDocumentosNuevos,
      });

      if (emailId) {
        // Registrar alertas enviadas
        const batch = db.batch();
        for (const doc of documentosParaEnviar) {
          const alertaRef = db.collection(collections.alertasEnviadas).doc();
          batch.set(alertaRef, {
            usuario_id: usuarioSnapshot.id,
            documento_id: doc.id,
            email_id: emailId,
            fecha_envio: FieldValue.serverTimestamp(),
          });
        }
        await batch.commit();
        emailsEnviados++;
      }
    }

    console.log(`=== Job completado: ${emailsEnviados} emails enviados ===`);

    return NextResponse.json({
      success: true,
      documentos_encontrados: documentosRaw.length,
      documentos_procesados: documentosPendientesQuery.size,
      emails_enviados: emailsEnviados,
    });
  } catch (error) {
    console.error('Error en job diario:', error);
    return NextResponse.json(
      { error: 'Error ejecutando job diario' },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar estado
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const documentosQuery = await db
    .collection(collections.documentosDof)
    .limit(100)
    .get();

  const procesados = documentosQuery.docs.filter(
    (doc) => doc.data().procesado
  ).length;

  return NextResponse.json({
    status: 'ok',
    total_documentos: documentosQuery.size,
    procesados,
  });
}
