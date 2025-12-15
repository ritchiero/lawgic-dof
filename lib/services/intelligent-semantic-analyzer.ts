/**
 * Analizador semántico inteligente con GPT-4o-mini
 * Entiende el contexto completo del documento para generar descripciones fotográficas precisas
 */

// Lazy initialization para OpenAI
let openaiClient: any = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const OpenAI = require('openai');
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface IntelligentAnalysisResult {
  mainTopic: string;
  entities: string[];
  photoDescription: string;
  reasoning: string;
}

/**
 * Analiza un título del DOF usando GPT-4o-mini para entender el contexto
 */
export async function analyzeWithAI(
  titulo: string,
  resumen?: string
): Promise<IntelligentAnalysisResult> {
  try {
    console.log('🧠 Analizando con GPT-4o-mini...');
    console.log(`   Título: ${titulo.substring(0, 80)}...`);

    const openai = getOpenAIClient();

    const systemPrompt = `Eres un editor fotográfico de NYTimes o Reuters que selecciona fotos REALISTAS y SOBRIAS para acompañar noticias serias.

Tu tarea es:
1. Leer y entender el título del documento del DOF
2. Identificar el TEMA PRINCIPAL (no temas administrativos secundarios)
3. Generar una descripción de FOTO DOCUMENTAL realista y creible

CRITERIOS ESTRICTOS:
❌ EVITAR:
- Festivales coloridos exagerados
- Multitudes masivas
- Escenas "de postal" o turísticas
- Imágenes "vibrantes" o "coloridas" en exceso
- Estereotipos culturales exagerados
- Cualquier cosa que parezca "stock photo genérico"

✅ BUSCAR:
- Fotos REALISTAS, sobrias, documentales
- Escenas cotidianas normales
- 2-4 personas máximo (no multitudes)
- Iluminación natural, ambiente real
- Edificios icónicos reconocibles (cuando aplique)
- Estilo: Photojournalism serio de NYTimes/Reuters/AP
- Credibilidad periodística

Ejemplos de BUEN estilo (realista y sobrio):

Título: "Calendario de Presupuesto autorizado al Ramo 48 Cultura"
Tema: Cultura y patrimonio
Foto: "Professional documentary photograph of Palacio de Bellas Artes in Mexico City, iconic cultural landmark, daytime exterior view, architectural photography, realistic lighting, photojournalism style"

Título: "Acuerdo del INE sobre proceso electoral"
Tema: Elecciones
Foto: "Professional documentary photograph of Mexican ballot box at polling station, single voter casting vote, electoral process, realistic indoor lighting, photojournalism style"

Título: "Resolución sobre instituciones de crédito"
Tema: Sistema bancario
Foto: "Professional documentary photograph of modern bank branch in Mexico City, professional banker at desk, corporate interior, business photography, realistic lighting"

Título: "Decreto sobre educación pública"
Tema: Educación
Foto: "Professional documentary photograph of Mexican public school classroom, teacher explaining at whiteboard, 3-4 students listening, educational setting, natural lighting, photojournalism style"

Título: "Norma sobre seguridad laboral"
Tema: Seguridad en el trabajo
Foto: "Professional documentary photograph of Mexican construction worker wearing safety helmet and vest, industrial workplace, occupational safety, realistic daytime lighting, documentary style"

RECUERDA: Fotos REALISTAS, SOBRIAS, CREIBLES - como las que usaría NYTimes para una noticia seria.`

    const userPrompt = `Analiza este documento del DOF:

TÍTULO: ${titulo}
${resumen ? `\nRESUMEN: ${resumen}` : ''}

Responde en formato JSON:
{
  "mainTopic": "tema principal en español",
  "entities": ["entidad1", "entidad2"],
  "photoDescription": "descripción fotográfica en inglés para DALL-E",
  "reasoning": "breve explicación de por qué elegiste este tema"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Baja temperatura para análisis consistente
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    console.log(`   ✅ Tema principal: ${result.mainTopic}`);
    console.log(`   📸 Foto: ${result.photoDescription.substring(0, 60)}...`);

    return {
      mainTopic: result.mainTopic || 'Documento gubernamental',
      entities: result.entities || [],
      photoDescription: result.photoDescription || 'Professional photograph of Mexican government building',
      reasoning: result.reasoning || 'Análisis automático',
    };

  } catch (error) {
    console.error('❌ Error en análisis con IA:', error);
    
    // Fallback a descripción genérica
    return {
      mainTopic: 'Documento gubernamental',
      entities: [],
      photoDescription: 'Professional photograph of Mexican government building, Palacio Nacional or official government architecture in Mexico City, institutional setting, daytime, professional lighting',
      reasoning: 'Fallback por error en análisis',
    };
  }
}

/**
 * Genera un prompt completo para DALL-E 3 usando análisis inteligente
 */
export async function generateIntelligentPhotoPrompt(
  titulo: string,
  resumen?: string
): Promise<{ prompt: string; analysis: IntelligentAnalysisResult }> {
  const analysis = await analyzeWithAI(titulo, resumen);

  const prompt = `${analysis.photoDescription}

IMPORTANT REQUIREMENTS:
- Professional photograph, high quality
- Realistic, photographic style (not illustration or graphic design)
- NO text, NO numbers, NO labels, NO overlays
- NO logos, NO watermarks, NO graphics
- Clean, uncluttered composition
- Suitable as background image for text overlay
- Natural lighting, professional photography
- Landscape orientation (1792x1024px)
- Institutional, formal aesthetic
- Mexican context and setting`;

  return { prompt, analysis };
}
