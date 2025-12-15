/**
 * Endpoint para generar datos de tarjeta social
 * Retorna: foto de fondo + datos de texto para composición en frontend
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { generateBackgroundPhotoWithRetry } from '@/lib/services/background-photo-generator';

/**
 * Formatea fecha para display
 */
function formatDate(fecha: any): string {
  if (!fecha) return 'Fecha no disponible';
  
  try {
    let date: Date;
    
    if (fecha._seconds) {
      date = new Date(fecha._seconds * 1000);
    } else if (fecha.toDate) {
      date = fecha.toDate();
    } else if (typeof fecha === 'string') {
      date = new Date(fecha);
    } else {
      date = new Date(fecha);
    }

    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
}

export async function GET() {
  try {
    console.log('🎴 Generando datos de tarjeta social...');

    // Obtener un documento reciente del DOF
    const docsSnapshot = await db.collection('documentos_dof')
      .orderBy('fecha_publicacion', 'desc')
      .limit(1)
      .get();

    if (docsSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'No se encontraron documentos',
      });
    }

    const doc = docsSnapshot.docs[0];
    const data = doc.data();

    console.log(`📄 Documento: ${data.titulo?.substring(0, 60)}...`);

    const startTime = Date.now();

    // Generar foto de fondo
    const categoria = data.areas_detectadas?.[0] || data.tipo_documento || 'administrativo';
    
    const photoResult = await generateBackgroundPhotoWithRetry({
      titulo: data.titulo,
      categoria,
    });

    const duration = Date.now() - startTime;

    if (photoResult.success && photoResult.photoBase64) {
      const photoSize = Buffer.from(photoResult.photoBase64, 'base64').length;

      // Preparar datos de texto para el frontend
      const textData = {
        titulo: data.titulo,
        resumen: data.resumen || data.extracto || 'Documento oficial del Diario Oficial de la Federación',
        fecha: formatDate(data.fecha_publicacion),
        categoria: categoria.toUpperCase(),
        tiempoLectura: '1 min',
      };

      return NextResponse.json({
        success: true,
        document: {
          id: doc.id,
          titulo: data.titulo,
        },
        backgroundPhoto: {
          base64: photoResult.photoBase64,
          url: photoResult.photoUrl,
          size: Math.round(photoSize / 1024), // KB
        },
        textData,
        metadata: photoResult.metadata,
        duration,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: photoResult.error,
        duration,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error generando datos de tarjeta:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
