/**
 * Endpoint para regenerar imágenes de 20 documentos recientes
 * Usa el nuevo sistema de análisis inteligente
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { generateImageWithFallback } from '@/lib/services/dalle-image-generator';
import { uploadDocumentImage } from '@/lib/services/image-storage';

export const maxDuration = 300; // 5 minutos

export async function POST(request: Request) {
  try {
    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    console.log(`🔄 Iniciando regeneración de ${limit} imágenes (offset: ${offset})...`);

    // Obtener documentos recientes
    const docsSnapshot = await db.collection('documentos_dof')
      .orderBy('fecha_publicacion', 'desc')
      .offset(offset)
      .limit(limit)
      .get();

    if (docsSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'No se encontraron documentos'
      }, { status: 404 });
    }

    console.log(`📄 Encontrados ${docsSnapshot.size} documentos`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const doc of docsSnapshot.docs) {
      const data = doc.data();
      const docId = doc.id;
      const titulo = data.titulo || '';
      const resumen = data.resumen || '';
      const categoria = data.categoria || 'general';
      const tipo = data.tipo_documento || 'Acuerdo';

      try {
        console.log(`\n📝 [${successCount + errorCount + 1}/${docsSnapshot.size}] ${titulo.substring(0, 60)}...`);
        
        // Generar imagen con nuevo sistema
        const imageResult = await generateImageWithFallback({
          categoria,
          titulo,
          tipo,
          documentoId: docId,
          resumen,
        });

        if (imageResult.buffer) {
          // Subir imagen a storage
          console.log(`   📤 Subiendo imagen...`);
          const imageBase64 = imageResult.buffer.toString('base64');
          const uploadResult = await uploadDocumentImage({
            imageBase64,
            documentId: docId,
            format: 'png',
          });

          if (uploadResult.success && uploadResult.publicUrl) {
            // Actualizar documento en Firestore
            await doc.ref.update({
              imagen_social: uploadResult.publicUrl,
              imagen_regenerada: new Date().toISOString(),
            });

            console.log(`   ✅ Imagen regenerada y actualizada`);
            
            results.push({
              id: docId,
              titulo: titulo.substring(0, 80),
              success: true,
              imageUrl: uploadResult.publicUrl,
            });
            
            successCount++;
          } else {
            throw new Error('Error subiendo imagen');
          }
        } else {
          throw new Error('No se pudo generar la imagen');
        }

      } catch (error) {
        console.error(`   ❌ Error con documento ${docId}:`, error);
        errorCount++;
        
        results.push({
          id: docId,
          titulo: titulo.substring(0, 80),
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }

      // Pausa entre documentos para no saturar APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n✅ Regeneración completada: ${successCount} éxitos, ${errorCount} errores`);

    return NextResponse.json({
      success: true,
      totalDocuments: docsSnapshot.size,
      successCount,
      errorCount,
      results,
    });

  } catch (error) {
    console.error('❌ Error en regeneración:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}
