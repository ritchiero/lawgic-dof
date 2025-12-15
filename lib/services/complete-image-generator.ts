/**
 * Generador de imágenes completas con DALL-E 3
 * Fondo fotográfico + Texto overlay en una sola generación
 */

import { generateCompleteImagePrompt } from './semantic-analyzer';

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

export interface CompleteImageOptions {
  titulo: string;
  resumen: string;
  tipo_documento: string;
  fecha_publicacion: any;
  areas_detectadas?: string[];
  social_headline?: string;
  social_tagline?: string;
  social_impact_data?: string;
}

export interface CompleteImageResult {
  success: boolean;
  imageBase64?: string;
  error?: string;
  metadata?: {
    prompt: string;
    promptLength: number;
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
 * Genera una imagen completa con DALL-E 3 (fondo + texto)
 */
export async function generateCompleteImage(
  options: CompleteImageOptions
): Promise<CompleteImageResult> {
  try {
    console.log('🎨 Generando imagen completa con DALL-E 3...');
    console.log(`   Título: ${options.titulo.substring(0, 60)}...`);

    // Preparar datos para el prompt
    const fecha = formatDate(options.fecha_publicacion);
    const categoria = options.areas_detectadas?.[0] || options.tipo_documento;
    const resumen = options.resumen || options.social_tagline || options.social_headline || 'Documento oficial del Diario Oficial de la Federación';

    // Generar prompt completo
    const prompt = generateCompleteImagePrompt(
      options.titulo,
      resumen,
      fecha,
      categoria
    );

    console.log(`   📝 Prompt length: ${prompt.length} characters`);
    console.log(`   📸 Categoría: ${categoria}`);

    // Generar imagen con DALL-E 3
    console.log('   🤖 Generando con DALL-E 3...');
    const openai = getOpenAIClient();
    
    const dalleResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024', // Landscape para redes sociales
      quality: 'standard', // 'hd' para mejor calidad pero más caro
      response_format: 'url',
    });

    const imageUrl = dalleResponse.data[0]?.url;
    if (!imageUrl) {
      throw new Error('DALL-E no retornó URL de imagen');
    }

    console.log('   ✅ Imagen generada exitosamente');

    // Descargar imagen
    console.log('   📥 Descargando imagen...');
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const imageBase64 = imageBuffer.toString('base64');

    console.log(`   ✅ Imagen descargada (${Math.round(imageBuffer.length / 1024)} KB)`);

    return {
      success: true,
      imageBase64,
      metadata: {
        prompt,
        promptLength: prompt.length,
      },
    };

  } catch (error) {
    console.error('❌ Error generando imagen completa:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Genera imagen con retry logic
 */
export async function generateCompleteImageWithRetry(
  options: CompleteImageOptions,
  maxRetries: number = 3
): Promise<CompleteImageResult> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n🔄 Intento ${attempt}/${maxRetries}`);
    
    const result = await generateCompleteImage(options);
    
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
