import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/firebase';
import { getDemoDocumentos } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const areasFilter = searchParams.get('areas')?.split(',').filter(Boolean) || [];
    const searchQuery = searchParams.get('q') || '';

    let documentos: any[] = [];

    // Intentar obtener documentos de Firestore
    try {
      // Verificar si Firebase está configurado
      if (!db) {
        throw new Error('Firebase not configured');
      }

      // Construir query de Firestore
      let query = db.collection(collections.documentosDof)
        .orderBy('fecha_publicacion', 'desc')
        .limit(100); // Limitar a 100 documentos para evitar costos excesivos

      // Filtrar por áreas si se especificaron (requiere índice compuesto en Firestore)
      if (areasFilter.length > 0) {
        query = query.where('areas_clasificadas', 'array-contains-any', areasFilter.slice(0, 10));
      }

      // Ejecutar query
      const snapshot = await query.get();

      // Convertir a array de documentos
      documentos = snapshot.docs.map(doc => {
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

      const filterMsg = areasFilter.length > 0 ? ` (filtrados por: ${areasFilter.join(', ')})` : '';
      console.log(`✓ Obtenidos ${documentos.length} documentos de Firestore${filterMsg}`);
    } catch (firestoreError) {
      console.warn('Error obteniendo documentos de Firestore, usando datos de ejemplo:', firestoreError);
      // Fallback a datos de ejemplo si Firestore falla
      documentos = getDemoDocumentos();
    }

    // Si no hay documentos en Firestore, usar datos de ejemplo
    if (documentos.length === 0) {
      console.log('No hay documentos en Firestore, usando datos de ejemplo');
      documentos = getDemoDocumentos();
    }

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
    
    // En caso de error, devolver datos de ejemplo
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const allDocumentos = getDemoDocumentos();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const documentosPaginados = allDocumentos.slice(startIndex, endIndex);
    
    return NextResponse.json({
      documentos: documentosPaginados,
      hasMore: endIndex < allDocumentos.length,
      total: allDocumentos.length,
      page,
      limit,
    });
  }
}
