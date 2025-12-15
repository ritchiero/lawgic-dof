/**
 * Analizador semántico para identificar entidades y temas en títulos del DOF
 * Genera descripciones fotográficas específicas para cada tipo de documento
 */

// Entidades gubernamentales y sus representaciones visuales
const ENTITY_PATTERNS: Record<string, { keywords: string[]; photoDescription: string }> = {
  'INE': {
    keywords: ['INE', 'Instituto Nacional Electoral', 'Consejo General del INE', 'Órgano Interno de Control del Instituto Nacional Electoral'],
    photoDescription: 'Professional photograph of the INE (Instituto Nacional Electoral) headquarters building in Mexico City, modern architecture with the official INE logo visible, daytime, institutional setting'
  },
  'SCJN': {
    keywords: ['Suprema Corte', 'SCJN', 'Pleno de la Suprema Corte', 'Tribunal Pleno'],
    photoDescription: 'Professional photograph of the Supreme Court of Justice (Suprema Corte de Justicia de la Nación) building in Mexico City, neoclassical architecture, majestic columns, institutional setting'
  },
  'SHCP': {
    keywords: ['Secretaría de Hacienda', 'SHCP', 'Hacienda y Crédito Público'],
    photoDescription: 'Professional photograph of the Mexican Ministry of Finance (SHCP) building, modern government architecture, official setting'
  },
  'Banco': {
    keywords: ['Banco', 'instituciones de crédito', 'banca', 'financiero', 'Comisión Nacional Bancaria'],
    photoDescription: 'Professional photograph of a modern Mexican bank building, glass facade, corporate architecture, financial district, professional lighting'
  },
  'Salud': {
    keywords: ['Secretaría de Salud', 'SSA', 'Salud', 'hospital', 'médico', 'sanitario'],
    photoDescription: 'Professional photograph of a modern Mexican hospital or health ministry building, clean medical environment, institutional healthcare setting'
  },
  'Educación': {
    keywords: ['Secretaría de Educación', 'SEP', 'Educación Pública', 'educativo', 'escolar'],
    photoDescription: 'Professional photograph of the Mexican Ministry of Education (SEP) building or a modern educational institution, academic setting'
  },
  'Trabajo': {
    keywords: ['Secretaría del Trabajo', 'STPS', 'Trabajo y Previsión Social', 'laboral'],
    photoDescription: 'Professional photograph of the Mexican Ministry of Labor (STPS) building, modern office environment, professional workplace setting'
  },
  'Energía': {
    keywords: ['Secretaría de Energía', 'SENER', 'Energía', 'CFE', 'Pemex', 'petróleo'],
    photoDescription: 'Professional photograph of Mexican energy infrastructure, modern industrial facilities, oil refineries or power plants, industrial setting'
  },
  'Economía': {
    keywords: ['Secretaría de Economía', 'SE', 'Economía', 'comercio', 'industria'],
    photoDescription: 'Professional photograph of the Mexican Ministry of Economy building, modern government architecture, business district setting'
  },
  'Medio Ambiente': {
    keywords: ['Semarnat', 'Medio Ambiente', 'ambiental', 'ecológico', 'recursos naturales'],
    photoDescription: 'Professional photograph of Mexican natural landscapes or environmental ministry building, nature conservation, green spaces'
  },
  'Comunicaciones': {
    keywords: ['SCT', 'Comunicaciones y Transportes', 'infraestructura', 'carreteras'],
    photoDescription: 'Professional photograph of Mexican transportation infrastructure, modern highways, bridges, or communications ministry building'
  },
  'Seguridad': {
    keywords: ['Seguridad Pública', 'SSPC', 'Guardia Nacional', 'seguridad', 'policía'],
    photoDescription: 'Professional photograph of Mexican security forces building or headquarters, institutional law enforcement setting, professional security environment'
  },
  'Relaciones Exteriores': {
    keywords: ['SRE', 'Relaciones Exteriores', 'cancillería', 'diplomático'],
    photoDescription: 'Professional photograph of the Mexican Ministry of Foreign Affairs (SRE) building, diplomatic setting, official government architecture'
  },
};

// Temas legales y sus representaciones visuales
const THEME_PATTERNS: Record<string, { keywords: string[]; photoDescription: string }> = {
  'Fiscal': {
    keywords: ['impuesto', 'fiscal', 'tributario', 'ISR', 'IVA', 'contribución'],
    photoDescription: 'Professional photograph of Mexican tax office or financial documents, modern office environment with calculators and financial reports, professional accounting setting'
  },
  'Laboral': {
    keywords: ['trabajador', 'empleo', 'salario', 'contrato laboral', 'sindicato'],
    photoDescription: 'Professional photograph of a modern Mexican workplace, office environment with employees working, professional business setting'
  },
  'Comercial': {
    keywords: ['comercio', 'mercantil', 'empresa', 'sociedad mercantil', 'negocio'],
    photoDescription: 'Professional photograph of Mexican business district, modern commercial buildings, corporate offices, professional business environment'
  },
  'Ambiental': {
    keywords: ['ambiental', 'ecológico', 'contaminación', 'residuos', 'emisiones'],
    photoDescription: 'Professional photograph of Mexican environmental conservation areas, natural landscapes, or environmental monitoring facilities'
  },
  'Penal': {
    keywords: ['penal', 'delito', 'sentencia', 'prisión', 'justicia penal'],
    photoDescription: 'Professional photograph of Mexican courthouse interior, justice scales, legal books, formal judicial setting'
  },
  'Civil': {
    keywords: ['civil', 'contrato', 'propiedad', 'familia', 'sucesión'],
    photoDescription: 'Professional photograph of Mexican notary office or civil registry, legal documents, professional legal setting'
  },
  'Administrativo': {
    keywords: ['administrativo', 'procedimiento', 'autoridad', 'trámite', 'permiso'],
    photoDescription: 'Professional photograph of Mexican government office interior, administrative desks, official paperwork, institutional setting'
  },
};

// Documentos específicos
const DOCUMENT_PATTERNS: Record<string, { keywords: string[]; photoDescription: string }> = {
  'Acuerdo': {
    keywords: ['Acuerdo General', 'Acuerdo por el que'],
    photoDescription: 'Professional photograph of a formal government meeting room in Mexico, conference table with officials, institutional setting, professional lighting'
  },
  'Decreto': {
    keywords: ['Decreto por el que', 'Decreto que'],
    photoDescription: 'Professional photograph of Mexican presidential office or official government chamber, formal institutional setting with Mexican flag'
  },
  'Resolución': {
    keywords: ['Resolución que', 'Resolución por la que'],
    photoDescription: 'Professional photograph of Mexican government office with official documents and seals, formal administrative setting'
  },
  'Convocatoria': {
    keywords: ['Convocatoria', 'convoca'],
    photoDescription: 'Professional photograph of Mexican public announcement board or official bulletin, institutional communication setting'
  },
  'Norma': {
    keywords: ['Norma Oficial Mexicana', 'NOM-'],
    photoDescription: 'Professional photograph of Mexican standards and regulations office, technical documents, quality control setting'
  },
};

export interface SemanticAnalysisResult {
  entity?: string;
  theme?: string;
  documentType?: string;
  photoDescription: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Analiza un título del DOF y genera una descripción fotográfica específica
 */
export function analyzeTitle(titulo: string): SemanticAnalysisResult {
  const tituloLower = titulo.toLowerCase();
  
  // 1. Buscar entidades específicas (prioridad más alta)
  for (const [entity, pattern] of Object.entries(ENTITY_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      if (titulo.includes(keyword)) {
        return {
          entity,
          photoDescription: pattern.photoDescription,
          confidence: 'high',
        };
      }
    }
  }
  
  // 2. Buscar tipo de documento
  for (const [docType, pattern] of Object.entries(DOCUMENT_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      if (titulo.includes(keyword)) {
        return {
          documentType: docType,
          photoDescription: pattern.photoDescription,
          confidence: 'medium',
        };
      }
    }
  }
  
  // 3. Buscar temas legales
  for (const [theme, pattern] of Object.entries(THEME_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      if (tituloLower.includes(keyword.toLowerCase())) {
        return {
          theme,
          photoDescription: pattern.photoDescription,
          confidence: 'medium',
        };
      }
    }
  }
  
  // 4. Fallback genérico
  return {
    photoDescription: 'Professional photograph of Mexican government building, Palacio Nacional or official government architecture in Mexico City, institutional setting, daytime, professional lighting',
    confidence: 'low',
  };
}

/**
 * Genera un prompt optimizado para DALL-E 3 basado en el análisis semántico
 */
export function generatePhotoPrompt(titulo: string, categoria?: string): string {
  const analysis = analyzeTitle(titulo);
  
  // Agregar contexto de categoría si está disponible
  let categoryContext = '';
  if (categoria) {
    categoryContext = ` Related to ${categoria} law in Mexico.`;
  }
  
  // Construir prompt final
  const prompt = `${analysis.photoDescription}${categoryContext} High quality, professional photography, sharp focus, natural lighting, realistic, no text, no logos overlaid, clean composition, suitable as background image for legal document card.`;
  
  return prompt;
}

/**
 * Extrae palabras clave del título para logging/debugging
 */
export function extractKeywords(titulo: string): string[] {
  const keywords: string[] = [];
  
  // Buscar entidades
  for (const [entity, pattern] of Object.entries(ENTITY_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      if (titulo.includes(keyword)) {
        keywords.push(`entity:${entity}`);
        break;
      }
    }
  }
  
  // Buscar temas
  for (const [theme, pattern] of Object.entries(THEME_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      if (titulo.toLowerCase().includes(keyword.toLowerCase())) {
        keywords.push(`theme:${theme}`);
        break;
      }
    }
  }
  
  return keywords;
}
