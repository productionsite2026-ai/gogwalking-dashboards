/**
 * Service Stripe - Gestion des paiements avec système escrow
 * Paiement bloqué lors de la réservation, libération après mission
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.REACT_APP_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface EscrowPayment {
  bookingId: string;
  amount: number;
  currency: string;
  walkerEmail: string;
  ownerEmail: string;
  missionDescription: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'released' | 'refunded';
  paymentIntentId: string;
  amount: number;
  createdAt: Date;
  releasedAt?: Date;
}

/**
 * Créer un paiement en escrow (fonds bloqués)
 */
export async function createEscrowPayment(payment: EscrowPayment): Promise<string> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(payment.amount * 100), // Convertir en centimes
      currency: payment.currency.toLowerCase(),
      description: `Réservation - ${payment.missionDescription}`,
      metadata: {
        bookingId: payment.bookingId,
        walkerEmail: payment.walkerEmail,
        ownerEmail: payment.ownerEmail,
        type: 'escrow',
      },
      // Capturer le paiement manuellement (escrow)
      capture_method: 'manual',
    });

    return paymentIntent.id;
  } catch (error) {
    console.error('Erreur création paiement escrow:', error);
    throw new Error('Impossible de créer le paiement');
  }
}

/**
 * Confirmer le paiement (capturer les fonds)
 */
export async function confirmEscrowPayment(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    throw new Error('Impossible de confirmer le paiement');
  }
}

/**
 * Libérer les fonds (après mission complétée avec code de fin)
 */
export async function releaseEscrowPayment(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Erreur libération paiement:', error);
    throw new Error('Impossible de libérer les fonds');
  }
}

/**
 * Rembourser le paiement (en cas d'annulation)
 */
export async function refundEscrowPayment(paymentIntentId: string, reason: string): Promise<boolean> {
  try {
    // Récupérer le charge ID du payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent.charges.data[0]) {
      throw new Error('Aucune charge trouvée');
    }

    const chargeId = paymentIntent.charges.data[0].id;

    // Créer le remboursement
    const refund = await stripe.refunds.create({
      charge: chargeId,
      reason: reason as any,
      metadata: {
        bookingId: paymentIntent.metadata?.bookingId,
      },
    });

    return refund.status === 'succeeded';
  } catch (error) {
    console.error('Erreur remboursement:', error);
    throw new Error('Impossible de rembourser le paiement');
  }
}

/**
 * Récupérer le statut du paiement
 */
export async function getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      status: paymentIntent.status as any,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convertir de centimes
      createdAt: new Date(paymentIntent.created * 1000),
    };
  } catch (error) {
    console.error('Erreur récupération statut:', error);
    throw new Error('Impossible de récupérer le statut du paiement');
  }
}

/**
 * Créer une session de paiement pour le client
 */
export async function createPaymentSession(payment: EscrowPayment): Promise<string> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: payment.currency.toLowerCase(),
            product_data: {
              name: `Réservation - ${payment.missionDescription}`,
              description: `Paiement sécurisé pour la mission`,
            },
            unit_amount: Math.round(payment.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.REACT_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.REACT_APP_URL}/booking/cancel`,
      metadata: {
        bookingId: payment.bookingId,
        walkerEmail: payment.walkerEmail,
        ownerEmail: payment.ownerEmail,
      },
    });

    return session.id || '';
  } catch (error) {
    console.error('Erreur création session paiement:', error);
    throw new Error('Impossible de créer la session de paiement');
  }
}

export default stripe;
