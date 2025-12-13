// 35 Áreas de Práctica Legal en México
// Basado en investigación de demanda y popularidad

export interface AreaPractica {
  codigo: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  categoria: 'alta' | 'media' | 'especializada';
}

export const AREAS_35: AreaPractica[] = [
  // CATEGORÍA A: MUY DEMANDADAS (Top 10)
  {
    codigo: 'fiscal',
    nombre: 'Fiscal y Tributario',
    emoji: '💰',
    descripcion: 'Impuestos, ISR, auditorías fiscales y cumplimiento tributario',
    categoria: 'alta',
  },
  {
    codigo: 'corporativo',
    nombre: 'Corporativo y M&A',
    emoji: '🏢',
    descripcion: 'Fusiones, adquisiciones, reestructuras y gobierno corporativo',
    categoria: 'alta',
  },
  {
    codigo: 'laboral',
    nombre: 'Laboral y Seguridad Social',
    emoji: '👷',
    descripcion: 'Contratos laborales, IMSS, litigios y relaciones empleador-empleado',
    categoria: 'alta',
  },
  {
    codigo: 'penal',
    nombre: 'Penal',
    emoji: '⚖️',
    descripcion: 'Defensa penal, delitos y procedimientos criminales',
    categoria: 'alta',
  },
  {
    codigo: 'civil',
    nombre: 'Civil',
    emoji: '📋',
    descripcion: 'Contratos, obligaciones, responsabilidad civil y derecho privado',
    categoria: 'alta',
  },
  {
    codigo: 'mercantil',
    nombre: 'Mercantil',
    emoji: '🏦',
    descripcion: 'Comercio, sociedades mercantiles y operaciones comerciales',
    categoria: 'alta',
  },
  {
    codigo: 'administrativo',
    nombre: 'Administrativo',
    emoji: '🏛️',
    descripcion: 'Actos de autoridad, trámites gubernamentales y contencioso administrativo',
    categoria: 'alta',
  },
  {
    codigo: 'constitucional',
    nombre: 'Constitucional y Amparo',
    emoji: '📜',
    descripcion: 'Amparos, controversias constitucionales y derechos fundamentales',
    categoria: 'alta',
  },
  {
    codigo: 'bancario',
    nombre: 'Bancario y Financiero',
    emoji: '💳',
    descripcion: 'Créditos, operaciones bancarias y regulación financiera',
    categoria: 'alta',
  },
  {
    codigo: 'ambiental',
    nombre: 'Ambiental y Sustentabilidad',
    emoji: '🌱',
    descripcion: 'Normativa ambiental, impacto ecológico y desarrollo sostenible',
    categoria: 'alta',
  },

  // CATEGORÍA B: DEMANDA MEDIA (10)
  {
    codigo: 'inmobiliario',
    nombre: 'Inmobiliario',
    emoji: '🏠',
    descripcion: 'Compraventa, arrendamiento y desarrollo inmobiliario',
    categoria: 'media',
  },
  {
    codigo: 'familia',
    nombre: 'Familia y Divorcio',
    emoji: '👨‍👩‍👧',
    descripcion: 'Divorcios, pensiones alimenticias, custodia y patria potestad',
    categoria: 'media',
  },
  {
    codigo: 'propiedad_intelectual',
    nombre: 'Propiedad Intelectual',
    emoji: '©️',
    descripcion: 'Patentes, marcas, derechos de autor y transferencia de tecnología',
    categoria: 'media',
  },
  {
    codigo: 'competencia',
    nombre: 'Competencia Económica',
    emoji: '🔄',
    descripcion: 'Prácticas monopólicas, concentraciones y libre competencia',
    categoria: 'media',
  },
  {
    codigo: 'comercio_exterior',
    nombre: 'Comercio Exterior y Aduanas',
    emoji: '🌎',
    descripcion: 'Importaciones, exportaciones, tratados comerciales y regulación aduanera',
    categoria: 'media',
  },
  {
    codigo: 'energia',
    nombre: 'Energía e Hidrocarburos',
    emoji: '⚡',
    descripcion: 'Sector energético, petróleo, gas y energías renovables',
    categoria: 'media',
  },
  {
    codigo: 'salud',
    nombre: 'Salud y Farmacéutico',
    emoji: '⚕️',
    descripcion: 'COFEPRIS, registro sanitario y regulación farmacéutica',
    categoria: 'media',
  },
  {
    codigo: 'bursatil',
    nombre: 'Bursátil y Valores',
    emoji: '📈',
    descripcion: 'Mercado de valores, emisiones y regulación bursátil',
    categoria: 'media',
  },
  {
    codigo: 'seguros',
    nombre: 'Seguros',
    emoji: '🛡️',
    descripcion: 'Pólizas, reclamaciones y regulación de aseguradoras',
    categoria: 'media',
  },
  {
    codigo: 'procesal',
    nombre: 'Procesal',
    emoji: '📝',
    descripcion: 'Procedimientos judiciales, recursos y técnicas procesales',
    categoria: 'media',
  },

  // CATEGORÍA C: ESPECIALIZADA/NICHO (15)
  {
    codigo: 'notarial',
    nombre: 'Notarial y Registral',
    emoji: '📜',
    descripcion: 'Actos notariales, escrituras públicas y registro público',
    categoria: 'especializada',
  },
  {
    codigo: 'agrario',
    nombre: 'Agrario',
    emoji: '🌾',
    descripcion: 'Ejidos, comunidades agrarias y tenencia de la tierra',
    categoria: 'especializada',
  },
  {
    codigo: 'telecomunicaciones',
    nombre: 'Telecomunicaciones',
    emoji: '📡',
    descripcion: 'IFT, concesiones y regulación de telecomunicaciones',
    categoria: 'especializada',
  },
  {
    codigo: 'tecnologia',
    nombre: 'Tecnología y Protección de Datos',
    emoji: '💻',
    descripcion: 'INAI, privacidad, protección de datos personales y GDPR',
    categoria: 'especializada',
  },
  {
    codigo: 'consumidor',
    nombre: 'Consumidor',
    emoji: '🛒',
    descripcion: 'PROFECO, derechos del consumidor y protección al usuario',
    categoria: 'especializada',
  },
  {
    codigo: 'migratorio',
    nombre: 'Migratorio',
    emoji: '🌍',
    descripcion: 'Visas, residencias, refugio y trámites migratorios',
    categoria: 'especializada',
  },
  {
    codigo: 'electoral',
    nombre: 'Electoral',
    emoji: '🗳️',
    descripcion: 'INE, TEPJF, partidos políticos y procesos electorales',
    categoria: 'especializada',
  },
  {
    codigo: 'transporte',
    nombre: 'Transporte y Logística',
    emoji: '🚚',
    descripcion: 'Transportistas, concesiones y regulación del autotransporte',
    categoria: 'especializada',
  },
  {
    codigo: 'maritimo',
    nombre: 'Marítimo y Portuario',
    emoji: '⚓',
    descripcion: 'Navegación, puertos, comercio marítimo y derecho del mar',
    categoria: 'especializada',
  },
  {
    codigo: 'construccion',
    nombre: 'Construcción e Infraestructura',
    emoji: '🏗️',
    descripcion: 'Obra pública, contratos de construcción y desarrollo de proyectos',
    categoria: 'especializada',
  },
  {
    codigo: 'compliance',
    nombre: 'Compliance y Anticorrupción',
    emoji: '✅',
    descripcion: 'Cumplimiento normativo, ética empresarial y prevención de corrupción',
    categoria: 'especializada',
  },
  {
    codigo: 'sucesorio',
    nombre: 'Sucesorio y Testamentario',
    emoji: '💼',
    descripcion: 'Testamentos, herencias y sucesiones',
    categoria: 'especializada',
  },
  {
    codigo: 'entretenimiento',
    nombre: 'Medios y Entretenimiento',
    emoji: '🎬',
    descripcion: 'Contratos artísticos, derechos de imagen y producción audiovisual',
    categoria: 'especializada',
  },
  {
    codigo: 'ciberseguridad',
    nombre: 'Ciberseguridad',
    emoji: '🔒',
    descripcion: 'Delitos informáticos, hackeo, fraude digital y protección cibernética',
    categoria: 'especializada',
  },
  {
    codigo: 'internacional',
    nombre: 'Internacional',
    emoji: '🌐',
    descripcion: 'Tratados internacionales, arbitraje y derecho transnacional',
    categoria: 'especializada',
  },
];

// Array simplificado para compatibilidad
export const AREAS_ARRAY = AREAS_35.map(area => ({
  codigo: area.codigo,
  nombre: area.nombre,
  emoji: area.emoji,
}));

export const AREAS_ARRAY_35 = AREAS_ARRAY;

// Función para obtener nombre de área por código
export function getNombreArea(codigo: string): string {
  const area = AREAS_35.find(a => a.codigo === codigo);
  return area ? area.nombre : codigo;
}

// Función para obtener emoji por código
export function getEmojiArea(codigo: string): string {
  const area = AREAS_35.find(a => a.codigo === codigo);
  return area ? area.emoji : '📄';
}

// Función para filtrar por categoría
export function getAreasPorCategoria(categoria: 'alta' | 'media' | 'especializada'): AreaPractica[] {
  return AREAS_35.filter(a => a.categoria === categoria);
}
