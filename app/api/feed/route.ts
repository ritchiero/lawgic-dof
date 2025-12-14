import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const areasFilter = searchParams.get('areas')?.split(',').filter(Boolean) || [];
    const searchQuery = searchParams.get('q') || '';

    // Construir query de Firestore
    let query = db.collection(collections.documentosDof)
      .where('procesado', '==', true)
      .orderBy('fecha_publicacion', 'desc');

    // Filtrar por áreas si se especificaron
    if (areasFilter.length > 0) {
      query = query.where('areas_clasificadas', 'array-contains-any', areasFilter.slice(0, 10));
    }

    // Ejecutar query
    const snapshot = await query.get();

    // Convertir a array de documentos
    let documentos = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        titulo: data.titulo || '',
        resumen_ia: data.resumen_ia || '',
        areas_detectadas: data.areas_clasificadas || [],
        fecha_publicacion: data.fecha_publicacion || '',
        tipo_documento: data.tipo_documento || 'Documento',
        edicion: data.edicion || 'Matutina',
        url_dof: data.url_dof || '',
      };
    });

    // Filtrar por búsqueda (en memoria, ya que Firestore no soporta búsqueda full-text)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      documentos = documentos.filter(doc =>
        doc.titulo.toLowerCase().includes(query) ||
        doc.resumen_ia?.toLowerCase().includes(query) ||
        doc.tipo_documento?.toLowerCase().includes(query)
      );
    }

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const documentosPaginados = documentos.slice(startIndex, endIndex);
    const hasMore = endIndex < documentos.length;

    return NextResponse.json({
      documentos: documentosPaginados,
      hasMore,
      total: documentos.length,
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
