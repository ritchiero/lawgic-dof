/**
 * Generador híbrido: DALL-E 3 para foto de fondo + Sharp para texto overlay
 * Enfoque correcto: Foto realista sin texto + Composición con Sharp
 */

import sharp from 'sharp';
import { generatePhotoBackgroundPrompt } from './semantic-analyzer';

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

export interface PhotoOverlayOptions {
  titulo: string;
  resumen: string;
  tipo_documento: string;
  fecha_publicacion: any;
  areas_detectadas?: string[];
  social_headline?: string;
  social_tagline?: string;
  social_impact_data?: string;
}

export interface PhotoOverlayResult {
  success: boolean;
  imageBase64?: string;
  error?: string;
  metadata?: {
    photoPrompt: string;
    entity?: string;
  };
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
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
}

/**
 * Divide texto en líneas que caben en el ancho especificado
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
 * Genera imagen híbrida: foto de fondo + texto overlay
 */
export async function generatePhotoWithOverlay(
  options: PhotoOverlayOptions
): Promise<PhotoOverlayResult> {
  try {
    console.log('🎨 Generando imagen híbrida (foto + overlay)...');
    console.log(`   Título: ${options.titulo.substring(0, 60)}...`);

    const categoria = options.areas_detectadas?.[0] || options.tipo_documento;

    // 1. Generar prompt para SOLO foto de fondo (sin texto)
    const photoPrompt = generatePhotoBackgroundPrompt(options.titulo, categoria);
    
    console.log(`   📸 Categoría: ${categoria}`);
    console.log(`   📝 Generando foto de fondo (sin texto)...`);

    // 2. Generar foto de fondo con DALL-E 3
    const openai = getOpenAIClient();
    const dalleResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: photoPrompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      response_format: 'url',
    });

    const photoUrl = dalleResponse.data[0]?.url;
    if (!photoUrl) {
      throw new Error('DALL-E no retornó URL de imagen');
    }

    console.log('   ✅ Foto de fondo generada');

    // 3. Descargar foto de fondo
    const photoResponse = await fetch(photoUrl);
    const photoBuffer = Buffer.from(await photoResponse.arrayBuffer());

    // 4. Componer con texto overlay usando Sharp + SVG
    console.log('   🖼️  Componiendo texto overlay...');
    
    const fecha = formatDate(options.fecha_publicacion);
    const resumen = options.resumen || options.social_tagline || options.social_headline || '';

    const finalImage = await composeWithSharp(photoBuffer, {
      titulo: options.titulo,
      resumen,
      fecha,
      categoria,
    });

    console.log('   ✅ Imagen híbrida completada');

    return {
      success: true,
      imageBase64: finalImage.toString('base64'),
      metadata: {
        photoPrompt,
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
 * Compone imagen con Sharp + SVG overlay
 */
async function composeWithSharp(
  photoBuffer: Buffer,
  textData: {
    titulo: string;
    resumen: string;
    fecha: string;
    categoria: string;
  }
): Promise<Buffer> {
  const WIDTH = 1792;
  const HEIGHT = 1024;

  // Preparar texto
  const tituloLines = wrapText(textData.titulo, 70);
  const tituloText = tituloLines.slice(0, 3).join('\n');
  
  const resumenLines = wrapText(textData.resumen, 90);
  const resumenText = resumenLines.slice(0, 2).join('\n');

  // Crear SVG con texto overlay
  const svgOverlay = `
    <svg width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="50%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(0,0,0,0.3);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.85);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Gradient overlay -->
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
      
      <!-- Metadata -->
      <text x="60" y="${HEIGHT - 80}" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)">
        📅 ${escapeXml(textData.fecha)}  •  ⏱️ 1 min
      </text>
    </svg>
  `;

  // Componer: foto + SVG overlay
  const finalImage = await sharp(photoBuffer)
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
 * Genera imagen con retry logic
 */
export async function generatePhotoWithOverlayRetry(
  options: PhotoOverlayOptions,
  maxRetries: number = 3
): Promise<PhotoOverlayResult> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n🔄 Intento ${attempt}/${maxRetries}`);
    
    const result = await generatePhotoWithOverlay(options);
    
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
