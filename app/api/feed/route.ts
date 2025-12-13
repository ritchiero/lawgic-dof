import { NextRequest, NextResponse } from 'next/server';
import { getDemoDocumentos } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const areasFilter = searchParams.get('areas')?.split(',').filter(Boolean) || [];
    const searchQuery = searchParams.get('q') || '';
    const savedOnly = searchParams.get('saved') === 'true';

    // En modo demo, usar datos simulados
    let allDocumentos = getDemoDocumentos();

    // Filtrar por áreas si se especificaron
    if (areasFilter.length > 0) {
      allDocumentos = allDocumentos.filter((doc: any) =>
        doc.areas_detectadas?.some((area: string) => areasFilter.includes(area))
      );
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allDocumentos = allDocumentos.filter((doc: any) =>
        doc.titulo.toLowerCase().includes(query) ||
        doc.resumen_ia?.toLowerCase().includes(query) ||
        doc.tipo_documento?.toLowerCase().includes(query)
      );
    }

    // Ordenar por fecha (más recientes primero)
    allDocumentos.sort((a: any, b: any) => {
      const fechaA = new Date(a.fecha_publicacion || '2024-01-01');
      const fechaB = new Date(b.fecha_publicacion || '2024-01-01');
      return fechaB.getTime() - fechaA.getTime();
    });

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const documentosPaginados = allDocumentos.slice(startIndex, endIndex);
    const hasMore = endIndex < allDocumentos.length;

    return NextResponse.json({
      documentos: documentosPaginados,
      hasMore,
      total: allDocumentos.length,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error en API de feed:', error);
    return NextResponse.json(
      { error: 'Error obteniendo documentos' },
      { status: 500 }
    );
  }
}
