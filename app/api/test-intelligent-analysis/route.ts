/**
 * Endpoint de prueba para análisis inteligente con GPT-4o-mini
 * GET /api/test-intelligent-analysis
 */

import { NextResponse } from 'next/server';
import { analyzeWithAI } from '@/lib/services/intelligent-semantic-analyzer';

export async function GET() {
  try {
    console.log('🧪 Iniciando prueba de análisis inteligente...');

    // Documento de prueba - el mismo que estábamos usando
    const testTitulo = 'CALENDARIO para la ministración durante el ejercicio fiscal 2025, de los recursos correspondientes al Ramo General 48 Cultura';

    console.log('📄 Analizando documento de prueba...');
    const startTime = Date.now();

    const result = await analyzeWithAI(testTitulo);

    const duration = Date.now() - startTime;

    console.log(`✅ Análisis completado en ${duration}ms`);
    console.log('📊 Resultado:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      duration,
      titulo: testTitulo,
      analysis: result,
      hasNewFormat: !!(result.step1 && result.step2 && result.step3),
      formatCheck: {
        hasStep1: !!result.step1,
        hasStep2: !!result.step2,
        hasStep3: !!result.step3,
        hasMainTopic: !!result.mainTopic,
        hasEntities: !!result.entities,
      }
    });

  } catch (error) {
    console.error('❌ Error en endpoint de prueba:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
