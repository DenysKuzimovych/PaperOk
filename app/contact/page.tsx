"use client";

import Footer from "components/layout/footer";
import {
  BUSINESS_BIO,
  BUSINESS_TAGLINE,
  CONTACT_EMAIL_DEFAULT,
  CONTACT_LOCATION,
  FACEBOOK_URL,
  INSTAGRAM_URL,
} from "lib/constants";
import { useState } from "react";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
  process.env.CONTACT_EMAIL ||
  CONTACT_EMAIL_DEFAULT;
const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || FACEBOOK_URL;
const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || INSTAGRAM_URL;
const contactLocation =
  process.env.NEXT_PUBLIC_CONTACT_LOCATION || CONTACT_LOCATION;

const inputClass =
  "w-full rounded-lg border border-paper-border bg-paper-white px-4 py-2 text-paper-heading focus:border-paper-green focus:outline-none focus:ring-1 focus:ring-paper-green";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    privacy_policy_accepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.privacy_policy_accepted) {
      setError("Моля, приемете Политиката за поверителност");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Грешка при изпращане на съобщението");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        privacy_policy_accepted: false,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Грешка при изпращане на съобщението",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-paper-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading mb-4 text-center text-4xl font-bold text-paper-heading">
            Свържете се с нас
          </h1>
          <p className="mx-auto mb-2 max-w-xl text-center text-paper-heading">
            {BUSINESS_TAGLINE}
          </p>
          <p className="mb-10 text-center text-paper-text">
            {BUSINESS_BIO} Пишете ни или поръчайте в Instagram DM.
          </p>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-semibold text-paper-heading">
                Контактна информация
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-paper-accent-bg">
                    <EnvelopeIcon className="h-6 w-6 text-paper-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-paper-muted">
                      Имейл
                    </h3>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-base text-paper-heading hover:text-paper-green"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>

                {contactPhone ? (
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-paper-accent-bg">
                    <PhoneIcon className="h-6 w-6 text-paper-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-paper-muted">
                      Телефон
                    </h3>
                    <a
                      href={`tel:${contactPhone.replace(/\s/g, "")}`}
                      className="text-base text-paper-heading hover:text-paper-green"
                    >
                      {contactPhone}
                    </a>
                  </div>
                </div>
                ) : null}

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-paper-accent-bg">
                    <MapPinIcon className="h-6 w-6 text-paper-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-paper-muted">
                      Адрес
                    </h3>
                    <p className="text-base text-paper-heading">
                      {contactLocation}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-section text-paper-heading transition-colors hover:bg-paper-green hover:text-white"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-section text-paper-heading transition-colors hover:bg-paper-green hover:text-white"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Google Maps */}
              <div className="mt-8 overflow-hidden rounded-xl border border-paper-border">
                <iframe
                  title="Карта на София"
                  src="https://maps.google.com/maps?q=Sofia,Bulgaria&output=embed"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-2xl border border-paper-border bg-paper-white p-6 shadow-sm">
              <h2 className="font-heading mb-6 text-2xl font-semibold text-paper-heading">
                Изпратете съобщение
              </h2>

              {success && (
                <div className="mb-4 rounded-lg border border-paper-green bg-paper-accent-bg p-4 text-paper-heading">
                  Съобщението ви е изпратено успешно! Ще се свържем с вас скоро.
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg border border-red-400 bg-red-50 p-4 text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-paper-heading"
                  >
                    Име *
                  </label>
                  <input
                    type="text"
                    id="name"
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
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-paper-heading"
                  >
                    Имейл *
                  </label>
                  <input
                    type="email"
                    id="email"
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
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium text-paper-heading"
                  >
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-1 block text-sm font-medium text-paper-heading"
                  >
                    Съобщение *
                  </label>
                  <textarea
                    id="message"
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
                      </a>{" "}
                      и се съгласявам обработката на моите лични данни. *
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.privacy_policy_accepted}
                  className="btn-primary w-full rounded-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Изпращане..." : "Изпрати съобщение"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
