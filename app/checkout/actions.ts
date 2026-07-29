"use server";

import { createOrder as createOrderInDb } from "lib/supabase/orders";
import { validateCartPrices } from "lib/supabase/validate-cart";
import type { CreateOrderData } from "lib/supabase/orders";
import type { CartItem } from "lib/types";

export async function createOrder(
  data: CreateOrderData,
  cartItems?: CartItem[],
) {
  try {
    if (cartItems && cartItems.length > 0) {
      const validation = await validateCartPrices(cartItems);
      if (!validation.valid) {
        throw new Error(validation.error || "Невалидна количка");
      }
      if (
        validation.total !== undefined &&
        Math.abs(validation.total - data.total_price) > 0.01
      ) {
        throw new Error(
          "Общата сума не съвпада. Моля, обновете количката.",
        );
      }
    }

    const order = await createOrderInDb(data);
    return order;
  } catch (error: any) {
    console.error("Error creating order:", error);
    throw new Error(error.message || "Грешка при създаване на поръчката");
  }
}
