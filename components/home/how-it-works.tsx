import { Section } from "./section";

const steps = [
  {
    number: "01",
    title: "Използваш продукта",
    description:
      "Подари картичката, бележника или хартията — красиви и с еко послание.",
  },
  {
    number: "02",
    title: "Засаждаш хартията",
    description:
      "След употреба засади хартията в саксия или в градината — където има почва и светлина.",
  },
  {
    number: "03",
    title: "Поливаш",
    description:
      "Навлажни леко и поливай редовно. Дръж на светло място, без силно пряко слънце.",
  },
  {
    number: "04",
    title: "Поникват цветя или билки",
    description:
      "След 1–3 седмици семената поникват — подаръкът продължава да живее.",
  },
];

export function HowItWorks() {
  return (
    <Section
      title="Как работи"
      subtitle="Четири кратки стъпки — от подаръка до живите растения"
    >
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.number}
            className="relative rounded-2xl border border-paper-border/70 bg-paper-white p-6"
            style={{ boxShadow: "var(--paper-shadow)" }}
          >
            {index < steps.length - 1 && (
              <span
                className="absolute -right-3 top-10 z-10 hidden h-px w-6 bg-paper-border lg:block"
                aria-hidden
              />
            )}
            <span className="font-heading text-sm font-semibold tracking-[0.18em] text-paper-green">
              {step.number}
            </span>
            <h3 className="mt-4 font-heading text-xl font-semibold text-paper-heading">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper-muted">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
