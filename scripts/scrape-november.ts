/**
 * Script para scrapear documentos de Noviembre 2025
 * 
 * Este script recorre todos los días de noviembre 2025 y ejecuta el scraping
 * para cada día, clasificando documentos y generando imágenes con Vertex AI.
 */

import { db, collections } from '../lib/firebase';
import { obtenerDocumentosDOF, obtenerExtracto } from '../lib/services/scraper';
import { clasificarDocumento } from '../lib/services/clasificador';
import { generateAndUploadDocumentImage } from '../lib/services/image-storage';
import { generateImageWithFallback } from '../lib/services/vertex-image-generator';
import { FieldValue } from 'firebase-admin/firestore';

async function scrapeNovember2025() {
  console.log('=== Iniciando scraping de Noviembre 2025 ===\n');
  
  const year = 2025;
  const month = 11; // Noviembre (0-indexed: 10)
  const daysInNovember = 30;
  
  let totalDocumentos = 0;
  let totalProcesados = 0;
  let totalImagenesGeneradas = 0;
  
  // Recorrer cada día de noviembre
  for (let day = 1; day <= daysInNovember; day++) {
    const fecha = new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexed
    const fechaStr = fecha.toISOString().split('T')[0];
    
    console.log(`\n📅 Procesando: ${fechaStr} (día ${day}/${daysInNovember})`);
    console.log('='.repeat(60));
    
    try {
      // PASO 1: Scraping del DOF para este día
      console.log('🔍 PASO 1: Scraping DOF...');
      const documentosRaw = await obtenerDocumentosDOF(fecha);
      console.log(`   Encontrados ${documentosRaw.length} documentos`);
      
      if (documentosRaw.length === 0) {
        console.log('   ⚠️  No hay documentos para este día (posible fin de semana)');
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
          // Obtener extracto del documento
          console.log(`   📄 Obteniendo extracto: ${doc.titulo.substring(0, 60)}...`);
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
          
          // Pequeña pausa para no saturar el servidor
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          console.log(`   ✓ Ya existe: ${doc.titulo.substring(0, 60)}...`);
        }
      }
      
      // PASO 2: Clasificación con IA para documentos de este día
      console.log('\n🤖 PASO 2: Clasificación con IA...');
      const documentosPendientesQuery = await db
        .collection(collections.documentosDof)
        .where('fecha_publicacion', '==', fechaStr)
        .where('procesado', '==', false)
        .get();
      
      console.log(`   Documentos pendientes de clasificar: ${documentosPendientesQuery.size}`);
      
      for (const docSnapshot of documentosPendientesQuery.docs) {
        const doc = docSnapshot.data();
        console.log(`   🔬 Clasificando: ${doc.titulo.substring(0, 60)}...`);
        
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
        
        // PASO 2.5: Generar imagen con Vertex AI
        console.log(`   🎨 Generando imagen con Vertex AI...`);
        
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
            console.log(`   ✅ Imagen generada con Vertex AI`);
          } else {
            console.error(`   ❌ Error subiendo imagen: ${imageResult.error}`);
          }
        } else {
          console.log(`   ℹ️  Usando imagen de categoría estática: ${categoriaPrincipal}`);
          await docSnapshot.ref.update({
            image_category: categoriaPrincipal,
            image_generated_with_ai: false,
          });
        }
        
        // Pausa para no saturar las APIs
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      
      console.log(`\n✅ Día ${fechaStr} completado`);
      console.log(`   📊 Documentos nuevos: ${documentosRaw.length}`);
      console.log(`   📊 Procesados: ${documentosPendientesQuery.size}`);
      
    } catch (error) {
      console.error(`❌ Error procesando ${fechaStr}:`, error);
      // Continuar con el siguiente día
    }
    
    // Pausa entre días para no saturar
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SCRAPING DE NOVIEMBRE 2025 COMPLETADO');
  console.log('='.repeat(60));
  console.log(`📊 Total documentos encontrados: ${totalDocumentos}`);
  console.log(`📊 Total documentos procesados: ${totalProcesados}`);
  console.log(`📊 Total imágenes generadas con IA: ${totalImagenesGeneradas}`);
  console.log('='.repeat(60));
}

// Ejecutar
scrapeNovember2025()
  .then(() => {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando script:', error);
    process.exit(1);
  });
