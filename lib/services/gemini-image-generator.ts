/**
 * Servicio de generación de imágenes usando Gemini 3 Pro Image (Nano Banana Pro)
 * Genera posts de redes sociales con texto perfectamente integrado
 * Usa Vertex AI REST API directamente con google-auth-library
 */

import { GoogleAuth } from 'google-auth-library';
import { AREAS_ARRAY } from '@/lib/areas';

// Mapa de colores por categoría
const CATEGORY_COLORS: Record<string, { primary: string; secondary: string; description: string }> = {
  fiscal: { 
    primary: '#4A148C', 
    secondary: '#880E4F',
    description: 'Rich deep purple to dark burgundy gradient, vibrant and saturated'
  },
  corporativo: { 
    primary: '#283593', 
    secondary: '#4A148C',
    description: 'Deep indigo to rich purple gradient, scholarly and elegant'
  },
  laboral: { 
    primary: '#0D47A1', 
    secondary: '#00695C',
    description: 'Deep navy blue to dark teal gradient, bold and professional'
  },
  penal: { 
    primary: '#B71C1C', 
    secondary: '#E65100',
    description: 'Intense dark red to deep orange gradient, dramatic and serious'
  },
  civil: { 
    primary: '#4A148C', 
    secondary: '#6A1B9A',
    description: 'Deep purple to rich violet gradient, elegant and authoritative'
  },
  mercantil: { 
    primary: '#1B5E20', 
    secondary: '#00695C',
    description: 'Dark forest green to rich emerald gradient, strong and trustworthy'
  },
  administrativo: { 
    primary: '#1565C0', 
    secondary: '#0277BD',
    description: 'Vibrant royal blue to deep sky blue gradient, institutional and modern'
  },
  constitucional: { 
    primary: '#B71C1C', 
    secondary: '#C62828',
    description: 'Deep red gradient, authoritative and constitutional'
  },
  bancario: { 
    primary: '#F57F17', 
    secondary: '#E65100',
    description: 'Rich gold to deep amber gradient, valuable and premium'
  },
  ambiental: { 
    primary: '#2E7D32', 
    secondary: '#558B2F',
    description: 'Rich forest green to vibrant lime gradient, natural and fresh'
  },
  default: { 
    primary: '#1565C0', 
    secondary: '#0277BD',
    description: 'Blue gradient, professional and clean'
  },
};

export interface GenerateImageParams {
  titulo: string;
  resumen: string;
  tipo_documento: string;
  fecha_publicacion: string;
  areas_detectadas: string[];
  social_headline?: string;
  social_tagline?: string;
  social_impact_data?: string;
}

export interface GenerateImageResult {
  success: boolean;
  imageBase64?: string;
  error?: string;
  prompt?: string;
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
 * Genera el prompt optimizado para Gemini 3 Pro Image
 */
function generatePrompt(params: GenerateImageParams): string {
  const category = getPrimaryCategory(params.areas_detectadas);
  const fecha = new Date(params.fecha_publicacion).toLocaleDateString('es-MX', { 
    day: '2-digit', 
    month: 'short',
    year: 'numeric'
  });

  // Usar social copy si está disponible, sino usar título/resumen
  const headline = params.social_headline || params.titulo.substring(0, 60);
  const tagline = params.social_tagline || params.resumen.substring(0, 100);
  const impactData = params.social_impact_data;

  const prompt = `Create a visually striking social media post for a Mexican legal document.

DESIGN STYLE:
- Instagram/LinkedIn professional post
- Modern glassmorphism aesthetic
- ${category.colors.description}
- 1:1 square format (1024x1024)
- High contrast, bold and eye-catching
- Professional government social media aesthetic

TEXT CONTENT (MUST BE PERFECTLY RENDERED IN SPANISH):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADLINE (large, bold, white text):
"${headline}"

TAGLINE (medium size, white text):
"${tagline}"
${impactData ? `\nIMPACT DATA BADGE (highlighted):
"${impactData}"` : ''}

CATEGORY (top-right badge):
"${category.emoji} ${category.nombre.toUpperCase()}"

DATE (bottom metadata):
"${fecha}"

FOOTER (small text):
"DOF - Diario Oficial de la Federación"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VISUAL COMPOSITION:
1. Background: Dark, saturated ${category.colors.description}
2. Center: Large glassmorphic card with frosted glass effect
3. Borders: Bright glowing edges with neon-like highlights
4. Icon: Mexican coat of arms (Escudo Nacional de México) prominently displayed
5. Geometric shapes: Modern abstract elements
6. Category badge: Top-right corner with ${category.emoji} emoji
7. Shadows: Dramatic depth with multiple layers

TYPOGRAPHY REQUIREMENTS:
- Headline: 60-80pt, bold, white with strong shadow for contrast
- Tagline: 24-32pt, white, excellent readability
- All text MUST be in Spanish
- All text MUST be perfectly spelled (no errors like "en la en la")
- Text MUST be HIGH CONTRAST and READABLE
- Use modern sans-serif fonts (like Montserrat, Inter, or Poppins)

CRITICAL REQUIREMENTS:
✓ ALL text must be in Spanish and perfectly spelled
✓ Text must be integrated into the image (not overlaid)
✓ Design must be complete and ready to post
✓ Must look like a premium government social media post
✓ High contrast for mobile viewing
✓ Professional but bold and shareable

Create a complete, production-ready social media post that transforms this legal document into viral-worthy content.`;

  return prompt;
}

/**
 * Obtiene access token para Vertex AI usando google-auth-library
 */
async function getAccessToken(): Promise<string> {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL,
      private_key: (process.env.GOOGLE_CLOUD_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  
  if (!accessToken.token) {
    throw new Error('No se pudo obtener access token');
  }

  return accessToken.token;
}

/**
 * Genera imagen usando Gemini 3 Pro Image vía Vertex AI REST API
 */
export async function generateDocumentImage(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  try {
    console.log(`🎨 Generando imagen con Gemini 3 Pro Image para: ${params.titulo.substring(0, 50)}...`);

    // Generar prompt optimizado
    const prompt = generatePrompt(params);
    console.log('📝 Prompt generado (primeras 200 chars):', prompt.substring(0, 200) + '...');

    // Obtener access token
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtenido');

    // Construir URL de Vertex AI
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = 'global'; // Gemini 3 Pro Image solo está disponible en global endpoint
    const model = 'gemini-3-pro-image-preview';
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

    // Hacer request a Vertex AI
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: '1:1',
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error de Vertex AI:', errorText);
      throw new Error(`Vertex AI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta recibida de Vertex AI');

    // Extraer imagen de la respuesta
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            console.log(`✅ Imagen generada con mimeType: ${part.inlineData.mimeType}`);
            
            return {
              success: true,
              imageBase64: part.inlineData.data,
              prompt
            };
          }
        }
      }
    }

    // Si no se generó imagen
    console.error('❌ No se generó imagen en la respuesta');
    return {
      success: false,
      error: 'No se generó imagen en la respuesta de Gemini',
      prompt
    };

  } catch (error) {
    console.error('❌ Error generando imagen con Gemini 3 Pro Image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Genera imagen con retry logic
 */
export async function generateDocumentImageWithRetry(
  params: GenerateImageParams,
  maxRetries: number = 2
): Promise<GenerateImageResult> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 Intento ${attempt}/${maxRetries}...`);
    
    const result = await generateDocumentImage(params);
    
    if (result.success) {
      console.log(`✅ Imagen generada exitosamente en intento ${attempt}`);
      return result;
    }
    
    lastError = result.error;
    
    if (attempt < maxRetries) {
      // Esperar antes de reintentar (backoff exponencial)
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Esperando ${waitTime}ms antes de reintentar...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  console.error(`❌ Falló después de ${maxRetries} intentos`);
  return {
    success: false,
    error: lastError || 'Error desconocido después de múltiples intentos'
  };
}
