"use server";

import { updateOrderStatus as updateStatus, updateOrder, type UpdateOrderData, type OrderStatus } from "lib/supabase/orders";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  return await updateStatus(orderId, status);
}

export async function updateOrderFields(
  orderId: string,
  data: UpdateOrderData
) {
  return await updateOrder(orderId, data);
}
