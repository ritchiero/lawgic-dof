import { NextResponse } from 'next/server';
import { db, collections } from '@/lib/firebase';
import { generateDocumentImageWithRetry } from '@/lib/services/gemini-image-generator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testGemini = searchParams.get('gemini') === 'true';

  // Si se solicita test de Gemini
  if (testGemini) {
    return await testGeminiImage();
  }

  // Test de Firebase (comportamiento original)
  return await testFirebase();
}

async function testGeminiImage() {
  try {
    console.log('🧪 Iniciando prueba de Gemini 3 Pro Image...');

    // Verificar variables de entorno
    const hasCredentials = !!(
      process.env.GOOGLE_CLOUD_PROJECT_ID &&
      process.env.GOOGLE_CLOUD_PRIVATE_KEY &&
      process.env.GOOGLE_CLOUD_CLIENT_EMAIL
    );

    if (!hasCredentials) {
      return NextResponse.json({
        success: false,
        error: 'Credenciales de Google Cloud no configuradas',
        details: {
          GOOGLE_CLOUD_PROJECT_ID: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
          GOOGLE_CLOUD_PRIVATE_KEY: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
          GOOGLE_CLOUD_CLIENT_EMAIL: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        }
      }, { status: 500 });
    }

    // Documento de prueba
    const testDocument = {
      titulo: 'ACUERDO por el que se da a conocer el Programa de Trabajo de la Comisión de Presupuesto',
      resumen: 'La Cámara de Diputados publica el programa de trabajo de la Comisión de Presupuesto.',
      tipo_documento: 'Acuerdo',
      fecha_publicacion: '2025-12-08',
      areas_detectadas: ['fiscal', 'administrativo'],
      social_headline: '¿A dónde va el dinero público en 2026?',
      social_tagline: 'Descubre el programa de trabajo de la Comisión de Presupuesto',
      social_impact_data: 'Presupuesto 2026'
    };

    console.log('📄 Generando imagen para documento de prueba...');
    const startTime = Date.now();

    const result = await generateDocumentImageWithRetry(testDocument, 1);

    const duration = Date.now() - startTime;

    if (result.success && result.imageBase64) {
      console.log(`✅ Imagen generada exitosamente en ${duration}ms`);

      return NextResponse.json({
        success: true,
        duration,
        imageSize: result.imageBase64.length,
        imageDataUrl: `data:image/png;base64,${result.imageBase64}`,
        prompt: result.prompt?.substring(0, 500) + '...',
        message: 'Imagen generada exitosamente con Gemini 3 Pro Image'
      });
    } else {
      console.error('❌ Error generando imagen:', result.error);
      return NextResponse.json({
        success: false,
        duration,
        error: result.error,
        prompt: result.prompt?.substring(0, 500) + '...'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error en test de Gemini:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

async function testFirebase() {
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
    })) as any[];

    return NextResponse.json({
      success: true,
      envCheck,
      firestore: {
        connected: true,
        collection: collections.documentosDof,
        documentsFound: docs.length,
        sampleDocs: docs.map((d: any) => ({
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
