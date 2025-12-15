/**
 * Servicio de generación de imágenes hero para documentos del DOF
 * Usa Google Imagen 4 Fast para generar imágenes 1:1 informativas
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AREAS_ARRAY } from '@/lib/areas';

// Inicializar cliente de Gemini (será usado cuando se configure Vertex AI)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Mapa de colores por categoría (para prompts)
const CATEGORY_COLORS: Record<string, { primary: string; secondary: string; gradient: string }> = {
  fiscal: { 
    primary: '#3B82F6', 
    secondary: '#1E40AF',
    gradient: 'blue gradient from #3B82F6 to #1E40AF'
  },
  corporativo: { 
    primary: '#6366F1', 
    secondary: '#4338CA',
    gradient: 'indigo gradient from #6366F1 to #4338CA'
  },
  laboral: { 
    primary: '#F97316', 
    secondary: '#EA580C',
    gradient: 'orange gradient from #F97316 to #EA580C'
  },
  penal: { 
    primary: '#EF4444', 
    secondary: '#DC2626',
    gradient: 'red gradient from #EF4444 to #DC2626'
  },
  civil: { 
    primary: '#8B5CF6', 
    secondary: '#7C3AED',
    gradient: 'purple gradient from #8B5CF6 to #7C3AED'
  },
  mercantil: { 
    primary: '#06B6D4', 
    secondary: '#0891B2',
    gradient: 'cyan gradient from #06B6D4 to #0891B2'
  },
  administrativo: { 
    primary: '#64748B', 
    secondary: '#475569',
    gradient: 'slate gradient from #64748B to #475569'
  },
  constitucional: { 
    primary: '#DC2626', 
    secondary: '#B91C1C',
    gradient: 'rose gradient from #DC2626 to #B91C1C'
  },
  bancario: { 
    primary: '#0891B2', 
    secondary: '#0E7490',
    gradient: 'sky gradient from #0891B2 to #0E7490'
  },
  ambiental: { 
    primary: '#10B981', 
    secondary: '#059669',
    gradient: 'emerald gradient from #10B981 to #059669'
  },
  default: { 
    primary: '#6B7280', 
    secondary: '#4B5563',
    gradient: 'gray gradient from #6B7280 to #4B5563'
  },
};

interface GenerateImageParams {
  titulo: string;
  tipo_documento: string;
  fecha_publicacion: string;
  areas_detectadas: string[];
  edicion?: string;
}

interface GenerateImageResult {
  success: boolean;
  imageBase64?: string;
  error?: string;
  prompt?: string;
}

/**
 * Extrae palabras clave del título (máximo 3 palabras más relevantes)
 */
function extractKeywords(titulo: string): string {
  // Remover palabras comunes
  const stopWords = [
    'el', 'la', 'los', 'las', 'de', 'del', 'al', 'a', 'en', 'por', 'para', 
    'con', 'que', 'se', 'su', 'sus', 'un', 'una', 'unos', 'unas',
    'mediante', 'relativo', 'relativa', 'acuerdo', 'decreto', 'ley',
    'reglamento', 'circular', 'resolución', 'aviso', 'fe', 'erratas'
  ];

  const words = titulo
    .toLowerCase()
    .replace(/[^\w\sáéíóúñ]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));

  // Tomar las 3 primeras palabras significativas
  return words.slice(0, 3).join(' ').toUpperCase();
}

/**
 * Obtiene información de la categoría principal
 */
function getPrimaryCategory(areas_detectadas: string[]) {
  if (!areas_detectadas || areas_detectadas.length === 0) {
    return {
      codigo: 'default',
      emoji: '📄',
      nombre: 'General',
      colors: CATEGORY_COLORS.default
    };
  }

  const primaryCode = areas_detectadas[0];
  const area = AREAS_ARRAY.find(a => a.codigo === primaryCode);
  
  return {
    codigo: primaryCode,
    emoji: area?.emoji || '📄',
    nombre: area?.nombre || 'General',
    colors: CATEGORY_COLORS[primaryCode] || CATEGORY_COLORS.default
  };
}

/**
 * Genera el prompt para Imagen 4 Fast
 */
function generatePrompt(params: GenerateImageParams): string {
  const keywords = extractKeywords(params.titulo);
  const category = getPrimaryCategory(params.areas_detectadas);
  const fecha = new Date(params.fecha_publicacion).toLocaleDateString('es-MX', { 
    day: '2-digit', 
    month: 'short' 
  }).toUpperCase();

  // Prompt optimizado para imagen hero 1:1 (1024x1024)
  const prompt = `
Create a modern, minimalist legal document hero image with these exact specifications:

LAYOUT (1:1 square, 1024x1024):
- Top 30%: Clean ${category.colors.gradient} background
- Middle 40%: Large centered emoji "${category.emoji}" (size: 200px)
- Bottom 30%: White background with text

TEXT CONTENT:
- Main text (centered, bold, 48px): "${keywords}"
- Category label (centered, 32px): "${category.nombre}"
- Bottom metadata (centered, 24px): "${fecha} • ${params.tipo_documento}"

STYLE:
- Ultra clean and professional
- Minimalist design
- High contrast text
- Subtle geometric patterns in background
- Modern sans-serif typography
- Legal/government aesthetic
- No photos, no people, no complex illustrations
- Flat design with subtle shadows

COLOR PALETTE:
- Primary: ${category.colors.primary}
- Secondary: ${category.colors.secondary}
- Text: #1F2937 (dark gray)
- Background: White and gradient

COMPOSITION:
- Perfectly centered elements
- Generous whitespace
- Balanced visual hierarchy
- Instagram-style modern look
- Professional but eye-catching
`.trim();

  return prompt;
}

/**
 * Genera imagen usando Google Imagen 4 Fast
 */
export async function generateDocumentImage(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  try {
    console.log(`Generando imagen para: ${params.titulo.substring(0, 50)}...`);

    // Generar prompt
    const prompt = generatePrompt(params);
    console.log('Prompt generado:', prompt.substring(0, 100) + '...');

    // Usar el modelo Imagen 4 Fast (gemini-2.0-flash-exp con imagen)
    // Nota: Google Gemini API no tiene acceso directo a Imagen 4 Fast
    // Necesitamos usar Vertex AI o la API específica de Imagen
    // Por ahora, usaremos un placeholder y documentaremos la integración correcta

    // TODO: Implementar integración con Vertex AI Imagen 4 Fast
    // Por ahora, retornamos un placeholder para testing
    
    console.warn('⚠️ Imagen 4 Fast requiere Vertex AI - usando placeholder');
    
    return {
      success: false,
      error: 'Imagen 4 Fast requiere configuración de Vertex AI',
      prompt
    };

    // Código de ejemplo para cuando se configure Vertex AI:
    /*
    const model = genAI.getGenerativeModel({ 
      model: 'imagen-4-fast',
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
      }
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['image'],
        outputFormat: 'image/png',
        aspectRatio: '1:1',
        numberOfImages: 1,
      }
    });

    const imageData = result.response.candidates[0].content.parts[0].inlineData;
    
    return {
      success: true,
      imageBase64: imageData.data,
      prompt
    };
    */
  } catch (error) {
    console.error('Error generando imagen:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Genera imagen usando alternativa temporal (Canvas/SVG en el servidor)
 * Esta es una solución temporal hasta configurar Vertex AI
 */
export async function generateDocumentImageFallback(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  try {
    console.log(`Generando imagen fallback para: ${params.titulo.substring(0, 50)}...`);

    const keywords = extractKeywords(params.titulo);
    const category = getPrimaryCategory(params.areas_detectadas);
    const fecha = new Date(params.fecha_publicacion).toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: 'short' 
    }).toUpperCase();

    // Generar SVG programáticamente
    const svg = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <!-- Gradiente de fondo -->
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${category.colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${category.colors.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Fondo superior con gradiente -->
        <rect width="1024" height="307" fill="url(#grad)"/>
        
        <!-- Fondo inferior blanco -->
        <rect y="307" width="1024" height="717" fill="white"/>
        
        <!-- Emoji grande centrado -->
        <text x="512" y="450" font-size="200" text-anchor="middle" dominant-baseline="middle">
          ${category.emoji}
        </text>
        
        <!-- Palabras clave -->
        <text x="512" y="600" font-size="48" font-weight="bold" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif">
          ${keywords}
        </text>
        
        <!-- Categoría -->
        <text x="512" y="680" font-size="32" text-anchor="middle" fill="#4B5563" font-family="Arial, sans-serif">
          ${category.nombre}
        </text>
        
        <!-- Separador -->
        <line x1="362" y1="750" x2="662" y2="750" stroke="#E5E7EB" stroke-width="2"/>
        
        <!-- Metadata -->
        <text x="512" y="820" font-size="24" text-anchor="middle" fill="#6B7280" font-family="Arial, sans-serif">
          ${fecha} • ${params.tipo_documento}
        </text>
      </svg>
    `.trim();

    // Convertir SVG a base64
    const svgBase64 = Buffer.from(svg).toString('base64');

    return {
      success: true,
      imageBase64: svgBase64,
      prompt: `Fallback SVG para ${params.titulo}`
    };
  } catch (error) {
    console.error('Error generando imagen fallback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Función principal que intenta Imagen 4 Fast y hace fallback a SVG
 */
export async function generateDocumentImageWithFallback(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  // Intentar con Imagen 4 Fast
  const result = await generateDocumentImage(params);
  
  // Si falla, usar fallback SVG
  if (!result.success) {
    console.log('Usando fallback SVG...');
    return await generateDocumentImageFallback(params);
  }
  
  return result;
}
