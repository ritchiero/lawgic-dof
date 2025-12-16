/**
 * Endpoint de prueba para analizar 10 documentos con enfoque temático/simbólico
 * GET /api/test-analyze-10-docs
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { analyzeWithAI } from '@/lib/services/intelligent-semantic-analyzer';

export async function GET() {
  try {
    console.log('🧪 Analizando 10 documentos del DOF...');

    // Obtener 10 documentos recientes
    const docsSnapshot = await db.collection('documentos_dof')
      .orderBy('fecha_publicacion', 'desc')
      .limit(10)
      .get();

    if (docsSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'No se encontraron documentos'
      }, { status: 404 });
    }

    console.log(`📄 Encontrados ${docsSnapshot.size} documentos`);

    // Analizar cada documento
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const doc of docsSnapshot.docs) {
      const data = doc.data();
      const titulo = data.titulo || '';
      const resumen = data.resumen || '';

      try {
        console.log(`\n📝 Analizando: ${titulo.substring(0, 60)}...`);
        
        const analysis = await analyzeWithAI(titulo, resumen);
        
        results.push({
          id: doc.id,
          titulo: titulo.substring(0, 100) + (titulo.length > 100 ? '...' : ''),
          fecha: data.fecha_publicacion,
          analysis: {
            step1_theme: analysis.step1,
            step2_visualSymbol: analysis.step2,
            step3_dallePrompt: analysis.step3,
            mainTopic: analysis.mainTopic,
            entities: analysis.entities
          }
        });

        successCount++;
        console.log(`   ✅ Tema: ${analysis.step1}`);
        console.log(`   🎨 Símbolo: ${analysis.step2}`);

      } catch (error) {
        console.error(`   ❌ Error analizando documento ${doc.id}:`, error);
        errorCount++;
        
        results.push({
          id: doc.id,
          titulo: titulo.substring(0, 100) + (titulo.length > 100 ? '...' : ''),
          fecha: data.fecha_publicacion,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }

      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✅ Análisis completado: ${successCount} éxitos, ${errorCount} errores`);

    return NextResponse.json({
      success: true,
      totalDocuments: docsSnapshot.size,
      successCount,
      errorCount,
      results
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
