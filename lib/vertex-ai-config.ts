/**
 * Vertex AI Configuration for Imagen 4 Fast
 * Generación de imágenes on-demand para documentos del DOF
 */

export const VERTEX_AI_CONFIG = {
  projectId: 'lawgic-dof',
  location: 'us-central1', // Región con soporte para Imagen 4
  model: 'imagen-4.0-fast-generate-001', // Modelo más rápido y económico
};

/**
 * Configuración de generación de imágenes
 */
export const IMAGE_GENERATION_CONFIG = {
  // Aspect ratio 1:1 (cuadrado) para las tarjetas del feed
  aspectRatio: '1:1',
  
  // Número de imágenes a generar por documento
  sampleCount: 1,
  
  // Configuración de seguridad (filtros de contenido)
  safetyFilterLevel: 'block_only_high',
  
  // Configuración de persona (para consistencia)
  personGeneration: 'dont_allow',
  
  // Formato de salida
  mimeType: 'image/png',
  
  // Tamaño de imagen (1024x1024 para 1:1)
  outputSize: 1024,
};

/**
 * Template de prompt para generación de imágenes
 */
export function buildImagePrompt(params: {
  categoria: string;
  titulo: string;
  tipo: string;
}): string {
  const { categoria, titulo, tipo } = params;
  
  // Extraer palabras clave del título (máximo 3-4 palabras)
  const palabrasClave = extractKeywords(titulo);
  
  // Color base según categoría
  const colorBase = getCategoryColor(categoria);
  
  return `
Soft neomorphism UI illustration for legal document, 1024x1024 square.
Very light ${colorBase}-gray background with subtle gradient.
Central minimalist abstract composition with geometric shapes.
Small floating card elements in corners with subtle depth.
Monochromatic style with VERY SUBTLE ${colorBase} color hints.
Clean, minimal, elegant. 80% empty space for text overlay.
NO TEXT, NO WORDS, NO LETTERS.
Soft lighting, no harsh contrasts.
Premium corporate aesthetic.
Style: Modern, professional, abstract, clean.
Theme: ${categoria} - ${tipo}
`.trim();
}

/**
 * Extrae palabras clave del título
 */
function extractKeywords(titulo: string): string[] {
  // Palabras comunes a ignorar
  const stopWords = ['de', 'la', 'el', 'los', 'las', 'del', 'al', 'en', 'por', 'para', 'con', 'que', 'se', 'y', 'a'];
  
  const palabras = titulo
    .toLowerCase()
    .split(/\s+/)
    .filter(p => p.length > 3 && !stopWords.includes(p))
    .slice(0, 4);
  
  return palabras;
}

/**
 * Obtiene el color base según la categoría
 */
function getCategoryColor(categoria: string): string {
  const colorMap: Record<string, string> = {
    'Fiscal y Tributario': 'blue',
    'Laboral y Seguridad Social': 'orange',
    'Penal y Procesal Penal': 'red',
    'Ambiental y Recursos Naturales': 'green',
    'Corporativo y Mercantil': 'purple',
    'Administrativo': 'gray',
    'Civil y Familiar': 'lavender',
    'Constitucional y Amparo': 'rose',
  };
  
  return colorMap[categoria] || 'blue';
}
