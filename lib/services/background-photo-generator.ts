/**
 * Generador de fotos de fondo con DALL-E 3
 * Solo genera la foto, sin texto. El frontend compone el overlay.
 */

import { generateIntelligentPhotoPrompt } from './intelligent-semantic-analyzer';

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

export interface BackgroundPhotoOptions {
  titulo: string;
  resumen?: string;
  categoria?: string;
}

export interface BackgroundPhotoResult {
  success: boolean;
  photoUrl?: string;
  photoBase64?: string;
  error?: string;
  metadata?: {
    prompt: string;
    mainTopic?: string;
    entities?: string[];
    reasoning?: string;
  };
}

/**
 * Genera una foto de fondo con DALL-E 3 (sin texto)
 */
export async function generateBackgroundPhoto(
  options: BackgroundPhotoOptions
): Promise<BackgroundPhotoResult> {
  try {
    console.log('📸 Generando foto de fondo con DALL-E 3...');
    console.log(`   Título: ${options.titulo.substring(0, 60)}...`);
    console.log(`   Categoría: ${options.categoria || 'general'}`);

    // Generar prompt inteligente con GPT-4o-mini
    const { prompt, analysis } = await generateIntelligentPhotoPrompt(
      options.titulo,
      options.resumen
    );
    
    console.log(`   🧠 Tema principal: ${analysis.mainTopic}`);
    console.log(`   📝 Prompt: ${prompt.substring(0, 100)}...`);

    // Generar foto con DALL-E 3
    const openai = getOpenAIClient();
    const dalleResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024', // Landscape para redes sociales
      quality: 'standard',
      response_format: 'url',
    });

    const photoUrl = dalleResponse.data[0]?.url;
    if (!photoUrl) {
      throw new Error('DALL-E no retornó URL de imagen');
    }

    console.log('   ✅ Foto de fondo generada');

    // Descargar y convertir a base64
    console.log('   📥 Descargando foto...');
    const photoResponse = await fetch(photoUrl);
    const photoBuffer = Buffer.from(await photoResponse.arrayBuffer());
    const photoBase64 = photoBuffer.toString('base64');

    console.log(`   ✅ Foto descargada (${Math.round(photoBuffer.length / 1024)} KB)`);

    return {
      success: true,
      photoUrl,
      photoBase64,
      metadata: {
        prompt,
        mainTopic: analysis.mainTopic,
        entities: analysis.entities,
        reasoning: analysis.reasoning,
      },
    };

  } catch (error) {
    console.error('❌ Error generando foto de fondo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Genera foto con retry logic
 */
export async function generateBackgroundPhotoWithRetry(
  options: BackgroundPhotoOptions,
  maxRetries: number = 3
): Promise<BackgroundPhotoResult> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n🔄 Intento ${attempt}/${maxRetries}`);
    
    const result = await generateBackgroundPhoto(options);
    
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
