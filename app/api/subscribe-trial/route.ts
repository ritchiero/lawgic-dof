import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, nombre, areas } = await request.json();

    // Validar datos
    if (!email || !areas || areas.length === 0) {
      return NextResponse.json(
        { error: 'Email y áreas son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.collection(collections.usuarios)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        { 
          error: 'email_exists',
          message: 'Este email ya está registrado. Si ya tienes una cuenta, revisa tu email para acceder.',
          email 
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Calcular fecha de fin de prueba (7 días desde hoy)
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Crear usuario con prueba gratis
    const userRef = await db.collection(collections.usuarios).add({
      email,
      nombre: nombre || email.split('@')[0],
      estado: 'trial', // trial, active, cancelled
      trial_ends_at: trialEndsAt.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      stripe_customer_id: null,
      stripe_subscription_id: null,
    });

    // Guardar áreas del usuario
    const batch = db.batch();
    areas.forEach((areaCode: string) => {
      const areaRef = db.collection(collections.areasUsuario).doc();
      batch.set(areaRef, {
        usuario_id: userRef.id,
        area_codigo: areaCode,
        created_at: now.toISOString(),
      });
    });
    await batch.commit();

    // TODO: Enviar email de bienvenida con Resend
    // await sendWelcomeEmail(email, nombre, areas);

    return NextResponse.json({
      success: true,
      userId: userRef.id,
      trialEndsAt: trialEndsAt.toISOString(),
      message: '¡Cuenta creada! Revisa tu email para confirmar.',
    });
  } catch (error: any) {
    console.error('Error creating trial user:', error);
    
    // Manejo específico de errores de Firebase
    if (error.code === 'permission-denied') {
      return NextResponse.json(
        { 
          error: 'permission_denied',
          message: 'Error de permisos. Por favor contacta a soporte.' 
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Error al crear la cuenta. Por favor intenta de nuevo en unos momentos.' 
      },
      { status: 500 }
    );
  }
}
