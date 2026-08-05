"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";
import { Section } from "./section";

const faqs = [
  {
    question: "Какво е семенна хартия?",
    answer:
      "Семенната хартия е ръчно изработена рециклирана хартия с вградени семена. След като изпълни предназначението си, тя може да бъде засадена в почва и от нея ще поникнат растения.",
  },
  {
    question: "Как се засажда семенната хартия?",
    answer:
      "Поставете хартията върху влажна почва, покрийте я с тънък слой пръст (около 2–3 мм), полейте внимателно и я поставете на светло място. Поддържайте почвата постоянно влажна до покълването.",
  },
  {
    question: "Колко време отнема поникването?",
    answer:
      "Покълването зависи от вида на семената, температурата, количеството светлина, редовното поливане и сезона. Обикновено първите кълнове се появяват в рамките на 7–21 дни. За най-добри резултати препоръчваме засаждане през пролетта или лятото.",
  },
  {
    question: "Какви семена са вложени в хартията?",
    answer:
      "Видът на семената може да бъде различен в зависимост от продукта. Актуалната информация за използваните семена е посочена в описанието на всеки конкретен продукт.",
  },
  {
    question: "Мога ли да поръчам персонализирани продукти?",
    answer:
      "Да. Предлагаме персонализирани продукти за фирми и индивидуални клиенти – картички, визитки, етикети, сертификати, пликове, корпоративни подаръци и други изделия.",
  },
  {
    question: "Каква е доставката и плащането?",
    answer:
      "Доставките се извършват чрез Speedy до адрес или офис. При завършване на поръчката клиентът ще може да избере удобен начин на доставка и плащане.",
  },
  {
    question: "Безопасна ли е семенната хартия за природата?",
    answer:
      "Да. Семенната хартия е изработена от рециклирани материали и е напълно биоразградима. След засаждане хартията се разгражда естествено в почвата.",
  },
  {
    question: "Къде мога да засадя семенната хартия?",
    answer:
      "Може да бъде засадена в саксия, в градина, на балкон или в двор, стига мястото да има достатъчно светлина и редовно поливане.",
  },
  {
    question: "Подходящи ли са продуктите за корпоративни подаръци?",
    answer:
      "Да. Семенната хартия е оригинален и екологичен подарък, подходящ за фирмени събития, рекламни кампании, конференции и специални поводи.",
  },
  {
    question: "Къде се произвеждат продуктите?",
    answer:
      "Всички продукти на PaperOK EcoArt Studio се изработват ръчно в България от рециклирана хартия със семена. Всеки продукт преминава през целия процес на производство в нашето ателие.",
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
