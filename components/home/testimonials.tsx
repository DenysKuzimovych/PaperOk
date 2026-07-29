import { Section } from "./section";

const testimonials = [
  {
    name: "Мария Иванова",
    role: "Клиент",
    text: "Картичката за рожден ден на майка ми беше невероятна. Засадихме я и след месец имаме цветя в саксията.",
    initial: "М",
  },
  {
    name: "Георги Петров",
    role: "Корпоративен клиент",
    text: "Поръчахме 200 благодарствени картички. Качеството е отлично, а клиентите ни бяха възхитени.",
    initial: "Г",
  },
  {
    name: "Елена Димитрова",
    role: "Клиент",
    text: "Уникален подарък. Хартията е мека и красива — и наистина пониква. Препоръчвам.",
    initial: "Е",
  },
];

export function Testimonials() {
  return (
    <Section title="Отзиви" subtitle="Думи от хора, които вече подариха PaperOK">
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <blockquote
            key={t.name}
            className="flex flex-col rounded-[1.35rem] border border-paper-border/70 bg-paper-white p-7"
            style={{ boxShadow: "var(--paper-shadow)" }}
          >
            <p className="flex-1 font-heading text-lg leading-relaxed text-paper-heading">
              „{t.text}“
            </p>
            <footer className="mt-7 flex items-center gap-3 border-t border-paper-border/60 pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-accent-bg font-medium text-paper-green">
                {t.initial}
              </div>
              <cite className="not-italic">
                <span className="block text-sm font-medium text-paper-heading">
                  {t.name}
                </span>
                <span className="text-xs text-paper-muted">{t.role}</span>
              </cite>
            </footer>
          </blockquote>
        ))}
      </div>
    </Section>
  );
}
