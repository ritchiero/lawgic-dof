import Anthropic from '@anthropic-ai/sdk';

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const AREAS_VALIDAS = [
  "fiscal", "laboral", "mercantil", "financiero", "energia",
  "ambiental", "propiedad_intelectual", "competencia", 
  "administrativo", "constitucional", "comercio_exterior", "salud"
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
${extracto}

---

Tu tarea:
1. Identificar las áreas del derecho mexicano que aplican a este documento.
2. Generar un resumen ejecutivo de 2-3 oraciones para abogados.

Áreas válidas (usa SOLO estos códigos exactos):
- fiscal (impuestos, SAT, contribuciones)
- laboral (trabajo, IMSS, INFONAVIT, sindicatos)
- mercantil (sociedades, comercio, corporativo)
- financiero (bancos, CNBV, valores, seguros)
- energia (hidrocarburos, electricidad, CRE, CNH)
- ambiental (SEMARNAT, ecología, agua)
- propiedad_intelectual (marcas, patentes, derechos de autor)
- competencia (COFECE, monopolios, concentraciones)
- administrativo (licitaciones, permisos, gobierno)
- constitucional (amparo, SCJN, derechos humanos)
- comercio_exterior (aduanas, aranceles, T-MEC)
- salud (COFEPRIS, medicamentos, sanitario)

Responde ÚNICAMENTE con JSON válido en este formato:
{"areas": ["area1", "area2"], "resumen": "Tu resumen aquí..."}

Si el documento no aplica claramente a ninguna área, usa: {"areas": [], "resumen": "..."}`;

    if (!anthropic) {
      console.error('Anthropic API key not configured');
      return { areas: [], resumen: 'API no configurada' };
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extraer el texto de la respuesta
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Parsear JSON
    try {
      const resultado = JSON.parse(responseText) as ResultadoClasificacion;
      
      // Validar que las áreas sean válidas
      resultado.areas = resultado.areas.filter(a => AREAS_VALIDAS.includes(a));
      
      return resultado;
    } catch (parseError) {
      console.error('Error parseando respuesta de Claude:', parseError);
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
