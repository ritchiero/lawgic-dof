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
  step1?: string;
  step2?: string;
  step3?: string;
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

    const systemPrompt = `Eres un editor fotográfico de NYTimes. Tu trabajo es analizar títulos de noticias y decidir qué foto buscar en un banco de imágenes.

FORMATO JSON OBLIGATORIO - DEBES RETORNAR EXACTAMENTE ESTOS CAMPOS:
{
  "step1_whatIsItAbout": "string - de qué trata la noticia (institución/acción principal)",
  "step2_whatPhotoToSearch": "string - qué foto buscarías (escena específica)",
  "step3_photoDescription": "string - descripción en inglés para DALL-E",
  "mainTopic": "string - tema principal",
  "entities": ["array", "de", "entidades"]
}

PROCESO (3 pasos):

1. ¿DE QUÉ TRATA? (step1_whatIsItAbout)
   - Identifica la INSTITUCIÓN o ACCIÓN principal
   - Sé LITERAL y DIRECTO
   - Ejemplo: "La SCJN tuvo un acuerdo"

2. ¿QUÉ FOTO BUSCARÍAS? (step2_whatPhotoToSearch)
   - Piensa como editor periodístico
   - La escena MÁS OBVIA y ESPECÍFICA
   - Ejemplo: "Imágenes de la SCJN en sesiones"

3. DESCRIPCIÓN DE LA FOTO (step3_photoDescription)
   - Descripción EXACTA en inglés para DALL-E
   - Photojournalism documental, REALISTA
   - Ejemplo: "Professional photojournalism image of Mexican Supreme Court justices in session, documentary style"

EJEMPLO COMPLETO:
Título: "Acuerdo General número 19/2025 del Pleno de la Suprema Corte..."

RESPUESTA JSON:
{
  "step1_whatIsItAbout": "La SCJN tuvo un acuerdo",
  "step2_whatPhotoToSearch": "Imágenes de la SCJN en sesiones",
  "step3_photoDescription": "Professional photojournalism image of Mexican Supreme Court justices in session, ministers discussing at the courtroom, SCJN building interior, documentary style",
  "mainTopic": "Acuerdo SCJN",
  "entities": ["SCJN", "Suprema Corte"]
}

REGLAS:
- DEBES incluir los 5 campos: step1_whatIsItAbout, step2_whatPhotoToSearch, step3_photoDescription, mainTopic, entities
- SÉ DIRECTO Y LITERAL (no creativo)
- IDENTIFICA LA INSTITUCIÓN ESPECÍFICA (SCJN, INE, Cultura, etc.)
- BUSCA LA ESCENA MÁS OBVIA (sesión, edificio, proceso)
- Photojournalism documental, REALISTA, SOBRIO`;

    const userPrompt = `Analiza este documento del DOF y responde en JSON con los 5 campos obligatorios:

TÍTULO: ${titulo}
${resumen ? `\nRESUMEN: ${resumen}` : ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Baja temperatura para análisis consistente
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    console.log(`   ✅ Tema principal: ${result.mainTopic}`);
    const photoDesc = result.step3_photoDescription || result.photoDescription || '';
    if (photoDesc) {
      console.log(`   📸 Foto: ${photoDesc.substring(0, 60)}...`);
    }

    return {
      mainTopic: result.mainTopic || 'Documento gubernamental',
      entities: result.entities || [],
      photoDescription: result.step3_photoDescription || result.photoDescription || 'Professional photograph of Mexican government building',
      reasoning: result.step2_whatPhotoToSearch || result.reasoning || 'Análisis automático',
      step1: result.step1_whatIsItAbout,
      step2: result.step2_whatPhotoToSearch,
      step3: result.step3_photoDescription,
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
  
  const basePrompt = analysis.photoDescription;
  
  // Agregar requisitos técnicos
  const technicalRequirements = `

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

  const prompt = basePrompt + technicalRequirements;

  return { prompt, analysis };
}
