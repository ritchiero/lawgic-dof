/**
 * Servicio de generación de imágenes con DALL-E 3
 * Costo: $0.04 por imagen (1024x1024)
 * Latencia: ~10-15 segundos
 */

import OpenAI from 'openai';
import { generateSocialCopy, generateImagePrompt, type SocialCopy } from './social-copywriter';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Genera una imagen con DALL-E 3 usando copy social atractivo
 */
export async function generateImageWithDALLE3(params: {
  categoria: string;
  titulo: string;
  tipo: string;
  documentoId: string;
  resumen?: string;
}): Promise<{ buffer: Buffer | null; copy?: SocialCopy }> {
  try {
    const { categoria, titulo, tipo, documentoId, resumen } = params;
    
    console.log(`[DALL-E 3] Generando imagen para documento: ${documentoId}`);
    console.log(`[DALL-E 3] Categoría: ${categoria}, Tipo: ${tipo}`);
    
    // PASO 1 & 2: Generar copy social atractivo
    let socialCopy: SocialCopy | undefined;
    let prompt: string;
    
    if (resumen) {
      console.log(`[DALL-E 3] Generando copy social...`);
      socialCopy = await generateSocialCopy(titulo, resumen, categoria, tipo);
      console.log(`[DALL-E 3] Headline: ${socialCopy.headline}`);
      console.log(`[DALL-E 3] Tagline: ${socialCopy.tagline}`);
      
      // PASO 3: Generar prompt de imagen con el copy
      prompt = generateImagePrompt(socialCopy, categoria);
    } else {
      // Fallback: usar prompt básico
      prompt = `Modern social media background for Mexican government document about ${categoria}. 
Dark gradient background, glassmorphism style, professional and eye-catching. 
NO TEXT - background only for text overlay.`;
    }
    
    console.log(`[DALL-E 3] Prompt: ${prompt.substring(0, 150)}...`);
    
    // Generar imagen con DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard', // 'standard' o 'hd' (hd cuesta $0.08)
      style: 'vivid', // 'vivid' o 'natural'
    });
    
    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No se recibió URL de imagen de DALL-E 3');
    }
    
    console.log(`[DALL-E 3] Imagen generada: ${imageUrl}`);
    
    // Descargar la imagen
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Error descargando imagen: ${imageResponse.statusText}`);
    }
    
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`[DALL-E 3] ✓ Imagen descargada (${buffer.length} bytes)`);
    
    return {
      buffer,
      copy: socialCopy,
    };
  } catch (error) {
    console.error('[DALL-E 3] Error generando imagen:', error);
    
    return {
      buffer: null,
      copy: undefined,
    };
  }
}

/**
 * Genera una imagen con DALL-E 3 y maneja fallback a imagen estática
 */
export async function generateImageWithFallback(params: {
  categoria: string;
  titulo: string;
  tipo: string;
  documentoId: string;
  resumen?: string;
}): Promise<{ buffer: Buffer | null; copy?: SocialCopy; usedFallback: boolean }> {
  try {
    // Intentar generar con DALL-E 3
    const result = await generateImageWithDALLE3(params);
    
    if (result.buffer) {
      return {
        ...result,
        usedFallback: false,
      };
    }
    
    // Si falla, usar fallback (imagen estática)
    console.log(`[DALL-E 3] Usando fallback para ${params.documentoId}`);
    
    return {
      buffer: null,
      copy: result.copy,
      usedFallback: true,
    };
  } catch (error) {
    console.error('[DALL-E 3] Error en generateImageWithFallback:', error);
    
    return {
      buffer: null,
      copy: undefined,
      usedFallback: true,
    };
  }
}
