import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/firebase';
import { generateImageWithFallback } from '@/lib/services/vertex-image-generator';
import { generateAndUploadDocumentImage } from '@/lib/services/image-storage';

export const maxDuration = 300; // 5 minutos

export async function POST(request: NextRequest) {
  try {
    // Verificar API key para seguridad
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ 
        error: 'startDate and endDate are required',
        example: { startDate: '2025-12-08', endDate: '2025-12-12' }
      }, { status: 400 });
    }

    console.log(`=== Regenerando imágenes del ${startDate} al ${endDate} ===`);
    
    // Buscar documentos en el rango de fechas
    const snapshot = await db
      .collection(collections.documentosDof)
      .where('fecha_publicacion', '>=', startDate)
      .where('fecha_publicacion', '<=', endDate)
      .get();
    
    console.log(`📊 Encontrados ${snapshot.size} documentos`);
    
    let procesados = 0;
    let exitosos = 0;
    let fallidos = 0;
    const detalles: any[] = [];
    
    for (const docSnapshot of snapshot.docs) {
      const doc = docSnapshot.data();
      procesados++;
      
      console.log(`[${procesados}/${snapshot.size}] ${doc.titulo.substring(0, 60)}...`);
      
      // Obtener categoría principal
      const categoriaPrincipal = doc.areas_detectadas && doc.areas_detectadas.length > 0 
        ? doc.areas_detectadas[0] 
        : 'administrativo';
      
      try {
        // Generar copy social e imagen
        const { buffer, isGenerated, copy } = await generateImageWithFallback({
          categoria: categoriaPrincipal,
          titulo: doc.titulo,
          tipo: doc.tipo_documento || 'Documento',
          documentoId: docSnapshot.id,
          resumen: doc.resumen_ia || doc.contenido_extracto || '',
        });
        
        if (copy) {
          console.log(`   Headline: "${copy.headline}"`);
        }
        
        if (buffer && isGenerated) {
          // Subir imagen generada
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
            // Actualizar documento
            const updateData: any = {
              image_url: imageResult.publicUrl,
              image_storage_path: imageResult.storagePath,
              image_generated_with_ai: true,
              image_regenerated_at: new Date().toISOString(),
            };
            
            // Solo agregar campos de copy social si existen
            if (copy?.headline) updateData.social_headline = copy.headline;
            if (copy?.tagline) updateData.social_tagline = copy.tagline;
            if (copy?.impactData) updateData.social_impact_data = copy.impactData;
            
            await docSnapshot.ref.update(updateData);
            
            exitosos++;
            detalles.push({
              id: docSnapshot.id,
              titulo: doc.titulo.substring(0, 60),
              status: 'success',
              headline: copy?.headline,
              imageUrl: imageResult.publicUrl,
            });
          } else {
            fallidos++;
            detalles.push({
              id: docSnapshot.id,
              titulo: doc.titulo.substring(0, 60),
              status: 'failed',
              error: imageResult.error,
            });
          }
        } else {
          // Solo actualizar copy social
          if (copy) {
            const updateData: any = {};
            if (copy.headline) updateData.social_headline = copy.headline;
            if (copy.tagline) updateData.social_tagline = copy.tagline;
            if (copy.impactData) updateData.social_impact_data = copy.impactData;
            
            if (Object.keys(updateData).length > 0) {
              await docSnapshot.ref.update(updateData);
            }
          }
          
          fallidos++;
          detalles.push({
            id: docSnapshot.id,
            titulo: doc.titulo.substring(0, 60),
            status: 'fallback',
            headline: copy?.headline,
          });
        }
        
        // Esperar entre requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error: any) {
        console.error(`Error procesando ${docSnapshot.id}:`, error);
        fallidos++;
        detalles.push({
          id: docSnapshot.id,
          titulo: doc.titulo.substring(0, 60),
          status: 'error',
          error: error.message,
        });
      }
    }
    
    console.log(`✅ Regeneración completada: ${exitosos} exitosos, ${fallidos} fallidos`);
    
    return NextResponse.json({
      success: true,
      startDate,
      endDate,
      total: snapshot.size,
      procesados,
      exitosos,
      fallidos,
      detalles,
    });
    
  } catch (error: any) {
    console.error('Error en regeneración:', error);
    return NextResponse.json(
      { error: 'Error ejecutando regeneración', details: error.message },
      { status: 500 }
    );
  }
}
