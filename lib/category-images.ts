/**
 * Configuración de imágenes de categorías
 * Mapea códigos de área a sus imágenes de fondo correspondientes
 */

export const CATEGORY_IMAGES: Record<string, string> = {
  fiscal: '/images/categories/fiscal.png',
  corporativo: '/images/categories/corporativo.png',
  laboral: '/images/categories/laboral.png',
  penal: '/images/categories/penal.png',
  civil: '/images/categories/civil.png',
  mercantil: '/images/categories/corporativo.png', // Reusar corporativo
  administrativo: '/images/categories/administrativo.png',
  constitucional: '/images/categories/constitucional.png',
  bancario: '/images/categories/fiscal.png', // Reusar fiscal
  ambiental: '/images/categories/ambiental.png',
  default: '/images/categories/administrativo.png',
};

/**
 * Obtiene la URL de la imagen para una categoría
 */
export function getCategoryImage(areaCodigo?: string): string {
  if (!areaCodigo) return CATEGORY_IMAGES.default;
  return CATEGORY_IMAGES[areaCodigo] || CATEGORY_IMAGES.default;
}

/**
 * Obtiene la URL de la imagen para un documento
 * Prioriza image_url del documento, luego imagen de categoría
 */
export function getDocumentImage(documento: any): string {
  // Si el documento tiene imagen personalizada, usarla
  if (documento.image_url) {
    return documento.image_url;
  }

  // Sino, usar imagen de categoría
  const primaryArea = documento.areas_detectadas?.[0];
  return getCategoryImage(primaryArea);
}
