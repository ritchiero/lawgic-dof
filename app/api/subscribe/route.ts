import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, collections } from '@/lib/firebase';
import { SubscribeRequest } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' })
  : null;

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();
    const { email, nombre, areas } = body;

    // Validar datos
    if (!email || !areas || areas.length === 0) {
      return NextResponse.json(
        { error: 'Email y áreas son requeridos' },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Crear usuario en Firestore con status pending
    const usuarioRef = db.collection(collections.usuarios).doc();
    await usuarioRef.set({
      email,
      nombre: nombre || '',
      status: 'pending',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });

    // Guardar áreas seleccionadas temporalmente en metadata
    // (se guardarán definitivamente después del pago exitoso)
    const metadata = {
      usuario_id: usuarioRef.id,
      areas: areas.join(','),
    };

    // Crear Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: 'DOF Alertas - Suscripción Mensual',
              description: `Alertas diarias del DOF para: ${areas.join(', ')}`,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: 4900, // $49 MXN
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?cancelled=true`,
      metadata,
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (error) {
    console.error('Error en /api/subscribe:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
