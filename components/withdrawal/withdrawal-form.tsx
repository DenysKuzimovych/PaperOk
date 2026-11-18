"use client";

import { useState, type FormEvent } from "react";
import { FormField, formControlClass } from "components/forms/field";
import { isValidEmail } from "lib/validation";
import { CONTACT_EMAIL } from "lib/constants";

type Step = "form" | "confirm" | "done";

type Fields = {
  name: string;
  email: string;
  orderNumber: string;
  itemsMode: "all" | "partial";
  items: string;
  reason: string;
  website: string; // honeypot
};

type Result = {
  reference: string;
  submittedAt: string;
  items: string;
  orderNumber: string;
  emailSent: boolean;
};

const EMPTY: Fields = {
  name: "",
  email: "",
  orderNumber: "",
  itemsMode: "all",
  items: "",
  reason: "",
  website: "",
};

export function WithdrawalForm() {
  const [step, setStep] = useState<Step>("form");
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) next.name = "Моля, въведете име и фамилия.";
    if (!isValidEmail(fields.email))
      next.email = "Моля, въведете валиден имейл адрес.";
    if (!fields.orderNumber.trim())
      next.orderNumber = "Моля, въведете номера на поръчката.";
    if (fields.itemsMode === "partial" && !fields.items.trim())
      next.items = "Моля, посочете за кои артикули се отказвате.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goToConfirm(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    if (validate()) {
      setStep("confirm");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function confirm() {
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setServerError(
          json.error ||
            `Възникна грешка. Моля, опитайте отново или ни пишете на ${CONTACT_EMAIL}.`,
        );
        return;
      }
      setResult(json as Result);
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError(
        `Няма връзка. Моля, опитайте отново или ни пишете на ${CONTACT_EMAIL}.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const itemsLabel =
    fields.itemsMode === "all"
      ? "Всички артикули от поръчката"
      : fields.items.trim();

  if (step === "done" && result) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-paper-green bg-paper-accent-bg p-6 sm:p-8"
      >
        <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
          Заявлението Ви е получено
        </h2>
        <p className="mb-4 leading-relaxed text-paper-text">
          Получихме Вашия отказ от договора на{" "}
          <strong>{result.submittedAt}</strong> (българско време).
        </p>
        <dl className="mb-4 grid gap-2 text-sm text-paper-text sm:grid-cols-[auto_1fr] sm:gap-x-4">
          <dt className="font-medium text-paper-heading">Номер на заявлението</dt>
          <dd>{result.reference}</dd>
          <dt className="font-medium text-paper-heading">Номер на поръчката</dt>
          <dd>{result.orderNumber}</dd>
          <dt className="font-medium text-paper-heading">Артикули</dt>
          <dd className="whitespace-pre-line">{result.items}</dd>
          <dt className="font-medium text-paper-heading">Имейл</dt>
          <dd>{fields.email}</dd>
        </dl>
        <p className="leading-relaxed text-paper-text">
          {result.emailSent
            ? "Изпратихме потвърждение с тези данни на Вашия имейл."
            : "Ще изпратим потвърждение с тези данни на Вашия имейл до края на работния ден."}{" "}
          Ще се свържем с Вас с указания за връщането на артикулите.
        </p>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8">
        <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
          Проверете данните и потвърдете
        </h2>
        <p className="mb-4 leading-relaxed text-paper-text">
          С натискането на бутона по-долу заявявам, че се отказвам от договора
          за следните артикули:
        </p>
        <dl className="mb-6 grid gap-2 text-sm text-paper-text sm:grid-cols-[auto_1fr] sm:gap-x-4">
          <dt className="font-medium text-paper-heading">Име</dt>
          <dd>{fields.name.trim()}</dd>
          <dt className="font-medium text-paper-heading">Имейл за потвърждение</dt>
          <dd>{fields.email.trim()}</dd>
          <dt className="font-medium text-paper-heading">Номер на поръчката</dt>
          <dd>{fields.orderNumber.trim()}</dd>
          <dt className="font-medium text-paper-heading">Артикули</dt>
          <dd className="whitespace-pre-line">{itemsLabel}</dd>
          {fields.reason.trim() ? (
            <>
              <dt className="font-medium text-paper-heading">Причина</dt>
              <dd className="whitespace-pre-line">{fields.reason.trim()}</dd>
            </>
          ) : null}
        </dl>

        {serverError ? (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900"
          >
            {serverError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={confirm}
            disabled={submitting}
            className="btn-primary rounded-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Изпращане…" : "Потвърждавам отказа"}
          </button>
          <button
            type="button"
            onClick={() => setStep("form")}
            disabled={submitting}
            className="btn-outline rounded-full"
          >
            Редактирай данните
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={goToConfirm}
      noValidate
      className="relative space-y-4 rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8"
    >
      <h2 className="font-heading mb-2 text-2xl font-semibold text-paper-heading">
        Заявление за отказ от договора
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="w-name" label="Име и фамилия" required error={errors.name}>
          <input
            id="w-name"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            className={formControlClass(!!errors.name, "rounded-xl")}
          />
        </FormField>
        <FormField
          id="w-email"
          label="Имейл (за потвърждението)"
          required
          error={errors.email}
        >
          <input
            id="w-email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            className={formControlClass(!!errors.email, "rounded-xl")}
          />
        </FormField>
      </div>

      <FormField
        id="w-order"
        label="Номер на поръчката"
        required
        error={errors.orderNumber}
      >
        <input
          id="w-order"
          type="text"
          maxLength={60}
          placeholder="напр. 1c0058d0 (от имейла с потвърждението)"
          value={fields.orderNumber}
          onChange={(e) => update("orderNumber", e.target.value)}
          aria-invalid={!!errors.orderNumber}
          className={formControlClass(!!errors.orderNumber, "rounded-xl")}
        />
      </FormField>

      <fieldset>
        <legend className="mb-1 block text-sm font-medium text-paper-heading">
          За кои артикули се отказвате? *
        </legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex items-center gap-2 text-paper-text">
            <input
              type="radio"
              name="itemsMode"
              checked={fields.itemsMode === "all"}
              onChange={() => update("itemsMode", "all")}
              className="h-4 w-4 text-paper-green focus:ring-paper-green"
            />
            Всички артикули
          </label>
          <label className="flex items-center gap-2 text-paper-text">
            <input
              type="radio"
              name="itemsMode"
              checked={fields.itemsMode === "partial"}
              onChange={() => update("itemsMode", "partial")}
              className="h-4 w-4 text-paper-green focus:ring-paper-green"
            />
            Само някои артикули
          </label>
        </div>
      </fieldset>

      {fields.itemsMode === "partial" ? (
        <FormField
          id="w-items"
          label="Посочете артикулите и количеството"
          required
          error={errors.items}
        >
          <textarea
            id="w-items"
            rows={3}
            maxLength={1000}
            value={fields.items}
            onChange={(e) => update("items", e.target.value)}
            aria-invalid={!!errors.items}
            className={formControlClass(!!errors.items, "rounded-xl")}
          />
        </FormField>
      ) : null}

      <FormField id="w-reason" label="Причина (по желание)">
        <textarea
          id="w-reason"
          rows={3}
          maxLength={1000}
          value={fields.reason}
          onChange={(e) => update("reason", e.target.value)}
          className={formControlClass(false, "rounded-xl")}
        />
      </FormField>
      <p className="-mt-2 text-xs text-paper-muted">
        Не е нужно да посочвате причина за отказа.
      </p>

      {/* Honeypot: hidden from people, bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-0 w-0 overflow-hidden">
        <label htmlFor="w-website">Уебсайт</label>
        <input
          id="w-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={fields.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary w-full rounded-full">
        Продължи към потвърждение
      </button>
    </form>
  );
}
