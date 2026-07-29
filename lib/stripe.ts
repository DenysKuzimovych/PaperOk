import Stripe from "stripe";
import type { Cart } from "./types";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia" as any,
});

export async function createCheckoutSession(
  cart: Cart,
  orderId: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string,
) {
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
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/** Optional — only needed if you configure a Stripe webhook endpoint. */
export function constructStripeEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event | null {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return null;
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
