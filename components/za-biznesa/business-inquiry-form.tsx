"use client";

import { PaperTexture } from "components/ui/paper-texture";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import { useState } from "react";

const productTypes = [
  "Рекламни картички",
  "Благодарствени картички",
  "Визитки",
  "Покани",
  "Етикети",
  "Hang tags",
  "Бележници",
  "Календари",
  "Комплекти",
  "Друго",
];

const inputClass =
  "w-full rounded-xl border border-paper-border/80 bg-paper-bg/90 px-4 py-2.5 text-sm text-paper-heading shadow-[var(--paper-shadow)] transition-colors focus:border-paper-green focus:outline-none focus:ring-2 focus:ring-paper-green/25";

const selectClass = "paper-select";

export function BusinessInquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    productType: "",
    quantity: "",
    message: "",
    privacy_policy_accepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.privacy_policy_accepted) {
      setError("Моля, приемете Политиката за поверителност");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/business-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          productType: formData.productType,
          quantity: formData.quantity,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Грешка при изпращане на запитването");
      }

      setSuccess(true);
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        productType: "",
        quantity: "",
        message: "",
        privacy_policy_accepted: false,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Грешка при изпращане на запитването",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-paper-border p-6 shadow-sm md:p-8">
      <PaperTexture
        src={PAPER_BACKGROUNDS.petalsSoft}
        overlay={PAPER_OVERLAYS.white}
        sizes="(min-width: 768px) 42rem, 100vw"
        quality={80}
      />
      <div className="relative z-10">
      <h2 className="font-heading mb-6 text-2xl font-bold text-paper-heading">
        Форма за запитване
      </h2>

      {success && (
        <div className="mb-4 rounded-lg border border-paper-green bg-paper-accent-bg p-4 text-paper-heading">
          Запитването ви е изпратено успешно! Ще се свържем с вас скоро.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="biz-name"
              className="mb-1 block text-sm font-medium text-paper-heading"
            >
              Име *
            </label>
            <input
              type="text"
              id="biz-name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="biz-company"
              className="mb-1 block text-sm font-medium text-paper-heading"
            >
              Фирма
            </label>
            <input
              type="text"
              id="biz-company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="biz-email"
              className="mb-1 block text-sm font-medium text-paper-heading"
            >
              Имейл *
            </label>
            <input
              type="email"
              id="biz-email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="biz-phone"
              className="mb-1 block text-sm font-medium text-paper-heading"
            >
              Телефон *
            </label>
            <input
              type="tel"
              id="biz-phone"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="biz-product"
              className="mb-1 block text-sm font-medium text-paper-heading"
            >
              Вид продукт *
            </label>
            <select
              id="biz-product"
              required
              value={formData.productType}
              onChange={(e) =>
                setFormData({ ...formData, productType: e.target.value })
              }
              className={selectClass}
            >
              <option value="">Изберете вид продукт</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="biz-quantity"
              className="mb-1 block text-sm font-medium text-paper-heading"
            >
              Количество
            </label>
            <input
              type="text"
              id="biz-quantity"
              placeholder="напр. 100, 500, 1000"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="biz-message"
            className="mb-1 block text-sm font-medium text-paper-heading"
          >
            Съобщение *
          </label>
          <textarea
            id="biz-message"
            required
            rows={5}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
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
            <span className="text-sm text-paper-text">
              Съгласен съм с{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper-green underline"
              >
                Политиката за поверителност
              </a>
              . *
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.privacy_policy_accepted}
          className="btn-primary w-full rounded-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Изпращане..." : "Изпрати запитване"}
        </button>
      </form>
      </div>
    </div>
  );
}
