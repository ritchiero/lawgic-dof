import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/firebase';
import { obtenerDocumentosDOF, obtenerExtracto } from '@/lib/services/scraper';
import { clasificarDocumento } from '@/lib/services/clasificador';
import { generateAndUploadDocumentImage } from '@/lib/services/image-storage';
import { generateImageWithFallback } from '@/lib/services/vertex-image-generator';
import { FieldValue } from 'firebase-admin/firestore';

export const maxDuration = 300; // 5 minutos

export async function POST(request: NextRequest) {
  try {
    // Verificar API key para seguridad
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { year, month } = body;

    if (!year || !month) {
      return NextResponse.json({ error: 'year and month are required' }, { status: 400 });
    }

    console.log(`=== Iniciando scraping de ${month}/${year} ===`);
    
    const daysInMonth = new Date(year, month, 0).getDate();
    let totalDocumentos = 0;
    let totalProcesados = 0;
    let totalImagenesGeneradas = 0;
    
    // Recorrer cada día del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const fecha = new Date(year, month - 1, day);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      console.log(`Procesando: ${fechaStr} (día ${day}/${daysInMonth})`);
      
      try {
        // PASO 1: Scraping del DOF
        const documentosRaw = await obtenerDocumentosDOF(fecha);
        console.log(`  Encontrados ${documentosRaw.length} documentos`);
        
        if (documentosRaw.length === 0) {
          continue;
        }
        
        totalDocumentos += documentosRaw.length;
        
        // Guardar documentos en Firestore
        for (const doc of documentosRaw) {
          // Verificar si ya existe
          const existenteQuery = await db
            .collection(collections.documentosDof)
            .where('url_dof', '==', doc.url_dof)
            .limit(1)
            .get();
          
          if (existenteQuery.empty) {
            console.log(`  Nuevo: ${doc.titulo.substring(0, 60)}...`);
            const extracto = await obtenerExtracto(doc.url_dof);
            
            await db.collection(collections.documentosDof).add({
              fecha_publicacion: fechaStr,
              titulo: doc.titulo,
              tipo_documento: doc.tipo_documento,
              url_dof: doc.url_dof,
              contenido_extracto: extracto,
              edicion: doc.edicion,
              procesado: false,
              created_at: FieldValue.serverTimestamp(),
            });
            
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
        
        // PASO 2: Clasificación con IA
        const documentosPendientesQuery = await db
          .collection(collections.documentosDof)
          .where('fecha_publicacion', '==', fechaStr)
          .where('procesado', '==', false)
          .get();
        
        for (const docSnapshot of documentosPendientesQuery.docs) {
          const doc = docSnapshot.data();
          console.log(`  Clasificando: ${doc.titulo.substring(0, 60)}...`);
          
          const resultado = await clasificarDocumento(
            doc.titulo,
            doc.contenido_extracto || ''
          );
          
          await docSnapshot.ref.update({
            areas_detectadas: resultado.areas,
            resumen_ia: resultado.resumen,
            procesado: true,
          });
          
          totalProcesados++;
          
          // Generar imagen con Vertex AI
          const categoriaPrincipal = resultado.areas && resultado.areas.length > 0 
            ? resultado.areas[0] 
            : 'administrativo';
          
          const { buffer, isGenerated } = await generateImageWithFallback({
            categoria: categoriaPrincipal,
            titulo: doc.titulo,
            tipo: doc.tipo_documento || 'Documento',
            documentoId: docSnapshot.id,
          });
          
          if (buffer && isGenerated) {
            const imageResult = await generateAndUploadDocumentImage({
              documentId: docSnapshot.id,
              titulo: doc.titulo,
              tipo_documento: doc.tipo_documento || 'Documento',
              fecha_publicacion: fechaStr,
              areas_detectadas: resultado.areas,
              edicion: doc.edicion,
              customImageBuffer: buffer,
            });
            
            if (imageResult.success) {
              await docSnapshot.ref.update({
                image_url: imageResult.publicUrl,
                image_storage_path: imageResult.storagePath,
                image_generated_with_ai: true,
              });
              totalImagenesGeneradas++;
            }
          } else {
            await docSnapshot.ref.update({
              image_category: categoriaPrincipal,
              image_generated_with_ai: false,
            });
          }
          
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`Error procesando ${fechaStr}:`, error);
      }
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    
    console.log(`=== Scraping completado ===`);
    console.log(`Total documentos: ${totalDocumentos}`);
    console.log(`Total procesados: ${totalProcesados}`);
    console.log(`Total imágenes generadas: ${totalImagenesGeneradas}`);
    
    return NextResponse.json({
      success: true,
      year,
      month,
      documentos_encontrados: totalDocumentos,
      documentos_procesados: totalProcesados,
      imagenes_generadas: totalImagenesGeneradas,
    });
  } catch (error) {
    console.error('Error en scraping de mes:', error);
    return NextResponse.json(
      { error: 'Error ejecutando scraping' },
      { status: 500 }
    );
  }
}
