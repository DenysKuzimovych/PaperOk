import { PaperTexture } from "components/ui/paper-texture";
import { Reveal } from "components/ui/reveal";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
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

const BENEFIT_CARD_BG = PAPER_BACKGROUNDS.petalsSoft;

export function WhyPaperOK() {
  return (
    <Section title="Защо PaperOK?" variant="accent" texture="fibers">
      <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b, i) => (
          <Reveal key={b.title} delay={i * 90} variant="up" className="h-full">
            <article
              className="hover-lift group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[1.35rem] border border-paper-border/60 p-6 sm:p-7"
              style={{ boxShadow: "var(--paper-shadow)" }}
            >
              <PaperTexture
                src={BENEFIT_CARD_BG}
                overlay={PAPER_OVERLAYS.card}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                quality={88}
              />
              <div className="relative z-10 flex h-full flex-col">
                <span className="font-heading text-3xl font-semibold text-paper-green/30 transition-colors group-hover:text-paper-green/45">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold leading-snug text-paper-heading">
                  {b.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-paper-muted">
                  {b.description}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
