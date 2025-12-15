/**
 * Servicio de almacenamiento de imágenes hero en Firebase Storage
 */

import { storage } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

interface UploadImageParams {
  imageBase64: string;
  documentId: string;
  format?: 'png' | 'svg';
}

interface UploadImageResult {
  success: boolean;
  publicUrl?: string;
  storagePath?: string;
  error?: string;
}

/**
 * Sube una imagen a Firebase Storage
 */
export async function uploadDocumentImage(
  params: UploadImageParams
): Promise<UploadImageResult> {
  try {
    const { imageBase64, documentId, format = 'png' } = params;

    // Generar nombre único para la imagen
    const fileName = `${documentId}.${format}`;
    const storagePath = `document-images/${fileName}`;

    console.log(`Subiendo imagen a: ${storagePath}`);

    // Convertir base64 a buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Crear referencia al archivo
    const file = storage.bucket().file(storagePath);

    // Subir archivo
    await file.save(imageBuffer, {
      metadata: {
        contentType: format === 'svg' ? 'image/svg+xml' : 'image/png',
        cacheControl: 'public, max-age=31536000', // Cache por 1 año
      },
    });

    // Hacer el archivo público
    await file.makePublic();

    // Obtener URL pública
    const publicUrl = `https://storage.googleapis.com/${storage.bucket().name}/${storagePath}`;

    console.log(`✅ Imagen subida exitosamente: ${publicUrl}`);

    return {
      success: true,
      publicUrl,
      storagePath,
    };
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Elimina una imagen de Firebase Storage
 */
export async function deleteDocumentImage(storagePath: string): Promise<boolean> {
  try {
    const file = storage.bucket().file(storagePath);
    await file.delete();
    console.log(`✅ Imagen eliminada: ${storagePath}`);
    return true;
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    return false;
  }
}

/**
 * Verifica si una imagen existe en Firebase Storage
 */
export async function imageExists(storagePath: string): Promise<boolean> {
  try {
    const file = storage.bucket().file(storagePath);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    console.error('Error verificando imagen:', error);
    return false;
  }
}

/**
 * Obtiene la URL pública de una imagen
 */
export function getPublicImageUrl(storagePath: string): string {
  return `https://storage.googleapis.com/${storage.bucket().name}/${storagePath}`;
}

/**
 * Genera y sube imagen para un documento
 * Esta es la función principal que combina generación + upload
 */
export async function generateAndUploadDocumentImage(params: {
  documentId: string;
  titulo: string;
  tipo_documento: string;
  fecha_publicacion: string;
  areas_detectadas: string[];
  edicion?: string;
}): Promise<UploadImageResult> {
  try {
    // Importar dinámicamente para evitar problemas de dependencias circulares
    const { generateDocumentImageWithFallback } = await import('./image-generator');

    // Generar imagen
    console.log(`Generando imagen para documento ${params.documentId}...`);
    const imageResult = await generateDocumentImageWithFallback({
      titulo: params.titulo,
      tipo_documento: params.tipo_documento,
      fecha_publicacion: params.fecha_publicacion,
      areas_detectadas: params.areas_detectadas,
      edicion: params.edicion,
    });

    if (!imageResult.success || !imageResult.imageBase64) {
      return {
        success: false,
        error: imageResult.error || 'No se pudo generar la imagen',
      };
    }

    // Determinar formato (SVG si es fallback, PNG si es Imagen 4)
    const format = imageResult.prompt?.includes('Fallback SVG') ? 'svg' : 'png';

    // Subir imagen
    const uploadResult = await uploadDocumentImage({
      imageBase64: imageResult.imageBase64,
      documentId: params.documentId,
      format,
    });

    return uploadResult;
  } catch (error) {
    console.error('Error en generateAndUploadDocumentImage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
