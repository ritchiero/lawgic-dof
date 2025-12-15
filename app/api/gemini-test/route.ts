/**
 * Endpoint de prueba para Gemini 3 Pro Image
 * GET /api/test-gemini-image
 */

import { NextResponse } from 'next/server';
import { generateDocumentImageWithRetry } from '@/lib/services/gemini-image-generator';

export async function GET() {
  try {
    console.log('🧪 Iniciando prueba de Gemini 3 Pro Image...');

    // Verificar variables de entorno
    const hasCredentials = !!(
      process.env.GOOGLE_CLOUD_PROJECT_ID &&
      process.env.GOOGLE_CLOUD_PRIVATE_KEY &&
      process.env.GOOGLE_CLOUD_CLIENT_EMAIL
    );

    if (!hasCredentials) {
      return NextResponse.json({
        success: false,
        error: 'Credenciales de Google Cloud no configuradas',
        details: {
          GOOGLE_CLOUD_PROJECT_ID: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
          GOOGLE_CLOUD_PRIVATE_KEY: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
          GOOGLE_CLOUD_CLIENT_EMAIL: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        }
      }, { status: 500 });
    }

    // Documento de prueba
    const testDocument = {
      titulo: 'ACUERDO por el que se da a conocer el Programa de Trabajo de la Comisión de Presupuesto y Cuenta Pública',
      resumen: 'La Cámara de Diputados publica el programa de trabajo de la Comisión de Presupuesto y Cuenta Pública para el segundo periodo de sesiones.',
      tipo_documento: 'Acuerdo',
      fecha_publicacion: '2025-12-08',
      areas_detectadas: ['fiscal', 'administrativo'],
      social_headline: '¿A dónde va el dinero público en 2026?',
      social_tagline: 'Descubre el programa de trabajo de la Comisión de Presupuesto para fiscalizar el gasto federal',
      social_impact_data: 'Presupuesto 2026'
    };

    console.log('📄 Generando imagen para documento de prueba...');
    const startTime = Date.now();

    const result = await generateDocumentImageWithRetry(testDocument, 1);

    const duration = Date.now() - startTime;

    if (result.success && result.imageBase64) {
      console.log(`✅ Imagen generada exitosamente en ${duration}ms`);

      // Retornar la imagen como data URL para visualización
      return NextResponse.json({
        success: true,
        duration,
        imageSize: result.imageBase64.length,
        imageDataUrl: `data:image/png;base64,${result.imageBase64}`,
        prompt: result.prompt?.substring(0, 500) + '...',
        message: 'Imagen generada exitosamente con Gemini 3 Pro Image'
      });
    } else {
      console.error('❌ Error generando imagen:', result.error);
      return NextResponse.json({
        success: false,
        duration,
        error: result.error,
        prompt: result.prompt?.substring(0, 500) + '...'
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
