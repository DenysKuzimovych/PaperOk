import { Section } from "./section";

const benefits = [
  {
    title: "Рециклираме. Създаваме. Засаждаме.",
    description:
      "От рециклирана хартия до продукт със семена — и после живот в почвата.",
  },
  {
    title: "Подарък, който продължава да живее",
    description:
      "След посланието идва засаждането — цветя или билки вместо отпадък.",
  },
  {
    title: "Целият процес е в наши ръце",
    description:
      "Хартия, печат и довършване в една работилница — контрол върху качеството.",
  },
  {
    title: "Ръчно изработено в София",
    description:
      "Местно производство, кратки срокове и внимание към всеки детайл.",
  },
];

export function WhyPaperOK() {
  return (
    <Section title="Защо PaperOK?" variant="accent">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b, i) => (
          <div
            key={b.title}
            className="rounded-2xl border border-paper-border/50 bg-paper-white/80 p-6 backdrop-blur-sm"
          >
            <span className="font-heading text-3xl font-semibold text-paper-green/25">
              0{i + 1}
            </span>
            <h3 className="mt-3 font-heading text-lg font-semibold leading-snug text-paper-heading">
              {b.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-paper-muted">
              {b.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
