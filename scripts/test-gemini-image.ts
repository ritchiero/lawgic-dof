/**
 * Script de prueba para Gemini 3 Pro Image
 * Genera una imagen de prueba y la guarda localmente
 */

import { generateDocumentImageWithRetry } from '../lib/services/gemini-image-generator';
import * as fs from 'fs';
import * as path from 'path';

// Datos de prueba (documento real del feed)
const testDocument = {
  titulo: 'ACUERDO por el que se da a conocer el Programa de Trabajo de la Comisión de Presupuesto y Cuenta Pública para el Segundo Periodo de Sesiones del Tercer Año de Ejercicio de la LXV Legislatura',
  resumen: 'La Cámara de Diputados publica el programa de trabajo de la Comisión de Presupuesto y Cuenta Pública para el segundo periodo de sesiones del tercer año de ejercicio de la LXV Legislatura.',
  tipo_documento: 'Acuerdo',
  fecha_publicacion: '2025-12-08',
  areas_detectadas: ['fiscal', 'administrativo'],
  social_headline: '¿A dónde va el dinero público en 2026?',
  social_tagline: 'Descubre el programa de trabajo de la Comisión de Presupuesto para fiscalizar el gasto federal',
  social_impact_data: 'Presupuesto 2026'
};

async function main() {
  console.log('🚀 Iniciando prueba de Gemini 3 Pro Image...\n');

  // Verificar variables de entorno
  console.log('📋 Verificando configuración:');
  console.log(`  GOOGLE_CLOUD_PROJECT_ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID ? '✓' : '✗'}`);
  console.log(`  GOOGLE_CLOUD_PRIVATE_KEY: ${process.env.GOOGLE_CLOUD_PRIVATE_KEY ? '✓' : '✗'}`);
  console.log(`  GOOGLE_CLOUD_CLIENT_EMAIL: ${process.env.GOOGLE_CLOUD_CLIENT_EMAIL ? '✓' : '✗'}`);
  console.log('');

  if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
    console.error('❌ Error: GOOGLE_CLOUD_PROJECT_ID no está configurado');
    process.exit(1);
  }

  console.log('📄 Documento de prueba:');
  console.log(`  Título: ${testDocument.titulo.substring(0, 80)}...`);
  console.log(`  Headline: ${testDocument.social_headline}`);
  console.log(`  Tagline: ${testDocument.social_tagline}`);
  console.log(`  Categoría: ${testDocument.areas_detectadas[0]}`);
  console.log('');

  console.log('🎨 Generando imagen...\n');
  const startTime = Date.now();

  try {
    const result = await generateDocumentImageWithRetry(testDocument);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Tiempo de generación: ${duration}s`);

    if (result.success && result.imageBase64) {
      console.log('✅ Imagen generada exitosamente!');
      
      // Guardar imagen
      const outputDir = path.join(process.cwd(), 'test-output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const imagePath = path.join(outputDir, `gemini-test-${timestamp}.png`);
      
      // Convertir base64 a buffer y guardar
      const imageBuffer = Buffer.from(result.imageBase64, 'base64');
      fs.writeFileSync(imagePath, imageBuffer);
      
      console.log(`💾 Imagen guardada en: ${imagePath}`);
      console.log(`📊 Tamaño: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
      
      // Guardar prompt también
      if (result.prompt) {
        const promptPath = path.join(outputDir, `gemini-test-${timestamp}-prompt.txt`);
        fs.writeFileSync(promptPath, result.prompt);
        console.log(`📝 Prompt guardado en: ${promptPath}`);
      }

      console.log('\n✅ PRUEBA EXITOSA');
      console.log('Verifica la imagen generada para confirmar:');
      console.log('  1. ✓ Texto en español perfectamente renderizado');
      console.log('  2. ✓ Headline y tagline legibles');
      console.log('  3. ✓ Diseño atractivo tipo Instagram/LinkedIn');
      console.log('  4. ✓ Escudo nacional de México visible');
      console.log('  5. ✓ Badge de categoría en esquina');

    } else {
      console.error('❌ Error generando imagen:', result.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
}

main();
