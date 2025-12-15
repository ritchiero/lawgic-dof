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
    fiscal: 'Rich deep purple (#4A148C) to dark burgundy (#880E4F) gradient, vibrant and saturated',
    laboral: 'Deep navy blue (#0D47A1) to dark teal (#00695C) gradient, bold and professional',
    mercantil: 'Dark forest green (#1B5E20) to rich emerald (#00695C) gradient, strong and trustworthy',
    administrativo: 'Vibrant royal blue (#1565C0) to deep sky blue (#0277BD) gradient, institutional and modern',
    penal: 'Intense dark red (#B71C1C) to deep orange (#E65100) gradient, dramatic and serious',
    ambiental: 'Rich forest green (#2E7D32) to vibrant lime (#558B2F) gradient, natural and fresh',
    salud: 'Deep cyan (#00838F) to rich blue (#01579B) gradient, clean and medical',
    educacion: 'Deep indigo (#283593) to rich purple (#4A148C) gradient, scholarly and elegant',
    tecnologia: 'Vibrant electric blue (#0277BD) to deep cyan (#00838F) gradient, modern and digital',
    financiero: 'Rich gold (#F57F17) to deep amber (#E65100) gradient, valuable and premium',
  };

  const gradient = colorSchemes[categoria] || 'Blue to purple gradient background';

  return `${baseStyle}

${gradient}

VISUAL ELEMENTS (NO TEXT):
- DARK, saturated gradient background (80-90% opacity, not washed out)
- Glassmorphic card with strong frosted glass effect in center (white overlay at 15-20% opacity)
- Bright glowing borders with neon-like edges (vibrant, not subtle)
- Relevant abstract icons for: ${copy.visualConcept} (bold, visible, not faded)
- Mexican government seal (Escudo Nacional) prominently placed (30-40% opacity, gold/white tint)
- Geometric shapes and modern design elements with HIGH contrast
- Professional but BOLD and eye-catching background design

STYLE REQUIREMENTS:
- DARK background (avoid light/pastel colors)
- HIGH CONTRAST between elements
- SATURATED colors (vibrant, not washed out)
- Instagram/TikTok/social media ready (must grab attention in feed)
- Eye-catching AND institutional
- Modern glassmorphism with STRONG depth and layers
- Dramatic shadows, bright glows, and light effects
- Professional but IMPACTFUL color palette
- Clean composition with clear focal area for text overlay

CRITICAL REQUIREMENTS:
- NO TEXT AT ALL - this is a background image only
- Background must be DARK enough for white text to pop
- Central area must have subtle vignette or overlay for text readability
- Must look premium, modern, and shareable on social media
- Avoid washed out or too light backgrounds
Create a BOLD, DARK, professional government social media background that commands attention and provides perfect contrast for white text overlay.`;
}
