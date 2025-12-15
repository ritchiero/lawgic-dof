/**
 * Script para probar generación de 10 imágenes con Gemini 3 Pro Image
 * Con fallback automático a Imagen 3 si Gemini no está disponible
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { generateDocumentImageWithFallback } from '../lib/services/gemini-image-generator';
import * as fs from 'fs';
import * as path from 'path';

// Inicializar Firebase Admin
const serviceAccount = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.GOOGLE_CLOUD_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
};

initializeApp({
  credential: cert(serviceAccount as any),
});

const db = getFirestore();

interface TestResult {
  documentId: string;
  titulo: string;
  success: boolean;
  model?: string;
  duration: number;
  error?: string;
  imagePath?: string;
}

async function main() {
  console.log('🚀 Iniciando prueba de generación de 10 imágenes...\n');

  // Crear directorio para guardar imágenes
  const outputDir = path.join(process.cwd(), 'test-images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Obtener 10 documentos recientes del DOF
  console.log('📚 Obteniendo 10 documentos recientes del DOF...');
  const docsSnapshot = await db.collection('documentos_dof')
    .where('imagen_social', '==', null) // Sin imagen generada
    .orderBy('fecha_publicacion', 'desc')
    .limit(10)
    .get();

  if (docsSnapshot.empty) {
    console.log('❌ No se encontraron documentos sin imagen');
    return;
  }

  console.log(`✅ Encontrados ${docsSnapshot.size} documentos\n`);

  const results: TestResult[] = [];

  // Procesar cada documento
  for (let i = 0; i < docsSnapshot.docs.length; i++) {
    const doc = docsSnapshot.docs[i];
    const data = doc.data();
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📄 Documento ${i + 1}/10: ${doc.id}`);
    console.log(`   Título: ${data.titulo?.substring(0, 60)}...`);
    console.log(`   Categoría: ${data.areas_detectadas?.[0] || 'N/A'}`);

    const startTime = Date.now();

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

      const duration = Date.now() - startTime;

      if (result.success && result.imageBase64) {
        // Guardar imagen
        const imagePath = path.join(outputDir, `${doc.id}.png`);
        fs.writeFileSync(imagePath, Buffer.from(result.imageBase64, 'base64'));

        console.log(`   ✅ Imagen generada exitosamente`);
        console.log(`   🤖 Modelo usado: ${result.model || 'unknown'}`);
        console.log(`   ⏱️  Duración: ${(duration / 1000).toFixed(2)}s`);
        console.log(`   💾 Guardada en: ${imagePath}`);

        results.push({
          documentId: doc.id,
          titulo: data.titulo,
          success: true,
          model: result.model || 'unknown',
          duration,
          imagePath,
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
      const duration = Date.now() - startTime;
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

  // Resumen final
  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 RESUMEN DE RESULTADOS`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  // Contar por modelo
  const geminiCount = results.filter(r => r.model === 'gemini-3-pro-image').length;
  const imagen3Count = results.filter(r => r.model === 'imagen-3').length;

  console.log(`✅ Exitosas: ${successful}/10`);
  console.log(`❌ Fallidas: ${failed}/10`);
  console.log(`🤖 Gemini 3 Pro Image: ${geminiCount}`);
  console.log(`🎨 Imagen 3 (fallback): ${imagen3Count}`);
  console.log(`⏱️  Duración promedio: ${(avgDuration / 1000).toFixed(2)}s`);
  console.log(`💾 Imágenes guardadas en: ${outputDir}\n`);

  if (failed > 0) {
    console.log(`\n🔍 ERRORES ENCONTRADOS:`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`   • ${r.documentId}: ${r.error}`);
    });
  }

  // Guardar resultados en JSON
  const resultsPath = path.join(outputDir, 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Resultados detallados guardados en: ${resultsPath}`);

  console.log(`\n✨ Prueba completada!\n`);
}

main().catch(console.error);
