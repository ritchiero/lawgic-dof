import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SocialCopy {
  headline: string;        // Hook principal (corto, impactante)
  tagline: string;         // Contexto explicativo (1-2 líneas)
  impactData?: string;     // Dato numérico destacable si existe
  visualConcept: string;   // Concepto visual para la imagen
}

/**
 * Genera copy atractivo para redes sociales a partir de un documento legal
 * 
 * PASO 1: Análisis profundo
 * - ¿De qué trata?
 * - ¿Cuál es el impacto?
 * - ¿Qué números son relevantes?
 * 
 * PASO 2: Copywriting atractivo
 * - Headline con hook
 * - Tagline explicativo
 * - Ángulo de interés humano
 */
export async function generateSocialCopy(
  titulo: string,
  resumen: string,
  categoria: string,
  tipo: string
): Promise<SocialCopy> {
  try {
    const prompt = `Eres un experto en copywriting para redes sociales y comunicación de documentos legales.

Tu trabajo es transformar documentos legales aburridos en contenido atractivo y viral.

DOCUMENTO:
- Título: ${titulo}
- Resumen: ${resumen}
- Categoría: ${categoria}
- Tipo: ${tipo}

PROCESO DE ANÁLISIS:

1. ANÁLISIS PROFUNDO:
   - ¿De qué trata realmente este documento?
   - ¿Cuál es el impacto en la vida real de las personas?
   - ¿Qué números o datos son impactantes?
   - ¿A quién afecta directamente?

2. COPYWRITING ATRACTIVO:
   - Crea un HEADLINE corto y provocador (máximo 60 caracteres)
   - Puede ser una pregunta provocadora o un dato impactante
   - Debe generar curiosidad o sorpresa
   
   - Crea un TAGLINE explicativo (máximo 120 caracteres)
   - Debe dar contexto relevante
   - Debe conectar con el interés humano

3. DATOS IMPACTANTES:
   - Extrae números relevantes (presupuesto, personas afectadas, etc.)
   - Formatea de manera atractiva (ej: "15,000 Millones")

EJEMPLOS DE TRANSFORMACIÓN:

❌ Aburrido: "Calendario de Presupuesto autorizado al Ramo 48 Cultura"
✅ Atractivo: 
   Headline: "15,000 Millones para la Cultura"
   Tagline: "Así se distribuirá el presupuesto oficial en 2026"
   Dato: "15,000 MDP"

❌ Aburrido: "Acuerdo por el que se modifica el diverso que establece..."
✅ Atractivo:
   Headline: "¿Cuánto cuesta tu trámite ahora?"
   Tagline: "El gobierno acaba de actualizar los costos oficiales"
   Dato: "Nuevas tarifas 2026"

❌ Aburrido: "Convenio de Coordinación para construcción de infraestructura"
✅ Atractivo:
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
 */
export function generateImagePrompt(copy: SocialCopy, categoria: string): string {
  const baseStyle = `Modern social media post design, 1024x1024 square, glassmorphism style.
Professional and institutional look with attractive gradients.
High quality, eye-catching, shareable content.`;

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

MAIN CONTENT (centered, prominent):
- Large bold headline: "${copy.headline}"
- Subtitle below: "${copy.tagline}"
${copy.impactData ? `- Featured data badge: "${copy.impactData}"` : ''}

VISUAL ELEMENTS:
- Glassmorphic card with frosted glass effect
- Soft glowing borders
- Relevant icons for: ${copy.visualConcept}
- Mexican government seal or institutional elements
- Modern, clean typography
- Professional but attractive design

STYLE:
- Instagram/social media ready
- Eye-catching but institutional
- Modern glassmorphism aesthetic
- Soft shadows and glows
- Professional color palette
- High contrast text for readability

NO text other than the specified headline and tagline.
Make it look like a professional government social media post that people would want to share.`;
}
