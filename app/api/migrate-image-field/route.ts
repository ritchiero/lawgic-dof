/**
 * Endpoint para migrar campo imagen_social → image_url
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export const maxDuration = 60;

export async function POST() {
  try {
    console.log('🔄 Migrando campo imagen_social → image_url...');

    // Obtener todos los documentos con imagen_social
    const snapshot = await db.collection('documentos_dof')
      .where('imagen_social', '!=', null)
      .get();

    console.log(`📄 Encontrados ${snapshot.size} documentos con imagen_social`);

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.imagen_social) {
        batch.update(doc.ref, {
          image_url: data.imagen_social
        });
        count++;
      }
    });

    await batch.commit();
    console.log(`✅ Migrados ${count} documentos`);

    return NextResponse.json({
      success: true,
      message: 'Migración completada',
      migrated: count,
      total: snapshot.size
    });

  } catch (error) {
    console.error('❌ Error en migración:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
