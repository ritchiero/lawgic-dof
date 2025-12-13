// Datos de demostración para MVP sin servicios externos

export const DEMO_DOCUMENTOS_DOF = [
  {
    id: 'demo-1',
    fecha_publicacion: new Date().toISOString().split('T')[0],
    titulo: 'DECRETO por el que se reforman diversas disposiciones de la Ley del Impuesto Sobre la Renta',
    tipo_documento: 'Decreto',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000001',
    contenido_extracto: 'Se reforman los artículos 25, 27 y 28 de la Ley del ISR para establecer nuevas deducciones autorizadas...',
    resumen_ia: 'La reforma modifica las tasas de retención del ISR para personas físicas con actividad empresarial. Entra en vigor el 1 de enero de 2026.',
    areas_detectadas: ['fiscal'],
    edicion: 'Matutina',
    procesado: true,
  },
  {
    id: 'demo-2',
    fecha_publicacion: new Date().toISOString().split('T')[0],
    titulo: 'ACUERDO por el que se dan a conocer las cuotas obrero patronales del IMSS para el ejercicio 2026',
    tipo_documento: 'Acuerdo',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000002',
    contenido_extracto: 'El Instituto Mexicano del Seguro Social da a conocer las cuotas actualizadas...',
    resumen_ia: 'Se actualizan las cuotas obrero-patronales del IMSS para el ejercicio 2026. El incremento promedio es del 4.5% respecto al año anterior.',
    areas_detectadas: ['laboral'],
    edicion: 'Matutina',
    procesado: true,
  },
  {
    id: 'demo-3',
    fecha_publicacion: new Date().toISOString().split('T')[0],
    titulo: 'AVISO mediante el cual se dan a conocer los trámites inscritos en el Registro Federal de Trámites y Servicios',
    tipo_documento: 'Aviso',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000003',
    contenido_extracto: 'La Comisión Federal de Mejora Regulatoria da a conocer los trámites inscritos...',
    resumen_ia: 'Se publican 15 nuevos trámites administrativos relacionados con permisos de construcción y licencias de operación. Aplicable a nivel federal.',
    areas_detectadas: ['administrativo'],
    edicion: 'Matutina',
    procesado: true,
  },
  {
    id: 'demo-4',
    fecha_publicacion: new Date().toISOString().split('T')[0],
    titulo: 'RESOLUCIÓN de modificación a la Norma Oficial Mexicana NOM-051-SCFI/SSA1-2010',
    tipo_documento: 'Resolución',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000004',
    contenido_extracto: 'Se modifica la NOM-051 sobre etiquetado de alimentos y bebidas no alcohólicas...',
    resumen_ia: 'Nuevos requisitos de etiquetado frontal para productos alimenticios. Las empresas tienen 180 días para cumplir con las nuevas especificaciones.',
    areas_detectadas: ['salud', 'mercantil'],
    edicion: 'Matutina',
    procesado: true,
  },
  {
    id: 'demo-5',
    fecha_publicacion: new Date().toISOString().split('T')[0],
    titulo: 'ACUERDO por el que se establecen medidas de protección ambiental en zonas de manglar',
    tipo_documento: 'Acuerdo',
    url_dof: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5000005',
    contenido_extracto: 'La SEMARNAT establece nuevas medidas para la conservación de manglares...',
    resumen_ia: 'Se prohíbe la construcción en zonas de manglar en 12 estados costeros. Incluye sanciones de hasta 50 millones de pesos por incumplimiento.',
    areas_detectadas: ['ambiental'],
    edicion: 'Matutina',
    procesado: true,
  },
];

export const DEMO_USUARIOS = [
  {
    id: 'demo-user-1',
    email: 'juan.perez@despacho.com',
    nombre: 'Juan Pérez',
    status: 'active',
    areas: ['fiscal', 'laboral'],
  },
  {
    id: 'demo-user-2',
    email: 'maria.garcia@abogados.com',
    nombre: 'María García',
    status: 'active',
    areas: ['mercantil', 'financiero'],
  },
  {
    id: 'demo-user-3',
    email: 'carlos.lopez@legal.mx',
    nombre: 'Carlos López',
    status: 'active',
    areas: ['ambiental', 'administrativo'],
  },
];

export function getDemoDocumentosPorArea(areaCodigo: string) {
  return DEMO_DOCUMENTOS_DOF.filter(doc => 
    doc.areas_detectadas.includes(areaCodigo)
  );
}

export function getDemoUsuariosPorArea(areaCodigo: string) {
  return DEMO_USUARIOS.filter(user => 
    user.areas.includes(areaCodigo)
  );
}

export function generarEmailPreview(email: string, areas: string[], documentos: typeof DEMO_DOCUMENTOS_DOF) {
  const fecha = new Date().toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return {
    subject: `DOF Alertas - ${fecha} - ${documentos.length} documento(s) relevante(s)`,
    preview: `Hola,\n\nEncontramos ${documentos.length} documentos relevantes para tus áreas de práctica en el DOF de hoy.\n\n${documentos.map(doc => `• ${doc.titulo.substring(0, 80)}...`).join('\n')}\n\nSaludos,\nDOF Alertas`,
  };
}
