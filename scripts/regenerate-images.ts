/**
 * Script para regenerar imágenes de documentos con el nuevo pipeline social
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { generateImageWithFallback } from '../lib/services/vertex-image-generator';
import { generateAndUploadDocumentImage } from '../lib/services/image-storage';

// Inicializar Firebase
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS!);

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'lawgic-dof.firebasestorage.app',
});

const db = getFirestore();

async function regenerateImagesForDateRange(startDate: string, endDate: string) {
  console.log(`=== Regenerando imágenes del ${startDate} al ${endDate} ===\n`);
  
  try {
    // Buscar documentos en el rango de fechas
    const snapshot = await db
      .collection('documentos_dof')
      .where('fecha_publicacion', '>=', startDate)
      .where('fecha_publicacion', '<=', endDate)
      .get();
    
    console.log(`📊 Encontrados ${snapshot.size} documentos\n`);
    
    let procesados = 0;
    let exitosos = 0;
    let fallidos = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const doc = docSnapshot.data();
      procesados++;
      
      console.log(`\n[${procesados}/${snapshot.size}] Procesando: ${doc.titulo.substring(0, 60)}...`);
      console.log(`   Fecha: ${doc.fecha_publicacion}`);
      console.log(`   Categoría: ${doc.areas_detectadas?.[0] || 'Sin categoría'}`);
      
      // Obtener categoría principal
      const categoriaPrincipal = doc.areas_detectadas && doc.areas_detectadas.length > 0 
        ? doc.areas_detectadas[0] 
        : 'administrativo';
      
      try {
        // PASO 1, 2 y 3: Generar copy social e imagen
        console.log(`   🎨 Generando copy social e imagen...`);
        
        const { buffer, isGenerated, copy } = await generateImageWithFallback({
          categoria: categoriaPrincipal,
          titulo: doc.titulo,
          tipo: doc.tipo_documento || 'Documento',
          documentoId: docSnapshot.id,
          resumen: doc.resumen_ia || doc.contenido_extracto || '',
        });
        
        if (copy) {
          console.log(`   ✨ Headline: "${copy.headline}"`);
          console.log(`   ✨ Tagline: "${copy.tagline}"`);
          if (copy.impactData) {
            console.log(`   ✨ Dato: "${copy.impactData}"`);
          }
        }
        
        if (buffer && isGenerated) {
          // Subir imagen generada a Firebase Storage
          console.log(`   📤 Subiendo imagen a Firebase Storage...`);
          
          const imageResult = await generateAndUploadDocumentImage({
            documentId: docSnapshot.id,
            titulo: doc.titulo,
            tipo_documento: doc.tipo_documento || 'Documento',
            fecha_publicacion: doc.fecha_publicacion,
            areas_detectadas: doc.areas_detectadas,
            edicion: doc.edicion,
            customImageBuffer: buffer,
          });
          
          if (imageResult.success) {
            // Actualizar documento con nueva imagen y copy social
            await docSnapshot.ref.update({
              image_url: imageResult.publicUrl,
              image_storage_path: imageResult.storagePath,
              image_generated_with_ai: true,
              social_headline: copy?.headline,
              social_tagline: copy?.tagline,
              social_impact_data: copy?.impactData,
              image_regenerated_at: new Date().toISOString(),
            });
            
            console.log(`   ✅ Imagen regenerada exitosamente`);
            console.log(`   🔗 URL: ${imageResult.publicUrl}`);
            exitosos++;
          } else {
            console.error(`   ❌ Error subiendo imagen: ${imageResult.error}`);
            fallidos++;
          }
        } else {
          console.log(`   ⚠️  No se pudo generar imagen con IA, usando fallback`);
          
          // Actualizar solo el copy social
          if (copy) {
            await docSnapshot.ref.update({
              social_headline: copy.headline,
              social_tagline: copy.tagline,
              social_impact_data: copy.impactData,
            });
          }
          
          fallidos++;
        }
        
        // Esperar un poco entre requests para no saturar APIs
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`   ❌ Error procesando documento:`, error);
        fallidos++;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 REGENERACIÓN COMPLETADA`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Total documentos: ${snapshot.size}`);
    console.log(`✅ Exitosos: ${exitosos}`);
    console.log(`❌ Fallidos: ${fallidos}`);
    console.log(`${'='.repeat(60)}\n`);
    
  } catch (error) {
    console.error('Error en regeneración:', error);
    throw error;
  }
}

// Ejecutar para la semana del 8-12 de diciembre 2025
const startDate = process.argv[2] || '2025-12-08';
const endDate = process.argv[3] || '2025-12-12';

regenerateImagesForDateRange(startDate, endDate)
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
