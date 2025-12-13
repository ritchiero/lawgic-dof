export interface AreaPractica {
  codigo: string;
  nombre: string;
  keywords_ia: string[];
  emoji: string;
}

export const AREAS_PRACTICA: Record<string, AreaPractica> = {
  fiscal: {
    codigo: "fiscal",
    nombre: "Fiscal y Tributario",
    keywords_ia: ["impuesto", "SAT", "ISR", "IVA", "IEPS", "contribuciones", "fiscal", "tributario", "miscelánea fiscal", "código fiscal"],
    emoji: "💰"
  },
  laboral: {
    codigo: "laboral",
    nombre: "Laboral y Seguridad Social",
    keywords_ia: ["trabajo", "laboral", "IMSS", "INFONAVIT", "sindicato", "salario", "despido", "LFT", "seguridad social", "pensiones"],
    emoji: "👷"
  },
  mercantil: {
    codigo: "mercantil",
    nombre: "Mercantil y Corporativo",
    keywords_ia: ["sociedad", "mercantil", "corporativo", "acciones", "asamblea", "fusión", "escisión", "LGSM", "comercio"],
    emoji: "🏢"
  },
  financiero: {
    codigo: "financiero",
    nombre: "Financiero y Bancario",
    keywords_ia: ["banco", "crédito", "CNBV", "Banxico", "financiero", "bursátil", "valores", "fintech", "seguros", "fianzas"],
    emoji: "🏦"
  },
  energia: {
    codigo: "energia",
    nombre: "Energía e Hidrocarburos",
    keywords_ia: ["energía", "hidrocarburos", "petróleo", "electricidad", "CRE", "CNH", "PEMEX", "CFE", "renovable", "SENER"],
    emoji: "⚡"
  },
  ambiental: {
    codigo: "ambiental",
    nombre: "Ambiental",
    keywords_ia: ["ambiente", "ecología", "SEMARNAT", "impacto ambiental", "residuos", "agua", "CONAGUA", "forestal"],
    emoji: "🌱"
  },
  propiedad_intelectual: {
    codigo: "propiedad_intelectual",
    nombre: "Propiedad Intelectual",
    keywords_ia: ["marca", "patente", "autor", "IMPI", "INDAUTOR", "propiedad intelectual", "diseño industrial", "franquicia"],
    emoji: "©️"
  },
  competencia: {
    codigo: "competencia",
    nombre: "Competencia Económica",
    keywords_ia: ["COFECE", "competencia", "concentración", "monopolio", "prácticas monopólicas", "IFT"],
    emoji: "⚖️"
  },
  administrativo: {
    codigo: "administrativo",
    nombre: "Administrativo",
    keywords_ia: ["licitación", "concesión", "permiso", "licencia", "administrativo", "contratación pública", "gobierno"],
    emoji: "📋"
  },
  constitucional: {
    codigo: "constitucional",
    nombre: "Constitucional y Amparo",
    keywords_ia: ["constitución", "amparo", "derechos humanos", "SCJN", "inconstitucionalidad", "controversia constitucional"],
    emoji: "📜"
  },
  comercio_exterior: {
    codigo: "comercio_exterior",
    nombre: "Comercio Exterior y Aduanas",
    keywords_ia: ["aduana", "importación", "exportación", "T-MEC", "aranceles", "comercio exterior", "IMMEX", "dumping"],
    emoji: "🌎"
  },
  salud: {
    codigo: "salud",
    nombre: "Salud y Farmacéutico",
    keywords_ia: ["COFEPRIS", "sanitario", "medicamento", "salud", "farmacéutico", "dispositivo médico", "cannabis"],
    emoji: "⚕️"
  }
};

export const AREAS_ARRAY = Object.values(AREAS_PRACTICA);
