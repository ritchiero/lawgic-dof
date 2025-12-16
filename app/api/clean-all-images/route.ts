/**
 * Endpoint para BORRAR todas las imágenes y limpiar campos image_url
 * CUIDADO: Esta operación es destructiva
 */

import { NextResponse } from 'next/server';
import { db, storage } from '@/lib/firebase';

export const maxDuration = 300; // 5 minutos

export async function POST() {
  try {
    console.log('🗑️ Iniciando limpieza de todas las imágenes...');

    // 1. Listar y borrar todas las imágenes del bucket
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: 'document-images/' });
    
    console.log(`📦 Encontradas ${files.length} imágenes en Storage`);
    
    let deletedCount = 0;
    for (const file of files) {
      try {
        await file.delete();
        deletedCount++;
        console.log(`  ✓ Borrada: ${file.name}`);
      } catch (error) {
        console.error(`  ✗ Error borrando ${file.name}:`, error);
      }
    }

    console.log(`✅ Borradas ${deletedCount}/${files.length} imágenes de Storage`);

    // 2. Limpiar campo image_url de todos los documentos
    const docsSnapshot = await db.collection('documentos_dof').get();
    console.log(`📄 Encontrados ${docsSnapshot.size} documentos en Firestore`);

    let updatedCount = 0;
    const batch = db.batch();
    
    docsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.image_url) {
        batch.update(doc.ref, { image_url: null });
        updatedCount++;
      }
    });

    await batch.commit();
    console.log(`✅ Limpiados ${updatedCount} campos image_url en Firestore`);

    return NextResponse.json({
      success: true,
      message: 'Limpieza completada',
      stats: {
        imagesDeleted: deletedCount,
        documentsUpdated: updatedCount,
        totalFiles: files.length,
        totalDocuments: docsSnapshot.size
      }
    });

  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
