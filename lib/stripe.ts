import Stripe from "stripe";
import type { Cart } from "./types";

/** True when STRIPE_SECRET_KEY is set — server-side card payments. */
export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/**
 * Client-visible flag (NEXT_PUBLIC_*). Both keys should be set for card checkout;
 * the UI uses the publishable key to decide whether to show “Плащане с карта”.
 */
export function isStripePublicEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Плащането с карта не е конфигурирано");
  }
  return new Stripe(key, {
    apiVersion: "2024-11-20.acacia" as any,
  });
}

export async function createCheckoutSession(
  cart: Cart,
  orderId: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string,
) {
  const stripe = getStripe();
  const currency = "eur";

  const lineItems = cart.items.map((item) => ({
    price_data: {
      currency,
      product_data: {
        name: item.variant.title
          ? `${item.product.title} — ${item.variant.title}`
          : item.product.title,
        images: item.product.image.url ? [item.product.image.url] : [],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    currency,
    locale: "bg",
    customer_email: customerEmail,
    metadata: {
      orderId,
    },
  });

  return session;
}

export async function getSession(sessionId: string) {
  return await getStripe().checkout.sessions.retrieve(sessionId);
}

/** Optional — only needed if you configure a Stripe webhook endpoint. */
export function constructStripeEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event | null {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !isStripeEnabled()) return null;
  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}
