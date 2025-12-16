/**
 * Servicio de generación de imágenes con DALL-E 3
 * Ahora usa análisis semántico inteligente para generar fotos temáticas/simbólicas
 * Costo: ~$0.08 por imagen (análisis GPT-4o-mini + DALL-E 3)
 * Latencia: ~25-35 segundos
 */

import { generateBackgroundPhoto, BackgroundPhotoResult } from './background-photo-generator';
import { generateSocialCopy, type SocialCopy } from './social-copywriter';

/**
 * Genera una imagen con DALL-E 3 usando análisis semántico inteligente
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
    console.log(`[DALL-E 3] Título: ${titulo.substring(0, 80)}...`);
    
    // PASO 1: Generar copy social (para metadata)
    let socialCopy: SocialCopy | undefined;
    if (resumen) {
      console.log(`[DALL-E 3] Generando copy social...`);
      socialCopy = await generateSocialCopy(titulo, resumen, categoria, tipo);
      console.log(`[DALL-E 3] Headline: ${socialCopy.headline}`);
    }
    
    // PASO 2: Generar imagen con análisis inteligente
    console.log(`[DALL-E 3] Usando análisis semántico inteligente...`);
    const result: BackgroundPhotoResult = await generateBackgroundPhoto({
      titulo,
      resumen,
      categoria,
    });
    
    if (!result.success || !result.photoBase64) {
      throw new Error(result.error || 'No se pudo generar la imagen');
    }
    
    console.log(`[DALL-E 3] ✓ Imagen generada con análisis inteligente`);
    console.log(`[DALL-E 3]   Tema: ${result.metadata?.mainTopic}`);
    console.log(`[DALL-E 3]   Entidades: ${result.metadata?.entities?.join(', ')}`);
    
    // Convertir base64 a Buffer
    const buffer = Buffer.from(result.photoBase64, 'base64');
    
    console.log(`[DALL-E 3] ✓ Imagen lista (${buffer.length} bytes)`);
    
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
    // Intentar generar con DALL-E 3 + análisis inteligente
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
