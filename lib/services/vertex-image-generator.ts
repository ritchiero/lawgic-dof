/**
 * Servicio de generación de imágenes con Vertex AI Imagen 4 Fast
 * Costo: $0.02 por imagen
 * Latencia: ~2-3 segundos
 */

import { GoogleAuth } from 'google-auth-library';
import { VERTEX_AI_CONFIG, IMAGE_GENERATION_CONFIG, buildImagePrompt } from '../vertex-ai-config';

/**
 * Cliente de autenticación de Google Cloud
 */
const auth = new GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID!,
    private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID!,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL!,
    client_id: process.env.GOOGLE_CLOUD_CLIENT_ID!,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLOUD_CLIENT_EMAIL!.replace('@', '%40')}`,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

/**
 * Genera una imagen con Vertex AI Imagen 4 Fast
 */
export async function generateImageWithVertexAI(params: {
  categoria: string;
  titulo: string;
  tipo: string;
  documentoId: string;
}): Promise<Buffer | null> {
  try {
    const { categoria, titulo, tipo, documentoId } = params;
    
    console.log(`[Vertex AI] Generando imagen para documento: ${documentoId}`);
    console.log(`[Vertex AI] Categoría: ${categoria}, Tipo: ${tipo}`);
    
    // Construir prompt
    const prompt = buildImagePrompt({ categoria, titulo, tipo });
    console.log(`[Vertex AI] Prompt: ${prompt.substring(0, 100)}...`);
    
    // Obtener token de acceso
    const client = await auth.getClient();
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
      return null;
    }
    
    const prediction = result.predictions[0];
    const imageBase64 = prediction.bytesBase64Encoded;
    
    if (!imageBase64) {
      console.error('[Vertex AI] No se encontró imagen en la respuesta');
      return null;
    }
    
    // Convertir base64 a Buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    console.log(`[Vertex AI] Imagen generada exitosamente: ${imageBuffer.length} bytes`);
    
    return imageBuffer;
    
  } catch (error) {
    console.error('[Vertex AI] Error generando imagen:', error);
    return null;
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
}): Promise<{ buffer: Buffer | null; isGenerated: boolean }> {
  // Intentar generar con Vertex AI
  const buffer = await generateImageWithVertexAI(params);
  
  if (buffer) {
    return { buffer, isGenerated: true };
  }
  
  // Fallback: usar imagen de categoría estática
  console.log(`[Vertex AI] Fallback a imagen de categoría para: ${params.documentoId}`);
  return { buffer: null, isGenerated: false };
}
