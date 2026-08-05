import { createServiceClient } from "./service";
import { sendNewOrderNotification } from "lib/email";

export interface CreateOrderData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    variant_name?: string;
  }>;
  total_price: number;
  products_subtotal?: number;
  payment_method: "cash_on_delivery" | "card" | "bank_transfer";
  comment?: string;
  idempotency_key?: string;
  shipping_method?: "office" | "apt" | "address";
  shipping_price?: number;
  shipping_site_id?: number;
  shipping_site_name?: string;
  shipping_office_id?: number;
  shipping_office_name?: string;
  shipping_deadline?: string;
  shipping_details?: Record<string, unknown>;
}

export type OrderStatus =
  | "new"
  | "pending_payment"
  | "confirmed"
  | "shipped"
  | "paid"
  | "completed"
  | "canceled";

/**
 * Create a new order. Returns existing order if idempotency_key matches.
 */
export async function createOrder(data: CreateOrderData) {
  const supabase = createServiceClient();

  if (data.idempotency_key) {
    const { data: existing } = await supabase
      .from("orders")
      .select("*")
      .eq("idempotency_key", data.idempotency_key)
      .maybeSingle();

    if (existing) {
      return existing;
    }
  }

  const productsJson = data.products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    ...(product.variant_name ? { variant_name: product.variant_name } : {}),
  }));

  const initialStatus =
    data.payment_method === "card" ? "pending_payment" : "new";

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone || null,
      customer_address: data.customer_address,
      products: productsJson,
      total_price: data.total_price,
      products_subtotal: data.products_subtotal ?? null,
      payment_method: data.payment_method,
      status: initialStatus,
      comment: data.comment || null,
      idempotency_key: data.idempotency_key || null,
      shipping_method: data.shipping_method || null,
      shipping_price: data.shipping_price ?? 0,
      shipping_site_id: data.shipping_site_id ?? null,
      shipping_site_name: data.shipping_site_name || null,
      shipping_office_id: data.shipping_office_id ?? null,
      shipping_office_name: data.shipping_office_name || null,
      shipping_deadline: data.shipping_deadline || null,
      shipping_details: data.shipping_details || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505" && data.idempotency_key) {
      const { data: existing } = await supabase
        .from("orders")
        .select("*")
        .eq("idempotency_key", data.idempotency_key)
        .single();
      if (existing) return existing;
    }
    console.error("Error creating order:", error);
    throw new Error("Failed to create order");
  }

  if (!order) {
    throw new Error("Failed to create order");
  }

  return order;
}

export async function getOrderById(orderId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !data) {
    throw new Error("Order not found");
  }

  return data;
}

export async function getOrderByStripeSessionId(sessionId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to fetch order");
  }

  return data;
}

export async function updateOrderStripeSession(
  orderId: string,
  stripeSessionId: string,
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      stripe_session_id: stripeSessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Тази поръчка вече има активна сесия за плащане");
    }
    throw new Error("Failed to update order with Stripe session");
  }

  return data;
}

/**
 * Mark order as paid and send notification email exactly once.
 */
export async function fulfillPaidOrder(orderId: string) {
  const supabase = createServiceClient();

  const order = await getOrderById(orderId);

  if (order.email_sent_at && order.status === "paid") {
    return order;
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !updated) {
    throw new Error("Failed to update order status");
  }

  if (!updated.email_sent_at) {
    const result = await sendNewOrderNotification({
      orderId: updated.id,
      customerName: updated.customer_name,
      customerEmail: updated.customer_email,
      customerPhone: updated.customer_phone || undefined,
      customerAddress: updated.customer_address,
      totalPrice: Number(updated.total_price),
      productsSubtotal:
        updated.products_subtotal != null
          ? Number(updated.products_subtotal)
          : undefined,
      shippingPrice:
        updated.shipping_price != null
          ? Number(updated.shipping_price)
          : undefined,
      paymentMethod: updated.payment_method as
        | "cash_on_delivery"
        | "card"
        | "bank_transfer",
      products: (updated.products as any[]).map((p: any) => ({
        id: p.id,
        name: p.variant_name ? `${p.name} (${p.variant_name})` : p.name,
        price: Number(p.price),
        quantity: p.quantity,
      })),
      comment: updated.comment || undefined,
    });

    if (!result.success) {
      console.warn(
        "Order email skipped/failed (order still fulfilled):",
        result.error,
      );
    }

    await supabase
      .from("orders")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", orderId);
  }

  return updated;
}

/**
 * Send notification for COD order exactly once.
 */
export async function fulfillCodOrder(orderId: string) {
  const supabase = createServiceClient();
  const order = await getOrderById(orderId);

  if (order.email_sent_at) {
    return order;
  }

  const result = await sendNewOrderNotification({
    orderId: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone || undefined,
    customerAddress: order.customer_address,
    totalPrice: Number(order.total_price),
    productsSubtotal:
      order.products_subtotal != null
        ? Number(order.products_subtotal)
        : undefined,
    shippingPrice:
      order.shipping_price != null ? Number(order.shipping_price) : undefined,
    paymentMethod: (order.payment_method || "cash_on_delivery") as
      | "cash_on_delivery"
      | "card"
      | "bank_transfer",
    products: (order.products as any[]).map((p: any) => ({
      id: p.id,
      name: p.variant_name ? `${p.name} (${p.variant_name})` : p.name,
      price: Number(p.price),
      quantity: p.quantity,
    })),
    comment: order.comment || undefined,
  });

  if (!result.success) {
    console.warn(
      "COD order email skipped/failed (order still accepted):",
      result.error,
    );
  }

  // Always mark so refresh does not keep retrying Resend
  const { data } = await supabase
    .from("orders")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();

  return data || order;
}

export async function getAllOrders() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch orders");
  }

  return data || [];
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !data) {
    throw new Error("Failed to update order status");
  }

  return data;
}

export interface UpdateOrderData {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  total_price?: number;
  payment_method?: "cash_on_delivery" | "card" | "bank_transfer";
  status?: OrderStatus;
  comment?: string;
  created_at?: string;
}

export async function updateOrder(orderId: string, data: UpdateOrderData) {
  const supabase = createServiceClient();

  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: order, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select()
    .single();

  if (error || !order) {
    throw new Error("Failed to update order");
  }

  return order;
}
