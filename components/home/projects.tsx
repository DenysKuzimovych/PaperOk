import { Section } from "./section";

const projects = [
  {
    title: "Корпоративни картички за IT компания",
    description:
      "Персонализирани благодарствени картички от семенна хартия за годишнина на компанията.",
    tone: "from-[#DDE8CC] to-[#EFE7DB]",
  },
  {
    title: "Сватбени покани с диви цветя",
    description:
      "Елегантни покани от семенна хартия с вградени семена на диви цветя.",
    tone: "from-[#EFE7DB] to-[#F3EDE3]",
  },
  {
    title: "Еко етикети за козметична марка",
    description:
      "Брандирани hang tags и етикети от рециклирана семенна хартия.",
    tone: "from-[#E8F0D8] to-[#DDE8CC]",
  },
  {
    title: "Коледни подаръчни комплекти",
    description:
      "Комплекти от картички и семенна хартия за корпоративни коледни подаръци.",
    tone: "from-[#F3EDE3] to-[#E8F0D8]",
  },
];

export function Projects() {
  return (
    <Section
      title="Наши проекти"
      subtitle="Реализирани идеи — без тиражи и технически детайли"
      variant="muted"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((project, index) => (
          <article
            key={project.title}
            className="overflow-hidden rounded-[1.4rem] border border-paper-border/70 bg-paper-white"
            style={{ boxShadow: "var(--paper-shadow)" }}
          >
            <div
              className={`relative aspect-[16/10] bg-gradient-to-br ${project.tone}`}
            >
              <span className="absolute bottom-4 left-5 font-heading text-5xl font-semibold text-paper-heading/10">
                0{index + 1}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-heading text-xl font-semibold text-paper-heading">
                {project.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-muted">
                {project.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
