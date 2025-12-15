/**
 * Servicio de generación de imágenes con Vertex AI Imagen 4 Fast
 * Costo: $0.02 por imagen
 * Latencia: ~2-3 segundos
 */

import { GoogleAuth } from 'google-auth-library';
import { VERTEX_AI_CONFIG, IMAGE_GENERATION_CONFIG, buildImagePrompt } from '../vertex-ai-config';
import { generateSocialCopy, generateImagePrompt, type SocialCopy } from './social-copywriter';

/**
 * Cliente de autenticación de Google Cloud (inicialización lazy)
 */
let _auth: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
  if (!_auth) {
    _auth = new GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID!,
        private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID!,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL!,
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID!,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }
  return _auth;
}

/**
 * Genera una imagen con Vertex AI Imagen 4 Fast usando copy social atractivo
 */
export async function generateImageWithVertexAI(params: {
  categoria: string;
  titulo: string;
  tipo: string;
  documentoId: string;
  resumen?: string;
}): Promise<{ buffer: Buffer | null; copy?: SocialCopy }> {
  try {
    const { categoria, titulo, tipo, documentoId, resumen } = params;
    
    console.log(`[Vertex AI] Generando imagen para documento: ${documentoId}`);
    console.log(`[Vertex AI] Categoría: ${categoria}, Tipo: ${tipo}`);
    
    // PASO 1 & 2: Generar copy social atractivo
    let socialCopy: SocialCopy | undefined;
    let prompt: string;
    
    if (resumen) {
      console.log(`[Vertex AI] Generando copy social...`);
      socialCopy = await generateSocialCopy(titulo, resumen, categoria, tipo);
      console.log(`[Vertex AI] Headline: ${socialCopy.headline}`);
      console.log(`[Vertex AI] Tagline: ${socialCopy.tagline}`);
      
      // PASO 3: Generar prompt de imagen con el copy
      prompt = generateImagePrompt(socialCopy, categoria);
    } else {
      // Fallback: usar prompt original
      prompt = buildImagePrompt({ categoria, titulo, tipo });
    }
    
    console.log(`[Vertex AI] Prompt: ${prompt.substring(0, 100)}...`);
    
    // Obtener token de acceso
    const client = await getAuth().getClient();
    const accessToken = await client.getAccessToken();
    
    if (!accessToken.token) {
      throw new Error('No se pudo obtener access token');
    }
    
    // Endpoint de Vertex AI
    const endpoint = `https://${VERTEX_AI_CONFIG.location}-aiplatform.googleapis.com/v1/projects/${VERTEX_AI_CONFIG.projectId}/locations/${VERTEX_AI_CONFIG.location}/publishers/google/models/${VERTEX_AI_CONFIG.model}:predict`;
    
    // Request body
    const requestBody = {
      instances: [
        {
          prompt: prompt,
        },
      ],
      parameters: {
        sampleCount: IMAGE_GENERATION_CONFIG.sampleCount,
        aspectRatio: IMAGE_GENERATION_CONFIG.aspectRatio,
        safetyFilterLevel: IMAGE_GENERATION_CONFIG.safetyFilterLevel,
        personGeneration: IMAGE_GENERATION_CONFIG.personGeneration,
      },
    };
    
    // Hacer request a Vertex AI
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Vertex AI] Error: ${response.status} - ${errorText}`);
      throw new Error(`Vertex AI request failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Extraer imagen base64
    if (!result.predictions || result.predictions.length === 0) {
      console.error('[Vertex AI] No se generaron imágenes');
      return { buffer: null, copy: socialCopy };
    }
    
    const prediction = result.predictions[0];
    const imageBase64 = prediction.bytesBase64Encoded;
    
    if (!imageBase64) {
      console.error('[Vertex AI] No se encontró imagen en la respuesta');
      return { buffer: null, copy: socialCopy };
    }
    
    // Convertir base64 a Buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    console.log(`[Vertex AI] Imagen generada exitosamente: ${imageBuffer.length} bytes`);
    
    return { buffer: imageBuffer, copy: socialCopy };
    
  } catch (error) {
    console.error('[Vertex AI] Error generando imagen:', error);
    return { buffer: null, copy: undefined };
  }
}

/**
 * Genera imagen con fallback a imagen de categoría
 */
export async function generateImageWithFallback(params: {
  categoria: string;
  titulo: string;
  tipo: string;
  documentoId: string;
  resumen?: string;
}): Promise<{ buffer: Buffer | null; isGenerated: boolean; copy?: SocialCopy }> {
  // Intentar generar con Vertex AI (con copy social si hay resumen)
  const result = await generateImageWithVertexAI(params);
  
  if (result.buffer) {
    return { buffer: result.buffer, isGenerated: true, copy: result.copy };
  }
  
  // Fallback: usar imagen de categoría estática
  console.log(`[Vertex AI] Fallback a imagen de categoría para: ${params.documentoId}`);
  return { buffer: null, isGenerated: false, copy: result.copy };
}
