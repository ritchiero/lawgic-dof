// Datos demo actualizados con 35 áreas de práctica

export interface DemoUsuario {
  id: string;
  email: string;
  nombre: string;
  areas: string[];
  status: 'active' | 'cancelled';
}

export interface DemoDocumentoDOF {
  id: string;
  fecha: string;
  titulo: string;
  tipo_documento: string;
  edicion: string;
  areas_detectadas: string[];
  resumen_ia: string;
  url_dof: string;
}

export const DEMO_USUARIOS: DemoUsuario[] = [
  {
    id: 'demo_user_1',
    email: 'juan.perez@despacho.com',
    nombre: 'Juan Pérez',
    areas: ['fiscal', 'laboral', 'corporativo'],
    status: 'active',
  },
  {
    id: 'demo_user_2',
    email: 'maria.garcia@abogados.com',
    nombre: 'María García',
    areas: ['mercantil', 'bancario', 'bursatil'],
    status: 'active',
  },
  {
    id: 'demo_user_3',
    email: 'carlos.lopez@legal.mx',
    nombre: 'Carlos López',
    areas: ['ambiental', 'administrativo', 'energia'],
    status: 'active',
  },
  {
    id: 'demo_user_4',
    email: 'ana.martinez@bufete.com',
    nombre: 'Ana Martínez',
    areas: ['familia', 'civil', 'sucesorio'],
    status: 'active',
  },
  {
    id: 'demo_user_5',
    email: 'roberto.sanchez@corporativo.mx',
    nombre: 'Roberto Sánchez',
    areas: ['propiedad_intelectual', 'tecnologia', 'ciberseguridad'],
    status: 'active',
  },
  {
    id: 'demo_user_6',
    email: 'laura.rodriguez@inmobiliaria.com',
    nombre: 'Laura Rodríguez',
    areas: ['inmobiliario', 'notarial', 'construccion'],
    status: 'active',
  },
];

export const DEMO_DOCUMENTOS_DOF: DemoDocumentoDOF[] = [
  {
    id: 'dof_2025_001',
    fecha: '2025-12-13',
    titulo: 'DECRETO por el que se reforman diversas disposiciones de la Ley del Impuesto Sobre la Renta',
    tipo_documento: 'Decreto',
    edicion: 'Matutina',
    areas_detectadas: ['fiscal', 'corporativo'],
    resumen_ia: 'Se modifican las tasas de retención del ISR para personas morales y se actualizan los montos de deducciones autorizadas para el ejercicio fiscal 2026.',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000001',
  },
  {
    id: 'dof_2025_002',
    fecha: '2025-12-13',
    titulo: 'ACUERDO por el que se dan a conocer las cuotas obrero-patronales del IMSS para 2026',
    tipo_documento: 'Acuerdo',
    edicion: 'Matutina',
    areas_detectadas: ['laboral', 'fiscal'],
    resumen_ia: 'Se publican las nuevas cuotas del IMSS aplicables a partir del 1 de enero de 2026, con incremento del 4.2% respecto al año anterior.',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000002',
  },
  {
    id: 'dof_2025_003',
    fecha: '2025-12-13',
    titulo: 'AVISO mediante el cual se dan a conocer los nuevos trámites del Registro Federal de Trámites',
    tipo_documento: 'Aviso',
    edicion: 'Matutina',
    areas_detectadas: ['administrativo'],
    resumen_ia: 'La COFEMER publica 15 nuevos trámites administrativos que entrarán en vigor en enero 2026, incluyendo permisos ambientales y sanitarios.',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000003',
  },
  {
    id: 'dof_2025_004',
    fecha: '2025-12-13',
    titulo: 'NORMA Oficial Mexicana NOM-051-SCFI/SSA1-2025, Especificaciones generales de etiquetado para alimentos',
    tipo_documento: 'NOM',
    edicion: 'Matutina',
    areas_detectadas: ['salud', 'mercantil', 'consumidor'],
    resumen_ia: 'Se actualizan los criterios de etiquetado frontal de advertencia para productos alimenticios, con nuevos límites para azúcares y sodio.',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000004',
  },
  {
    id: 'dof_2025_005',
    fecha: '2025-12-13',
    titulo: 'ACUERDO de protección de manglares en zonas costeras del Golfo de México',
    tipo_documento: 'Acuerdo',
    edicion: 'Matutina',
    areas_detectadas: ['ambiental', 'administrativo'],
    resumen_ia: 'SEMARNAT establece nuevas áreas naturales protegidas en 5 estados costeros, prohibiendo desarrollos inmobiliarios en zonas de manglar.',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000005',
  },
  {
    id: 'dof_2025_006',
    fecha: '2025-12-13',
    titulo: 'RESOLUCIÓN de modificación a las Reglas Generales de Comercio Exterior para 2026',
    tipo_documento: 'Resolución',
    edicion: 'Vespertina',
    areas_detectadas: ['comercio_exterior', 'fiscal'],
    resumen_ia: 'SAT actualiza procedimientos aduaneros y requisitos para importación temporal, con nuevas facilidades para empresas IMMEX.',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000006',
  },
  {
    id: 'dof_2025_007',
    fecha: '2025-12-13',
    titulo: 'LINEAMIENTOS para la protección de datos personales en instituciones financieras',
    tipo_documento: 'Lineamientos',
    edicion: 'Vespertina',
    areas_detectadas: ['tecnologia', 'bancario', 'ciberseguridad'],
    resumen_ia: 'INAI y CNBV establecen nuevos requisitos de ciberseguridad y protección de datos para bancos y fintechs, aplicables desde marzo 2026.',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000007',
  },
  {
    id: 'dof_2025_008',
    fecha: '2025-12-13',
    titulo: 'DECRETO que reforma la Ley de Propiedad Industrial en materia de patentes farmacéuticas',
    tipo_documento: 'Decreto',
    edicion: 'Vespertina',
    areas_detectadas: ['propiedad_intelectual', 'salud'],
    resumen_ia: 'Se reducen plazos de examen de patentes farmacéuticas y se establecen nuevas causales de oposición para medicamentos genéricos.',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000008',
  },
  {
    id: 'dof_2025_009',
    fecha: '2025-12-13',
    titulo: 'ACUERDO por el que se establecen los lineamientos para contratos de arrendamiento inmobiliario',
    tipo_documento: 'Acuerdo',
    edicion: 'Vespertina',
    areas_detectadas: ['inmobiliario', 'civil'],
    resumen_ia: 'PROFECO publica modelo de contrato de arrendamiento con cláusulas de protección para arrendatarios y nuevos requisitos de depósitos.',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000009',
  },
  {
    id: 'dof_2025_010',
    fecha: '2025-12-13',
    titulo: 'CIRCULAR sobre requisitos de compliance para empresas con contratos gubernamentales',
    tipo_documento: 'Circular',
    edicion: 'Vespertina',
    areas_detectadas: ['compliance', 'administrativo', 'corporativo'],
    resumen_ia: 'SFP establece obligación de implementar programas de integridad corporativa para proveedores del gobierno federal con contratos mayores a 10 MDP.',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000010',
  },
];
