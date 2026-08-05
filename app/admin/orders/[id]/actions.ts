"use server";

import {
  updateOrderStatus as updateStatus,
  updateOrder,
  type UpdateOrderData,
  type OrderStatus,
} from "lib/supabase/orders";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
) {
  const order = await updateStatus(orderId, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return order;
}

export async function updateOrderFields(
  orderId: string,
  data: UpdateOrderData,
) {
  const order = await updateOrder(orderId, data);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return order;
}
