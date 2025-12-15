/**
 * Endpoint de prueba para generación híbrida
 * DALL-E 3 foto de fondo (sin texto) + Sharp texto overlay
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { generatePhotoWithOverlayRetry } from '@/lib/services/photo-overlay-generator';

export async function GET() {
  try {
    console.log('🧪 Probando generación híbrida (foto + overlay)...');

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

    // Generar imagen híbrida
    const result = await generatePhotoWithOverlayRetry({
      titulo: data.titulo,
      resumen: data.resumen || data.extracto || 'Documento oficial del DOF',
      tipo_documento: data.tipo_documento || 'Documento',
      fecha_publicacion: data.fecha_publicacion,
      areas_detectadas: data.areas_detectadas || ['administrativo'],
      social_headline: data.social_copy?.headline,
      social_tagline: data.social_copy?.tagline,
      social_impact_data: data.social_copy?.impact_data,
    });

    const duration = Date.now() - startTime;

    if (result.success && result.imageBase64) {
      const imageSize = Buffer.from(result.imageBase64, 'base64').length;

      return NextResponse.json({
        success: true,
        document: {
          id: doc.id,
          titulo: data.titulo,
        },
        metadata: result.metadata,
        imageSize: Math.round(imageSize / 1024), // KB
        duration,
        imageBase64: result.imageBase64,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        duration,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error en test de foto + overlay:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
