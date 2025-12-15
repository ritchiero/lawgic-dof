import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

const AREAS_VALIDAS = [
  "fiscal", "corporativo", "laboral", "penal", "civil", "mercantil",
  "administrativo", "constitucional", "financiero", "ambiental",
  "inmobiliario", "familia", "propiedad_intelectual", "competencia",
  "comercio_exterior", "energia", "salud", "bursatil", "seguros",
  "procesal", "notarial", "agrario", "telecomunicaciones", "tecnologia",
  "consumidor", "migratorio", "electoral", "transporte", "maritimo",
  "construccion", "compliance", "sucesorio", "medios", "ciberseguridad",
  "internacional"
];

export interface ResultadoClasificacion {
  areas: string[];
  resumen: string;
}

export async function clasificarDocumento(
  titulo: string,
  extracto: string
): Promise<ResultadoClasificacion> {
  try {
    const prompt = `Analiza este documento del Diario Oficial de la Federación de México.

TÍTULO: ${titulo}

EXTRACTO:
${extracto.substring(0, 2000)}

---

Tu tarea:
1. Identificar las áreas del derecho mexicano que aplican a este documento.
2. Generar un resumen ejecutivo de 2-3 oraciones para abogados.

Áreas válidas (usa SOLO estos códigos exactos):
- fiscal (impuestos, SAT, contribuciones, ISR, IVA)
- corporativo (sociedades, M&A, gobierno corporativo)
- laboral (trabajo, IMSS, INFONAVIT, sindicatos, seguridad social)
- penal (delitos, código penal, justicia penal)
- civil (contratos, obligaciones, personas, bienes)
- mercantil (comercio, títulos de crédito)
- administrativo (licitaciones, permisos, procedimientos administrativos)
- constitucional (amparo, SCJN, derechos humanos, garantías)
- financiero (bancos, CNBV, valores, sistema financiero)
- ambiental (SEMARNAT, ecología, agua, residuos)
- inmobiliario (propiedad, arrendamiento, desarrollo inmobiliario)
- familia (divorcio, patria potestad, pensión alimenticia)
- propiedad_intelectual (marcas, patentes, derechos de autor)
- competencia (COFECE, monopolios, concentraciones)
- comercio_exterior (aduanas, aranceles, T-MEC)
- energia (hidrocarburos, electricidad, CRE, CNH)
- salud (COFEPRIS, medicamentos, sanitario)
- bursatil (bolsa de valores, emisoras, mercado de valores)
- seguros (instituciones de seguros, fianzas)
- procesal (procedimientos judiciales, juicios)
- notarial (notarios, fe pública, registros)
- agrario (tierras ejidales, reforma agraria)
- telecomunicaciones (IFT, concesiones, espectro)
- tecnologia (protección de datos, comercio electrónico)
- consumidor (PROFECO, derechos del consumidor)
- migratorio (INM, extranjería, visas)
- electoral (INE, partidos políticos, elecciones)
- transporte (SCT, concesiones, logística)
- maritimo (puertos, navegación)
- construccion (infraestructura, obra pública)
- compliance (anticorrupción, cumplimiento normativo)
- sucesorio (testamentos, herencias)
- medios (radio, TV, entretenimiento)
- ciberseguridad (protección de sistemas, delitos informáticos)
- internacional (tratados, derecho internacional)

Responde ÚNICAMENTE con JSON válido en este formato:
{"areas": ["area1", "area2"], "resumen": "Tu resumen aquí..."}

Si el documento no aplica claramente a ninguna área, usa: {"areas": [], "resumen": "..."}`;

    const openai = getOpenAI();
    if (!openai) {
      console.error('OpenAI API key not configured');
      return { areas: [], resumen: 'API no configurada' };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto en derecho mexicano. Respondes SOLO con JSON válido.'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content || '{}';

    // Parsear JSON
    try {
      const resultado = JSON.parse(responseText) as ResultadoClasificacion;
      
      // Validar que las áreas sean válidas
      resultado.areas = resultado.areas.filter(a => AREAS_VALIDAS.includes(a));
      
      return resultado;
    } catch (parseError) {
      console.error('Error parseando respuesta de OpenAI:', parseError);
      console.error('Respuesta recibida:', responseText);
      
      return {
        areas: [],
        resumen: 'Error procesando documento.',
      };
    }
  } catch (error) {
    console.error('Error clasificando documento:', error);
    return {
      areas: [],
      resumen: 'Error procesando documento.',
    };
  }
}
