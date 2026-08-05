"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "components/cart/cart-context";
import Price from "components/price";
import { createOrder } from "app/checkout/actions";
import LoadingDots from "components/loading-dots";
import { CARD_PAYMENTS_ENABLED } from "lib/constants";
import {
  SpeedyShippingForm,
  type SpeedyShippingSelection,
} from "components/checkout/speedy-shipping-form";

type PaymentMethod = "cash_on_delivery" | "card";

function generateIdempotencyKey() {
  return crypto.randomUUID();
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipping, setShipping] = useState<SpeedyShippingSelection | null>(
    null,
  );
  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    payment_method: "cash_on_delivery" as PaymentMethod,
    comment: "",
    privacy_policy_accepted: false,
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="mb-4 text-3xl font-bold text-paper-heading">
            Количката е празна
          </h1>
          <p className="mb-8 text-lg text-paper-text">
            Моля, добавете продукти в количката преди да финализирате поръчката.
          </p>
          <button
            onClick={() => router.push("/search")}
            className="btn-primary"
          >
            Към продуктите
          </button>
        </div>
      </div>
    );
  }

  const productsSubtotal = cart.subtotal;
  const shippingPrice = shipping?.shippingPrice ?? 0;
  const grandTotal = productsSubtotal + shippingPrice;
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shipping) {
      setError("Моля, изберете населено място и начин на доставка");
      return;
    }
    if (!formData.customer_phone.trim()) {
      setError("Телефонът е задължителен за доставка със Speedy");
      return;
    }

    setIsSubmitting(true);

    try {
      const products = cart.items.map((item) => ({
        id: item.productId,
        name: item.product.title,
        price: item.price,
        quantity: item.quantity,
        variant_name:
          item.variant.title && item.variant.title !== item.product.title
            ? item.variant.title
            : undefined,
      }));

      const order = await createOrder(
        {
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          customer_address: shipping.customerAddressSummary,
          products,
          products_subtotal: productsSubtotal,
          total_price: grandTotal,
          payment_method: formData.payment_method,
          comment: formData.comment || undefined,
          idempotency_key: idempotencyKeyRef.current,
          shipping_method: shipping.method,
          shipping_price: shipping.shippingPrice,
          shipping_site_id: shipping.siteId,
          shipping_site_name: shipping.siteName,
          shipping_office_id: shipping.officeId,
          shipping_office_name: shipping.officeName,
          shipping_deadline: shipping.deliveryDeadline,
          shipping_details: {
            addressLine: shipping.addressLine,
            method: shipping.method,
          },
        },
        cart.items,
      );

      if (formData.payment_method === "card") {
        if (!CARD_PAYMENTS_ENABLED) {
          throw new Error("Плащането с карта не е налично");
        }
        const response = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            cart,
            shippingPrice: shipping.shippingPrice,
          }),
        });

        if (!response.ok) {
          throw new Error("Грешка при създаване на сесия за плащане");
        }

        const { url } = await response.json();
        if (url) {
          window.location.href = url;
          return;
        }
      } else {
        router.push(`/checkout/success?orderId=${order.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Грешка при създаване на поръчката");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-paper-heading">
          Финализиране на поръчката
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-lg bg-paper-white p-6 shadow"
            >
              <h2 className="mb-6 text-xl font-semibold text-paper-heading">
                Данни за поръчката
              </h2>

              {error ? (
                <div className="mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="customer_name"
                    className="mb-1 block text-sm font-medium text-paper-heading"
                  >
                    Име и фамилия *
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-paper-border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-paper-green"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer_email"
                    className="mb-1 block text-sm font-medium text-paper-heading"
                  >
                    Имейл *
                  </label>
                  <input
                    type="email"
                    id="customer_email"
                    required
                    value={formData.customer_email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_email: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-paper-border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-paper-green"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer_phone"
                    className="mb-1 block text-sm font-medium text-paper-heading"
                  >
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    required
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_phone: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-paper-border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-paper-green"
                    placeholder="08XXXXXXXX"
                  />
                </div>

                <SpeedyShippingForm
                  itemCount={itemCount}
                  onChange={setShipping}
                />

                <div>
                  <label
                    htmlFor="comment"
                    className="mb-1 block text-sm font-medium text-paper-heading"
                  >
                    Коментар (по избор)
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    className="w-full rounded-lg border border-paper-border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-paper-green"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-paper-heading">
                    Начин на плащане *
                  </label>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center rounded-lg border border-paper-border p-4 hover:bg-paper-bg">
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash_on_delivery"
                        checked={
                          formData.payment_method === "cash_on_delivery"
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payment_method: e.target.value as PaymentMethod,
                          })
                        }
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-paper-heading">
                          Наложен платеж
                        </div>
                        <div className="text-sm text-paper-muted">
                          Плащане при получаване на пратката
                        </div>
                      </div>
                    </label>

                    {CARD_PAYMENTS_ENABLED ? (
                      <label className="flex cursor-pointer items-center rounded-lg border border-paper-border p-4 hover:bg-paper-bg">
                        <input
                          type="radio"
                          name="payment_method"
                          value="card"
                          checked={formData.payment_method === "card"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              payment_method: e.target.value as PaymentMethod,
                            })
                          }
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-paper-heading">
                            Плащане с карта
                          </div>
                          <div className="text-sm text-paper-muted">
                            Сигурно плащане чрез Stripe
                          </div>
                        </div>
                      </label>
                    ) : null}
                  </div>
                </div>

                <div className="pt-4">
                  <label className="flex cursor-pointer items-start space-x-3">
                    <input
                      type="checkbox"
                      required
                      checked={formData.privacy_policy_accepted}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          privacy_policy_accepted: e.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 rounded border-paper-border text-paper-green focus:ring-paper-green"
                    />
                    <span className="text-sm text-paper-heading">
                      Съгласен съм с{" "}
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-paper-green underline hover:text-paper-green-hover"
                      >
                        Политиката за поверителност
                      </a>{" "}
                      и се съгласявам обработката на моите лични данни за целите
                      на поръчката. *
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.privacy_policy_accepted ||
                    !shipping
                  }
                  className="btn-primary flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <LoadingDots className="bg-paper-white" />
                  ) : (
                    "Финализирай поръчката"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg bg-paper-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-paper-heading">
                Резюме на поръчката
              </h2>

              <div className="mb-6 space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between border-b border-paper-border pb-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-paper-heading">
                        {item.product.title}
                      </p>
                      <p className="text-sm text-paper-muted">
                        Количество: {item.quantity}
                      </p>
                    </div>
                    <Price
                      amount={(item.price * item.quantity).toString()}
                      currencyCode={cart.currency}
                      className="text-sm font-medium"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-paper-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-paper-text">Продукти</span>
                  <Price
                    amount={productsSubtotal.toString()}
                    currencyCode={cart.currency}
                    className="font-medium"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-paper-text">Доставка (Speedy)</span>
                  {shipping ? (
                    <Price
                      amount={shippingPrice.toString()}
                      currencyCode={cart.currency}
                      className="font-medium"
                    />
                  ) : (
                    <span className="text-paper-muted">Изберете доставка</span>
                  )}
                </div>
                <div className="flex justify-between pt-2 text-lg font-bold">
                  <span className="text-paper-heading">Общо</span>
                  <Price
                    amount={grandTotal.toString()}
                    currencyCode={cart.currency}
                    className="text-paper-green"
                  />
                </div>
                <div className="mt-4 border-t border-paper-border pt-4">
                  <p className="text-center text-xs text-paper-muted">
                    Цените се изчисляват по курс 1 EUR = 1.95583 BGN
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
