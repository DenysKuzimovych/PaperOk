"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "components/cart/cart-context";
import Price from "components/price";
import { createOrder } from "app/checkout/actions";
import LoadingDots from "components/loading-dots";
import { CARD_PAYMENTS_ENABLED } from "lib/constants";

function generateIdempotencyKey() {
  return crypto.randomUUID();
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    payment_method: "cash_on_delivery" as "cash_on_delivery" | "card",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Prepare products data
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
          customer_phone: formData.customer_phone || undefined,
          customer_address: formData.customer_address,
          products,
          total_price: cart.total,
          payment_method: formData.payment_method,
          comment: formData.comment || undefined,
          idempotency_key: idempotencyKeyRef.current,
        },
        cart.items,
      );

      // If card payment, redirect to Stripe
      if (formData.payment_method === "card") {
        if (!CARD_PAYMENTS_ENABLED) {
          throw new Error("Плащането с карта не е налично");
        }
        // Redirect to Stripe checkout
        const response = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            cart: cart,
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
        // Cash on delivery - redirect to success page
        router.push(`/checkout/success?orderId=${order.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Грешка при създаване на поръчката");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-paper-heading mb-8">
          Финализиране на поръчката
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-paper-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6 text-paper-heading">
                Данни за доставка
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="customer_name"
                    className="block text-sm font-medium text-paper-heading mb-1"
                  >
                    Име и фамилия *
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-paper-border rounded-lg focus:ring-2 focus:ring-paper-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer_email"
                    className="block text-sm font-medium text-paper-heading mb-1"
                  >
                    Имейл *
                  </label>
                  <input
                    type="email"
                    id="customer_email"
                    required
                    value={formData.customer_email}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-paper-border rounded-lg focus:ring-2 focus:ring-paper-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer_phone"
                    className="block text-sm font-medium text-paper-heading mb-1"
                  >
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-paper-border rounded-lg focus:ring-2 focus:ring-paper-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer_address"
                    className="block text-sm font-medium text-paper-heading mb-1"
                  >
                    Адрес за доставка *
                  </label>
                  <textarea
                    id="customer_address"
                    required
                    rows={3}
                    value={formData.customer_address}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_address: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-paper-border rounded-lg focus:ring-2 focus:ring-paper-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-paper-heading mb-1"
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
                    className="w-full px-4 py-2 border border-paper-border rounded-lg focus:ring-2 focus:ring-paper-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-paper-heading mb-3">
                    Начин на плащане *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-4 border border-paper-border rounded-lg cursor-pointer hover:bg-paper-bg">
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash_on_delivery"
                        checked={formData.payment_method === "cash_on_delivery"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payment_method: e.target.value as "cash_on_delivery" | "card",
                          })
                        }
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-paper-heading">
                          Наложен платеж
                        </div>
                        <div className="text-sm text-paper-muted">
                          Плащане при получаване на поръчката
                        </div>
                      </div>
                    </label>

                    {CARD_PAYMENTS_ENABLED ? (
                    <label className="flex items-center p-4 border border-paper-border rounded-lg cursor-pointer hover:bg-paper-bg">
                      <input
                        type="radio"
                        name="payment_method"
                        value="card"
                        checked={formData.payment_method === "card"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payment_method: e.target.value as "cash_on_delivery" | "card",
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
                  <label className="flex items-start space-x-3 cursor-pointer">
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
                      className="mt-1 h-4 w-4 text-paper-green focus:ring-paper-green border-paper-border rounded"
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
                      и се съгласявам обработката на моите лични данни за целите на поръчката. *
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.privacy_policy_accepted}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-paper-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-paper-heading">
                Резюме на поръчката
              </h2>

              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start border-b border-paper-border pb-3"
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

              <div className="space-y-2 pt-4 border-t border-paper-border">
                <div className="flex justify-between text-sm">
                  <span className="text-paper-text">Междинна сума</span>
                  <Price
                    amount={cart.subtotal.toString()}
                    currencyCode={cart.currency}
                    className="font-medium"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-paper-text">Доставка</span>
                  <span className="text-paper-text">
                    Ще се изчисли при плащане
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span className="text-paper-heading">Общо</span>
                  <Price
                    amount={cart.total.toString()}
                    currencyCode={cart.currency}
                    className="text-paper-green"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-paper-border">
                  <p className="text-xs text-center text-paper-muted">
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
