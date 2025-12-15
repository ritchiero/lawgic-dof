/**
 * Generador de imágenes híbridas usando Sharp + SVG
 * Foto IA de fondo (DALL-E 3) + Texto overlay (SVG)
 */

import sharp from 'sharp';
import { analyzeTitle, generatePhotoPrompt } from './semantic-analyzer';

// Lazy initialization para OpenAI
let openaiClient: any = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const OpenAI = require('openai');
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

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
 * Genera una imagen híbrida con fondo fotográfico de IA y texto SVG
 */
export async function generateHybridImage(
  options: HybridImageOptions
): Promise<HybridImageResult> {
  try {
    console.log('🎨 Generando imagen híbrida con Sharp...');
    console.log(`   Título: ${options.titulo.substring(0, 60)}...`);

    // 1. Analizar título para generar prompt fotográfico
    const analysis = analyzeTitle(options.titulo);
    const photoPrompt = generatePhotoPrompt(options.titulo, options.areas_detectadas?.[0]);
    
    console.log(`   📸 Entidad detectada: ${analysis.entity || 'ninguna'}`);
    console.log(`   🏷️  Tema detectado: ${analysis.theme || 'ninguno'}`);
    console.log(`   🎯 Confianza: ${analysis.confidence}`);

    // 2. Generar fondo fotográfico con DALL-E 3
    console.log('   🤖 Generando fondo con DALL-E 3...');
    const openai = getOpenAIClient();
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

    // 4. Componer imagen con texto overlay usando Sharp + SVG
    console.log('   🖼️  Componiendo imagen con texto...');
    const finalImage = await composeImageWithSharp(backgroundBuffer, {
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
 * Compone la imagen final usando Sharp con overlay SVG
 */
async function composeImageWithSharp(
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

  // Preparar texto (truncar si es muy largo)
  const tituloLines = wrapText(textData.titulo, 70); // ~70 chars por línea
  const tituloText = tituloLines.slice(0, 3).join('\n'); // Máximo 3 líneas
  
  const resumenLines = wrapText(textData.resumen, 90);
  const resumenText = resumenLines.slice(0, 2).join('\n'); // Máximo 2 líneas

  // Crear SVG con el texto
  const svgOverlay = `
    <svg width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="50%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(0,0,0,0.3);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.85);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Gradient overlay para legibilidad -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#gradient)" />
      
      <!-- Badge de categoría -->
      <rect x="60" y="${HEIGHT - 420}" width="${textData.categoria.length * 15 + 40}" height="40" fill="#3b82f6" rx="4" />
      <text x="80" y="${HEIGHT - 392}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">
        ${escapeXml(textData.categoria.toUpperCase())}
      </text>
      
      <!-- Título (EXACTO del DOF) -->
      ${tituloText.split('\n').map((line, i) => `
        <text x="60" y="${HEIGHT - 330 + (i * 65)}" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="white">
          ${escapeXml(line)}
        </text>
      `).join('')}
      
      <!-- Resumen -->
      ${resumenText.split('\n').map((line, i) => `
        <text x="60" y="${HEIGHT - 330 + (tituloLines.length * 65) + 30 + (i * 45)}" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.9)">
          ${escapeXml(line)}
        </text>
      `).join('')}
      
      <!-- Metadata (fecha, tiempo de lectura) -->
      <text x="60" y="${HEIGHT - 80}" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)">
        📅 ${escapeXml(textData.fecha)}  •  ⏱️ 1 min
      </text>
    </svg>
  `;

  // Componer imagen: fondo + SVG overlay
  const finalImage = await sharp(backgroundBuffer)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .composite([{
      input: Buffer.from(svgOverlay),
      top: 0,
      left: 0,
    }])
    .png()
    .toBuffer();

  return finalImage;
}

/**
 * Divide texto en líneas que caben en el ancho especificado (aproximado por caracteres)
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    
    if (testLine.length > maxChars && currentLine) {
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
 * Escapa caracteres especiales para XML/SVG
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formatea fecha para display
 */
function formatDate(fecha: any): string {
  if (!fecha) return 'Fecha no disponible';
  
  try {
    let date: Date;
    
    if (fecha._seconds) {
      date = new Date(fecha._seconds * 1000);
    } else if (fecha.toDate) {
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
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`   ⏳ Esperando ${waitTime/1000}s antes de reintentar...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`,
  };
}
