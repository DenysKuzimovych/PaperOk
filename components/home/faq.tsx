"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";
import { Section } from "./section";

const faqs = [
  {
    question: "Какво е семенна хартия?",
    answer:
      "Семенната хартия е рециклирана хартия с вградени семена на цветя или билки. След като използвате продукта, можете да засадите хартията в почва и да гледате как поникват растения.",
  },
  {
    question: "Как се засажда семенната хартия?",
    answer:
      "Намокрете хартията с вода, поставете я в саксия или в градината, покрийте с тънък слой почва (около 1 см) и поливайте редовно. Поставете на светло място, но не на силно пряка слънчева светлина.",
  },
  {
    question: "Колко време отнема поникването?",
    answer:
      "Обикновено семената поникват за 1–3 седмици, в зависимост от вида семена, температурата и влажността. Поддържайте почвата постоянно леко влажна.",
  },
  {
    question: "Какви семена са вградени в хартията?",
    answer:
      "Използваме различни видове — диви цветя, билки и други. Конкретният състав може да се променя според сезона и наличностите и е посочен в страницата на продукта.",
  },
  {
    question: "Мога ли да поръчам персонализирани продукти?",
    answer:
      "Да. Предлагаме персонализация за картички, покани, визитки и корпоративни материали. Използвайте формата на страницата За бизнеса или ни пишете на имейл.",
  },
  {
    question: "Каква е доставката и плащането?",
    answer:
      "Доставяме в цяла България чрез куриер. Плащане с карта онлайн или наложен платеж. Срокът за изработка е обикновено 3–7 работни дни.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section title="Често задавани въпроси" variant="muted" id="faq">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-paper-border/70 bg-paper-white">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className={clsx(
                index > 0 && "border-t border-paper-border/70",
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-paper-section/40"
              >
                <span className="font-heading text-base font-semibold text-paper-heading sm:text-lg">
                  {faq.question}
                </span>
                <ChevronDownIcon
                  className={clsx(
                    "h-5 w-5 shrink-0 text-paper-green transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className={clsx(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed text-paper-muted">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
