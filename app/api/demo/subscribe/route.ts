import { NextRequest, NextResponse } from 'next/server';

// Modo demo: simula suscripción sin Stripe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nombre, areas } = body;

    // Validar datos
    if (!email || !areas || areas.length === 0) {
      return NextResponse.json(
        { error: 'Email y áreas son requeridos' },
        { status: 400 }
      );
    }

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 500));

    // En modo demo, redirigir directamente a página de gracias
    const demoSessionId = `demo_${Date.now()}`;
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gracias?session_id=${demoSessionId}&demo=true`;

    // Guardar en localStorage del cliente (simulado)
    return NextResponse.json({
      success: true,
      demo: true,
      session_id: demoSessionId,
      redirect_url: successUrl,
      message: 'Suscripción demo creada exitosamente',
    });
  } catch (error) {
    console.error('Error en demo subscribe:', error);
    return NextResponse.json(
      { error: 'Error procesando suscripción demo' },
      { status: 500 }
    );
  }
}
