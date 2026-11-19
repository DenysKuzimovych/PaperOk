import Link from "next/link";

const STEPS = [
  {
    title: "Създаваш дизайна",
    text: "Описваш идеята си, избираш стил и формат. За всеки дизайн получаваш няколко варианта и избираш този, който ти харесва.",
  },
  {
    title: "Поръчваш",
    text: "Добавяш дизайна в количката и попълваш адрес за доставка. Можеш да платиш с наложен платеж при получаване.",
  },
  {
    title: "Получаваш потвърждение",
    text: "След поръчката ти изпращаме имейл с потвърждение и данните на поръчката. Ако имаш въпрос, просто отговори на него.",
  },
  {
    title: "Отпечатваме в София",
    text: "Отпечатваме дизайна в нашата работилница в София върху ръчно изработена хартия. При картичките можеш да избереш гръб с инструкция за засаждане.",
  },
  {
    title: "Изпращаме със Speedy",
    text: "Пратката идва до адрес или до офис на Speedy, който избереш в поръчката.",
  },
] as const;

export function AiDesignAfterOrder() {
  return (
    <section
      aria-labelledby="ai-design-after-order-title"
      className="mt-12 rounded-2xl border border-paper-border bg-white/70 p-5 shadow-[var(--paper-shadow)] sm:p-8"
    >
      <h2
        id="ai-design-after-order-title"
        className="font-heading text-2xl font-semibold text-paper-heading sm:text-[1.75rem]"
      >
        Какво следва след поръчката
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper-muted sm:text-base">
        От идеята до готовата картичка или постер в ръцете ти – ето как
        протича всичко.
      </p>

      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-paper-border bg-paper-bg/60 p-4"
          >
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#5F7A48] text-sm font-semibold text-white"
            >
              {index + 1}
            </span>
            <p className="mt-3 text-sm font-semibold text-paper-heading">
              {step.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-paper-text">
              {step.text}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-6 rounded-xl bg-paper-accent-bg/50 p-4 text-sm leading-relaxed text-paper-text">
        Всяка картичка и постер се изработват специално по твоя дизайн, затова
        персонализираните изделия не подлежат на връщане. Преди да поръчаш,
        прегледай внимателно текста и правописа. Повече информация ще намериш
        в{" "}
        <Link
          href="/blog/vrashtane-i-reklamacii"
          className="font-medium text-paper-heading underline underline-offset-2"
        >
          Връщане и рекламации
        </Link>
        .
      </p>
    </section>
  );
}
