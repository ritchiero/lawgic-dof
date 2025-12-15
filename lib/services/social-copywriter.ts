/**
 * Servicio de copywriting social para generar headlines y taglines atractivos
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SocialCopy {
  headline: string;
  tagline: string;
  impactData?: string;
  visualConcept: string;
}

/**
 * Genera copy social atractivo para un documento legal
 */
export async function generateSocialCopy(
  titulo: string,
  resumen: string,
  categoria: string,
  tipo: string
): Promise<SocialCopy> {
  try {
    const prompt = `Eres un experto en copywriting para redes sociales. Tu tarea es transformar documentos legales aburridos en contenido viral y atractivo.

DOCUMENTO:
Título: ${titulo}
Resumen: ${resumen}
Categoría: ${categoria}
Tipo: ${tipo}

TAREA:
Crea un HEADLINE y TAGLINE atractivos que:
1. Generen curiosidad (usa preguntas provocadoras)
2. Sean relevantes para la vida real de las personas
3. Destaquen números o datos impactantes si los hay
4. Sean cortos y compartibles en redes sociales

EJEMPLOS:
1. Documento sobre presupuesto de cultura
   Headline: "¿A dónde va el dinero de la cultura en 2026?"
   Tagline: "Descubre cómo se distribuirá el presupuesto público para impulsar el arte y la cultura"
   Dato: "Más de 15 mil millones de pesos"

2. Documento sobre prohibición de contratar empresa
   Headline: "¿Por qué nadie puede contratar a esta empresa?"
   Tagline: "Gobierno federal prohíbe contratos con empresa por incumplimientos"
   Dato: null

3. Documento sobre nueva carretera
   Headline: "Nueva carretera en camino"
   Tagline: "Gobierno federal firma acuerdo para conectar dos estados"
   Dato: "Inversión millonaria"

INSTRUCCIONES:
- El HEADLINE debe ser corto, impactante y generar curiosidad
- El TAGLINE debe explicar el contexto de manera clara
- Si hay números relevantes, extráelos y formátealos
- Usa lenguaje cercano, no técnico
- Piensa en qué haría que alguien comparta esto en redes sociales

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "headline": "texto del headline",
  "tagline": "texto del tagline",
  "impactData": "dato numérico formateado o null",
  "visualConcept": "descripción breve del concepto visual (ej: 'dinero y cultura', 'carretera y conexión', 'documentos y costos')"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en copywriting para redes sociales. Respondes ÚNICAMENTE con JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Más creatividad
      max_tokens: 500,
    });

    const content = response.choices[0].message.content?.trim() || '{}';
    
    // Extraer JSON del contenido (por si viene con markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    
    const result = JSON.parse(jsonStr);

    return {
      headline: result.headline || titulo.substring(0, 60),
      tagline: result.tagline || resumen.substring(0, 120),
      impactData: result.impactData || undefined,
      visualConcept: result.visualConcept || categoria,
    };
  } catch (error) {
    console.error('Error generando copy social:', error);
    
    // Fallback: usar título y resumen originales
    return {
      headline: titulo.substring(0, 60),
      tagline: resumen.substring(0, 120),
      visualConcept: categoria,
    };
  }
}

/**
 * Genera un prompt para Vertex AI Imagen basado en el copy social
 * IMPORTANTE: Solo genera fondo visual, el texto se renderiza con CSS
 */
export function generateImagePrompt(copy: SocialCopy, categoria: string): string {
  const baseStyle = `Modern social media background design, 1024x1024 square, glassmorphism style.
Professional and institutional look with attractive gradients.
High quality, eye-catching background for text overlay.
NO TEXT - background only, text will be added via CSS overlay.`;

  const colorSchemes: Record<string, string> = {
    fiscal: 'Deep purple to burgundy gradient background',
    laboral: 'Navy blue to teal gradient background',
    mercantil: 'Forest green to emerald gradient background',
    administrativo: 'Royal blue to sky blue gradient background',
    penal: 'Dark red to orange gradient background',
    ambiental: 'Green to lime gradient background',
    salud: 'Cyan to blue gradient background',
    educacion: 'Indigo to purple gradient background',
    tecnologia: 'Electric blue to cyan gradient background',
    financiero: 'Gold to amber gradient background',
  };

  const gradient = colorSchemes[categoria] || 'Blue to purple gradient background';

  return `${baseStyle}

${gradient}

VISUAL ELEMENTS (NO TEXT):
- Glassmorphic card with frosted glass effect in the center
- Soft glowing borders and neon-like edges
- Relevant abstract icons for: ${copy.visualConcept}
- Mexican government seal (Escudo Nacional) subtly placed
- Geometric shapes and modern design elements
- Professional but attractive background design

STYLE:
- Instagram/social media ready background
- Eye-catching but institutional
- Modern glassmorphism aesthetic with depth
- Soft shadows, glows, and light effects
- Professional color palette
- Clean, minimal, ready for text overlay

IMPORTANT: 
- NO TEXT AT ALL - this is a background image only
- Leave central area clear for text overlay
- Focus on visual aesthetics and institutional branding
- Create depth with layers and transparency
Make it look like a professional government social media background that will have text overlaid via CSS.`;
}
