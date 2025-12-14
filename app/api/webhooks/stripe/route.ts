import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, collections } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Error verificando webhook:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Guardar evento en Firestore
    await db.collection(collections.webhookEvents).add({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data,
      processed: false,
      created_at: FieldValue.serverTimestamp(),
    });

    // Procesar el evento
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    // Marcar evento como procesado
    const webhookQuery = await db
      .collection(collections.webhookEvents)
      .where('stripe_event_id', '==', event.id)
      .limit(1)
      .get();

    if (!webhookQuery.empty) {
      await webhookQuery.docs[0].ref.update({ processed: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata?.usuario_id) return;

  const areas = metadata.areas?.split(',') || [];

  // Actualizar usuario con información de Stripe
  await db.collection(collections.usuarios).doc(metadata.usuario_id).update({
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: session.subscription as string,
    status: 'active',
    updated_at: FieldValue.serverTimestamp(),
  });

  // Guardar áreas del usuario
  const batch = db.batch();
  areas.forEach((area) => {
    const areaRef = db.collection(collections.areasUsuario).doc();
    batch.set(areaRef, {
      usuario_id: metadata.usuario_id,
      area_codigo: area,
      created_at: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();

  console.log(`Usuario ${metadata.usuario_id} activado con áreas:`, areas);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const usuariosQuery = await db
    .collection(collections.usuarios)
    .where('stripe_subscription_id', '==', subscription.id)
    .limit(1)
    .get();

  if (!usuariosQuery.empty) {
    await usuariosQuery.docs[0].ref.update({
      status: 'cancelled',
      updated_at: FieldValue.serverTimestamp(),
    });
  }

  console.log(`Suscripción ${subscription.id} cancelada`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  let status: string;

  switch (subscription.status) {
    case 'active':
      status = 'active';
      break;
    case 'past_due':
      status = 'past_due';
      break;
    case 'canceled':
      status = 'cancelled';
      break;
    default:
      status = 'pending';
  }

  const usuariosQuery = await db
    .collection(collections.usuarios)
    .where('stripe_subscription_id', '==', subscription.id)
    .limit(1)
    .get();

  if (!usuariosQuery.empty) {
    await usuariosQuery.docs[0].ref.update({
      status,
      updated_at: FieldValue.serverTimestamp(),
    });
  }

  console.log(`Suscripción ${subscription.id} actualizada a ${status}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = (invoice as Stripe.Invoice & { subscription?: unknown }).subscription;
  if (!subscription) return;

  const subscriptionId =
    typeof subscription === 'string'
      ? subscription
      : typeof subscription === 'object' && subscription !== null && 'id' in subscription
        ? (subscription as { id: string }).id
        : null;

  if (!subscriptionId) return;

  const usuariosQuery = await db
    .collection(collections.usuarios)
    .where('stripe_subscription_id', '==', subscriptionId)
    .limit(1)
    .get();

  if (!usuariosQuery.empty) {
    await usuariosQuery.docs[0].ref.update({
      status: 'past_due',
      updated_at: FieldValue.serverTimestamp(),
    });
  }

  console.log(`Pago fallido para suscripción ${subscriptionId}`);
}
