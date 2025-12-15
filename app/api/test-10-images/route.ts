/**
 * Endpoint para probar generación de 10 imágenes con Gemini 3 Pro Image
 * Con fallback automático a Imagen 3
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { generateDocumentImageWithFallback } from '@/lib/services/gemini-image-generator';

interface TestResult {
  documentId: string;
  titulo: string;
  success: boolean;
  model?: string;
  duration: number;
  error?: string;
  imageSize?: number;
}

export async function GET() {
  try {
    console.log('🚀 Iniciando prueba de generación de 10 imágenes...');

    // Obtener 10 documentos recientes del DOF (con o sin imagen, para testing)
    const docsSnapshot = await db.collection('documentos_dof')
      .orderBy('fecha_publicacion', 'desc')
      .limit(10)
      .get();

    if (docsSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'No se encontraron documentos sin imagen',
      });
    }

    console.log(`✅ Encontrados ${docsSnapshot.size} documentos`);

    const results: TestResult[] = [];
    const startTime = Date.now();

    // Procesar cada documento
    for (let i = 0; i < docsSnapshot.docs.length; i++) {
      const doc = docsSnapshot.docs[i];
      const data = doc.data();
      
      console.log(`\n📄 Documento ${i + 1}/10: ${doc.id}`);
      console.log(`   Título: ${data.titulo?.substring(0, 60)}...`);

      const docStartTime = Date.now();

      try {
        // Intentar generar imagen con fallback automático
        const result = await generateDocumentImageWithFallback({
          titulo: data.titulo,
          resumen: data.resumen || data.extracto || 'Documento oficial del DOF',
          tipo_documento: data.tipo_documento || 'Documento',
          fecha_publicacion: data.fecha_publicacion,
          areas_detectadas: data.areas_detectadas || ['administrativo'],
          social_headline: data.social_copy?.headline,
          social_tagline: data.social_copy?.tagline,
          social_impact_data: data.social_copy?.impact_data,
        });

        const duration = Date.now() - docStartTime;

        if (result.success && result.imageBase64) {
          const imageSize = Buffer.from(result.imageBase64, 'base64').length;
          
          console.log(`   ✅ Imagen generada exitosamente`);
          console.log(`   🤖 Modelo usado: ${result.model || 'unknown'}`);
          console.log(`   ⏱️  Duración: ${(duration / 1000).toFixed(2)}s`);
          console.log(`   📦 Tamaño: ${(imageSize / 1024).toFixed(2)} KB`);

          results.push({
            documentId: doc.id,
            titulo: data.titulo,
            success: true,
            model: result.model || 'unknown',
            duration,
            imageSize,
          });
        } else {
          console.log(`   ❌ Error: ${result.error}`);
          results.push({
            documentId: doc.id,
            titulo: data.titulo,
            success: false,
            duration,
            error: result.error,
          });
        }
      } catch (error) {
        const duration = Date.now() - docStartTime;
        console.log(`   ❌ Error inesperado: ${error instanceof Error ? error.message : 'Unknown'}`);
        
        results.push({
          documentId: doc.id,
          titulo: data.titulo,
          success: false,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Pequeña pausa entre requests para evitar rate limiting
      if (i < docsSnapshot.docs.length - 1) {
        console.log(`   ⏳ Esperando 2 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const totalDuration = Date.now() - startTime;

    // Calcular estadísticas
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const geminiCount = results.filter(r => r.model === 'gemini-3-pro-image').length;
    const imagen3Count = results.filter(r => r.model === 'imagen-3').length;

    console.log(`\n📊 RESUMEN:`);
    console.log(`✅ Exitosas: ${successful}/10`);
    console.log(`❌ Fallidas: ${failed}/10`);
    console.log(`🤖 Gemini 3 Pro Image: ${geminiCount}`);
    console.log(`🎨 Imagen 3 (fallback): ${imagen3Count}`);
    console.log(`⏱️  Duración promedio: ${(avgDuration / 1000).toFixed(2)}s`);
    console.log(`⏱️  Duración total: ${(totalDuration / 1000).toFixed(2)}s`);

    return NextResponse.json({
      success: true,
      summary: {
        total: 10,
        successful,
        failed,
        geminiCount,
        imagen3Count,
        avgDuration: Math.round(avgDuration),
        totalDuration,
      },
      results,
    });

  } catch (error) {
    console.error('❌ Error en prueba de 10 imágenes:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
