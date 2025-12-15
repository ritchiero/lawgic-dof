/**
 * Script de prueba para generar una imagen social atractiva
 */

import { generateSocialCopy, generateImagePrompt } from '../lib/services/social-copywriter';

async function testSocialCopy() {
  console.log('=== Test de generación de copy social ===\n');
  
  // Documento de ejemplo: Presupuesto de Cultura
  const titulo = 'Calendario de Presupuesto autorizado al Ramo 48 Cultura para el ejercicio fiscal 2026';
  const resumen = 'El documento corresponde al calendario del presupuesto autorizado para el Ramo 48 Cultura para el ejercicio fiscal 2026, lo cual implica aspectos administrativos relacionados con la asignación y ejercicio del gasto público. Asimismo, tiene implicaciones fiscales en cuanto a la distribución y control del presupuesto público para el sector cultural en el marco del ejercicio fiscal correspondiente.';
  const categoria = 'fiscal';
  const tipo = 'Otro';
  
  console.log('📄 DOCUMENTO ORIGINAL:');
  console.log(`Título: ${titulo}`);
  console.log(`Resumen: ${resumen.substring(0, 150)}...\n`);
  
  console.log('🤖 PASO 1 & 2: Generando copy social atractivo...\n');
  
  const copy = await generateSocialCopy(titulo, resumen, categoria, tipo);
  
  console.log('✨ COPY SOCIAL GENERADO:');
  console.log(`Headline: "${copy.headline}"`);
  console.log(`Tagline: "${copy.tagline}"`);
  console.log(`Dato impactante: ${copy.impactData || 'N/A'}`);
  console.log(`Concepto visual: ${copy.visualConcept}\n`);
  
  console.log('🎨 PASO 3: Generando prompt de imagen...\n');
  
  const imagePrompt = generateImagePrompt(copy, categoria);
  
  console.log('📝 PROMPT PARA VERTEX AI:');
  console.log(imagePrompt);
  console.log('\n=== Test completado ===');
}

testSocialCopy().catch(console.error);
