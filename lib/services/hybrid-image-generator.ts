/**
 * Generador de imágenes híbridas: Foto IA de fondo + Texto HTML overlay
 * Usa DALL-E 3 para generar fondos fotográficos realistas
 * Compone el texto con HTML/CSS para garantizar perfección
 */

import OpenAI from 'openai';
import { analyzeTitle, generatePhotoPrompt } from './semantic-analyzer';
import { createCanvas, loadImage, registerFont } from 'canvas';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface HybridImageOptions {
  titulo: string;
  resumen: string;
  tipo_documento: string;
  fecha_publicacion: any;
  areas_detectadas?: string[];
  social_headline?: string;
  social_tagline?: string;
  social_impact_data?: string;
}

export interface HybridImageResult {
  success: boolean;
  imageBase64?: string;
  error?: string;
  metadata?: {
    backgroundPrompt: string;
    entity?: string;
    theme?: string;
    confidence: string;
  };
}

/**
 * Genera una imagen híbrida con fondo fotográfico de IA y texto HTML
 */
export async function generateHybridImage(
  options: HybridImageOptions
): Promise<HybridImageResult> {
  try {
    console.log('🎨 Generando imagen híbrida...');
    console.log(`   Título: ${options.titulo.substring(0, 60)}...`);

    // 1. Analizar título para generar prompt fotográfico
    const analysis = analyzeTitle(options.titulo);
    const photoPrompt = generatePhotoPrompt(options.titulo, options.areas_detectadas?.[0]);
    
    console.log(`   📸 Entidad detectada: ${analysis.entity || 'ninguna'}`);
    console.log(`   🏷️  Tema detectado: ${analysis.theme || 'ninguno'}`);
    console.log(`   🎯 Confianza: ${analysis.confidence}`);
    console.log(`   📝 Prompt: ${photoPrompt.substring(0, 100)}...`);

    // 2. Generar fondo fotográfico con DALL-E 3
    console.log('   🤖 Generando fondo con DALL-E 3...');
    const dalleResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: photoPrompt,
      n: 1,
      size: '1792x1024', // Landscape para redes sociales
      quality: 'standard',
      response_format: 'url',
    });

    const backgroundUrl = dalleResponse.data[0]?.url;
    if (!backgroundUrl) {
      throw new Error('DALL-E no retornó URL de imagen');
    }

    console.log('   ✅ Fondo generado exitosamente');

    // 3. Descargar imagen de fondo
    const backgroundResponse = await fetch(backgroundUrl);
    const backgroundBuffer = Buffer.from(await backgroundResponse.arrayBuffer());

    // 4. Componer imagen con texto overlay
    console.log('   🖼️  Componiendo imagen con texto...');
    const finalImage = await composeImageWithText(backgroundBuffer, {
      titulo: options.titulo,
      resumen: options.resumen || options.social_tagline || '',
      fecha: formatDate(options.fecha_publicacion),
      categoria: options.areas_detectadas?.[0] || options.tipo_documento,
    });

    console.log('   ✅ Imagen híbrida completada');

    return {
      success: true,
      imageBase64: finalImage.toString('base64'),
      metadata: {
        backgroundPrompt: photoPrompt,
        entity: analysis.entity,
        theme: analysis.theme,
        confidence: analysis.confidence,
      },
    };

  } catch (error) {
    console.error('❌ Error generando imagen híbrida:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Compone la imagen final: fondo + overlay de texto con Canvas
 */
async function composeImageWithText(
  backgroundBuffer: Buffer,
  textData: {
    titulo: string;
    resumen: string;
    fecha: string;
    categoria: string;
  }
): Promise<Buffer> {
  const WIDTH = 1792;
  const HEIGHT = 1024;

  // Crear canvas
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 1. Dibujar fondo
  const backgroundImage = await loadImage(backgroundBuffer);
  ctx.drawImage(backgroundImage, 0, 0, WIDTH, HEIGHT);

  // 2. Aplicar overlay oscuro para mejorar legibilidad
  const gradient = ctx.createLinearGradient(0, HEIGHT * 0.5, 0, HEIGHT);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 3. Configurar texto
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';

  // 4. Dibujar categoría/badge
  const badgeY = HEIGHT - 420;
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#3b82f6'; // Azul
  const badgeText = textData.categoria.toUpperCase();
  const badgeWidth = ctx.measureText(badgeText).width + 40;
  ctx.fillRect(60, badgeY, badgeWidth, 40);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(badgeText, 80, badgeY + 10);

  // 5. Dibujar título (EXACTO del DOF, sin modificar)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px sans-serif';
  const titleY = badgeY + 70;
  const titleLines = wrapText(ctx, textData.titulo, WIDTH - 120, 52);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 60, titleY + (index * 65));
  });

  // 6. Dibujar resumen
  ctx.font = '32px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  const resumeY = titleY + (titleLines.length * 65) + 30;
  const resumeLines = wrapText(ctx, textData.resumen, WIDTH - 120, 32);
  resumeLines.slice(0, 2).forEach((line, index) => {
    ctx.fillText(line, 60, resumeY + (index * 45));
  });

  // 7. Dibujar metadata (fecha, tiempo de lectura)
  ctx.font = '24px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const metaY = HEIGHT - 80;
  ctx.fillText(`📅 ${textData.fecha}  •  ⏱️ 1 min`, 60, metaY);

  // Convertir a buffer
  return canvas.toBuffer('image/png');
}

/**
 * Divide texto en líneas que caben en el ancho especificado
 */
function wrapText(
  ctx: any,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Formatea fecha para display
 */
function formatDate(fecha: any): string {
  if (!fecha) return 'Fecha no disponible';
  
  try {
    let date: Date;
    
    if (fecha._seconds) {
      // Firestore Timestamp
      date = new Date(fecha._seconds * 1000);
    } else if (fecha.toDate) {
      // Firestore Timestamp con método toDate()
      date = fecha.toDate();
    } else if (typeof fecha === 'string') {
      date = new Date(fecha);
    } else {
      date = new Date(fecha);
    }

    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
}

/**
 * Genera imagen con retry logic
 */
export async function generateHybridImageWithRetry(
  options: HybridImageOptions,
  maxRetries: number = 3
): Promise<HybridImageResult> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n🔄 Intento ${attempt}/${maxRetries}`);
    
    const result = await generateHybridImage(options);
    
    if (result.success) {
      return result;
    }

    lastError = result.error || 'Unknown error';
    console.log(`   ❌ Falló: ${lastError}`);

    if (attempt < maxRetries) {
      const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`   ⏳ Esperando ${waitTime/1000}s antes de reintentar...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`,
  };
}
