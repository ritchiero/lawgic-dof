/**
 * Endpoint de prueba para DALL-E 3 con análisis inteligente
 * GET /api/test-dalle-with-analysis
 */

import { NextResponse } from 'next/server';
import { generateBackgroundPhoto } from '@/lib/services/background-photo-generator';

export async function GET() {
  try {
    console.log('🧪 Iniciando prueba de DALL-E 3 con análisis inteligente...');

    // Documento de prueba - el mismo que estábamos usando
    const testDocument = {
      titulo: 'CALENDARIO para la ministración durante el ejercicio fiscal 2025, de los recursos correspondientes al Ramo General 48 Cultura',
      resumen: 'La Secretaría de Hacienda publica el calendario de ministración de recursos para el sector cultural durante 2025.',
      categoria: 'fiscal'
    };

    console.log('📄 Generando imagen para documento de prueba...');
    const startTime = Date.now();

    const result = await generateBackgroundPhoto(testDocument);

    const duration = Date.now() - startTime;

    if (result.success && result.photoBase64) {
      console.log(`✅ Imagen generada exitosamente en ${duration}ms`);

      // Retornar la imagen como data URL para visualización
      return NextResponse.json({
        success: true,
        duration,
        imageSize: result.photoBase64.length,
        imageDataUrl: `data:image/png;base64,${result.photoBase64}`,
        metadata: result.metadata,
        message: 'Imagen generada exitosamente con DALL-E 3 + GPT-4o-mini'
      });
    } else {
      console.error('❌ Error generando imagen:', result.error);
      return NextResponse.json({
        success: false,
        duration,
        error: result.error,
        metadata: result.metadata
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error en endpoint de prueba:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
