/**
 * Servicio de copywriting social para generar headlines y taglines atractivos
 */

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

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

    const response = await getOpenAI().chat.completions.create({
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
 * Genera un prompt para DALL-E 3 basado en el copy social
 * IMPORTANTE: Genera post completo con texto integrado
 */
export function generateImagePrompt(copy: SocialCopy, categoria: string): string {
  const baseStyle = `Create a complete Instagram/social media post image, 1024x1024 square.
Modern glassmorphism style with integrated text.
Professional Mexican government social media post.
MUST include all text in Spanish, perfectly spelled.`;

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

TEXT CONTENT (MUST BE INCLUDED IN IMAGE):
- Main Headline (large, bold): "${copy.headline}"
- Tagline (medium size): "${copy.tagline}"
${copy.impactData ? `- Impact Data Badge: "${copy.impactData}"` : ''}
- Category indicator: "${categoria.toUpperCase()}"
- Small text at bottom: "DOF - Diario Oficial de la Federación"

VISUAL DESIGN:
- DARK, saturated ${gradient}
- Glassmorphic card with frosted glass effect in center
- Bright glowing borders with neon-like edges
- Relevant icons for: ${copy.visualConcept}
- Mexican government seal (Escudo Nacional de México) prominently displayed
- Geometric shapes and modern design elements
- Professional but BOLD and eye-catching design

TYPOGRAPHY REQUIREMENTS:
- Headline: Very large (60-80pt), bold, white text with shadow
- Tagline: Medium (24-32pt), white text, good contrast
- All text must be in SPANISH
- All text must be PERFECTLY SPELLED (no typos)
- Text must be READABLE and HIGH CONTRAST against background
- Use modern sans-serif fonts

STYLE:
- Instagram/TikTok/LinkedIn ready
- Eye-catching but institutional
- Modern glassmorphism aesthetic
- Dramatic shadows and glows
- Professional color palette
- Must look like a real government social media post

CRITICAL:
- ALL text must be in Spanish and perfectly spelled
- Design must be complete and ready to post
- No placeholder text or lorem ipsum
- Must include Mexican government branding
Create a complete, professional Mexican government social media post that looks premium and shareable.`;
}
