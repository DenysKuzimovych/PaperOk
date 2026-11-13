"use client";

import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinejoin="round"
        d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L12 3.5z"
      />
    </svg>
  );
}

export function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);

  const shown = hover || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (rating < 1) {
      toast.error("Моля, изберете оценка от 1 до 5 звезди.");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Моля, въведете име.");
      return;
    }
    if (body.trim().length < 10) {
      toast.error("Отзивът трябва да е поне 10 знака.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: name,
          rating,
          body,
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Грешка при изпращане. Опитайте отново.");
        return;
      }

      toast.success(
        data?.message ||
          "Благодарим Ви за отзива! Той ще се появи след преглед.",
      );
      setRating(0);
      setHover(0);
      setName("");
      setBody("");
    } catch {
      toast.error("Грешка при изпращане. Моля, опитайте отново.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl rounded-[1.5rem] border border-paper-border/60 bg-paper-white p-6 shadow-[var(--paper-shadow)] sm:p-8"
    >
      <h3 className="font-heading text-xl font-semibold text-paper-heading">
        Оставете своя отзив
      </h3>
      <p className="mt-1 text-sm text-paper-muted">
        Споделете мнението си — ще се появи на сайта след преглед.
      </p>

      {/* Stars */}
      <div className="mt-5">
        <div className="flex items-center gap-1 text-paper-green">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              className={clsx(
                "rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper-green",
                value <= shown ? "text-paper-green" : "text-paper-border",
              )}
              aria-label={`${value} от 5 звезди`}
              aria-pressed={rating === value}
            >
              <Star filled={value <= shown} />
            </button>
          ))}
        </div>
      </div>

      {/* Honeypot (hidden from users) */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label>
          Уебсайт
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-5">
        <label
          htmlFor="review-name"
          className="block text-sm font-medium text-paper-heading"
        >
          Име
        </label>
        <input
          id="review-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
          className="mt-1 w-full rounded-lg border border-paper-border bg-paper-white px-3 py-2 text-paper-text focus:border-paper-green focus:outline-none focus:ring-1 focus:ring-paper-green"
          placeholder="Вашето име"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="review-body"
          className="block text-sm font-medium text-paper-heading"
        >
          Отзив
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          rows={4}
          required
          className="mt-1 w-full rounded-lg border border-paper-border bg-paper-white px-3 py-2 text-paper-text focus:border-paper-green focus:outline-none focus:ring-1 focus:ring-paper-green"
          placeholder="Как Ви хареса продуктът или обслужването?"
        />
        <div className="mt-1 text-right text-xs text-paper-muted">
          {body.length}/1000
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-paper-green px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Изпращане…" : "Изпрати отзив"}
      </button>
    </form>
  );
}
