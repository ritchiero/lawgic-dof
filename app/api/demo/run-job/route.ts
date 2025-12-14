import { NextRequest, NextResponse } from 'next/server';
import { DEMO_DOCUMENTOS_DOF, DEMO_USUARIOS } from '@/lib/demo-data';
import { AREAS_ARRAY } from '@/lib/areas';

type DemoJobDetalle = {
  usuario: string;
  areas: string[];
  documentos_enviados: number;
  titulos: string[];
};

export async function POST(_request: NextRequest) {
  try {
    // Simular el proceso del job diario
    const results = {
      fecha: new Date().toISOString().split('T')[0],
      documentos_procesados: DEMO_DOCUMENTOS_DOF.length,
      usuarios_activos: DEMO_USUARIOS.filter(u => u.status === 'active').length,
      alertas_enviadas: 0,
      detalles: [] as DemoJobDetalle[],
    };

    // Para cada usuario activo, determinar qué documentos le corresponden
    for (const usuario of DEMO_USUARIOS.filter(u => u.status === 'active')) {
      const documentosRelevantes = DEMO_DOCUMENTOS_DOF.filter(doc =>
        doc.areas_detectadas.some(area => usuario.areas.includes(area))
      );

      if (documentosRelevantes.length > 0) {
        results.alertas_enviadas++;
        results.detalles.push({
          usuario: usuario.email,
          areas: usuario.areas.map(a => AREAS_ARRAY.find(ar => ar.codigo === a)?.nombre || a),
          documentos_enviados: documentosRelevantes.length,
          titulos: documentosRelevantes.map(d => d.titulo.substring(0, 80) + '...'),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Job diario ejecutado exitosamente (modo demo)',
      results,
    });
  } catch (error) {
    console.error('Error en demo job:', error);
    return NextResponse.json(
      { error: 'Error ejecutando job demo' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Demo Job Endpoint',
    description: 'Simula la ejecución del job diario de scraping, clasificación y envío de alertas',
    method: 'POST',
    demo: true,
  });
}
