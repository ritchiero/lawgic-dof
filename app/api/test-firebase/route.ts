import { NextResponse } from 'next/server';
import { db, collections } from '@/lib/firebase';

export async function GET() {
  try {
    // Test 1: Verificar variables de entorno
    const envCheck = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_PRIVATE_KEY_length: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      FIREBASE_PRIVATE_KEY_starts_with: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30) || '',
    };

    // Test 2: Intentar conectar a Firestore
    const docsSnapshot = await db.collection(collections.documentosDof)
      .limit(5)
      .get();

    const docs = docsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      envCheck,
      firestore: {
        connected: true,
        collection: collections.documentosDof,
        documentsFound: docs.length,
        sampleDocs: docs.map(d => ({
          id: d.id,
          titulo: d.titulo?.substring(0, 50) || 'Sin título',
          fecha: d.fecha_publicacion || 'Sin fecha'
        }))
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      errorStack: error.stack,
      envCheck: {
        FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_PRIVATE_KEY_length: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
        FIREBASE_PRIVATE_KEY_starts_with: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30) || '',
      }
    }, { status: 500 });
  }
}
