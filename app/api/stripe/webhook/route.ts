import { NextRequest, NextResponse } from "next/server";
import { constructStripeEvent } from "lib/stripe";
import {
  fulfillPaidOrder,
  getOrderByStripeSessionId,
} from "lib/supabase/orders";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  const event = constructStripeEvent(body, signature);
  if (!event) {
    return NextResponse.json(
      { error: "Webhook not configured — payments verified on success page" },
      { status: 501 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("Webhook: missing orderId in session metadata");
      return NextResponse.json({ received: true });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const existingBySession = await getOrderByStripeSessionId(session.id);
    const targetOrderId = existingBySession?.id || orderId;

    try {
      await fulfillPaidOrder(targetOrderId);
    } catch (err) {
      console.error("Webhook fulfill error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
