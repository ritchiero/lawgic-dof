/**
 * Endpoint para regenerar la imagen de UN solo documento
 * Usado por la interfaz de regeneración masiva
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { generateImageWithFallback } from '@/lib/services/dalle-image-generator';
import { uploadDocumentImage } from '@/lib/services/image-storage';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Aceptar documentId desde query param o body
    const searchParams = request.nextUrl.searchParams;
    let documentId = searchParams.get('id') || searchParams.get('documentId');
    
    if (!documentId) {
      try {
        const body = await request.json();
        documentId = body.documentId;
      } catch (e) {
        // Body vacío o inválido, continuar con null
      }
    }

    if (!documentId) {
      return NextResponse.json({
        success: false,
        error: 'documentId requerido (query param ?id=xxx o body JSON)'
      }, { status: 400 });
    }

    console.log(`🔄 Regenerando imagen para documento: ${documentId}`);

    // Obtener documento
    const docRef = db.collection('documentos_dof').doc(documentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({
        success: false,
        error: 'Documento no encontrado'
      }, { status: 404 });
    }

    const data = docSnap.data()!;
    const titulo = data.titulo || '';
    const resumen = data.resumen || '';
    const categoria = data.categoria || 'general';
    const tipo = data.tipo_documento || 'Acuerdo';

    console.log(`📝 Título: ${titulo.substring(0, 60)}...`);

    // Generar imagen con nuevo sistema
    const imageResult = await generateImageWithFallback({
      categoria,
      titulo,
      tipo,
      documentoId: documentId,
      resumen,
    });

    if (!imageResult.buffer) {
      throw new Error('No se pudo generar la imagen');
    }

    // Subir imagen a storage
    console.log(`📤 Subiendo imagen...`);
    const imageBase64 = imageResult.buffer.toString('base64');
    const uploadResult = await uploadDocumentImage({
      imageBase64,
      documentId,
      format: 'png',
    });

    if (!uploadResult.success || !uploadResult.publicUrl) {
      throw new Error('Error subiendo imagen');
    }

    // Actualizar documento en Firestore
    await docRef.update({
      image_url: uploadResult.publicUrl,
      imagen_regenerada: new Date().toISOString(),
    });

    console.log(`✅ Imagen regenerada: ${uploadResult.publicUrl}`);

    return NextResponse.json({
      success: true,
      documentId,
      imageUrl: uploadResult.publicUrl,
      titulo: titulo.substring(0, 100),
    });

  } catch (error) {
    console.error('❌ Error regenerando imagen:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}
