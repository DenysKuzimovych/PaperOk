"use server";

import { createOrder as createOrderInDb } from "lib/supabase/orders";
import { validateCartPrices } from "lib/supabase/validate-cart";
import { isStripeEnabled } from "lib/stripe";
import {
  calculateShipping,
  estimateParcelWeight,
  isSpeedyConfigured,
} from "lib/speedy";
import type { CreateOrderData } from "lib/supabase/orders";
import type { CartItem } from "lib/types";
import { isValidEmail, isValidPhone, VALIDATION_MESSAGES } from "lib/validation";

export async function createOrder(
  data: CreateOrderData,
  cartItems?: CartItem[],
) {
  try {
    if (!data.customer_name?.trim()) {
      throw new Error(VALIDATION_MESSAGES.required);
    }
    if (!isValidEmail(data.customer_email || "")) {
      throw new Error(VALIDATION_MESSAGES.email);
    }
    if (!isValidPhone(data.customer_phone || "")) {
      throw new Error(VALIDATION_MESSAGES.phone);
    }

    if (data.payment_method === "card" && !isStripeEnabled()) {
      throw new Error("Плащането с карта не е налично");
    }

    if (!data.shipping_method || data.shipping_site_id == null) {
      throw new Error("Моля, изберете начин на доставка със Speedy");
    }

    if (!isSpeedyConfigured()) {
      throw new Error("Доставката със Speedy временно не е налична");
    }

    let productsSubtotal = data.products_subtotal ?? 0;

    if (cartItems && cartItems.length > 0) {
      const validation = await validateCartPrices(cartItems);
      if (!validation.valid) {
        throw new Error(validation.error || "Невалидна количка");
      }
      productsSubtotal = validation.total ?? productsSubtotal;
    }

    const itemCount =
      cartItems?.reduce((sum, i) => sum + i.quantity, 0) ||
      data.products.reduce((sum, p) => sum + p.quantity, 0) ||
      1;

    const needsOffice =
      data.shipping_method === "office" || data.shipping_method === "apt";
    if (needsOffice && !data.shipping_office_id) {
      throw new Error("Моля, изберете офис или автомат на Speedy");
    }

    const calc = await calculateShipping({
      siteId: data.shipping_site_id,
      officeId: needsOffice ? data.shipping_office_id : undefined,
      weightKg: estimateParcelWeight(itemCount),
    });

    const shippingPrice = calc.priceTotal;
    const expectedTotal = productsSubtotal + shippingPrice;

    if (Math.abs(expectedTotal - data.total_price) > 0.05) {
      throw new Error(
        "Цената на доставката се е променила. Моля, опреснете и опитайте отново.",
      );
    }

    const order = await createOrderInDb({
      ...data,
      products_subtotal: productsSubtotal,
      shipping_price: shippingPrice,
      total_price: expectedTotal,
      shipping_deadline: calc.deliveryDeadline || data.shipping_deadline,
    });
    return order;
  } catch (error: any) {
    console.error("Error creating order:", error);
    throw new Error(error.message || "Грешка при създаване на поръчката");
  }
}
