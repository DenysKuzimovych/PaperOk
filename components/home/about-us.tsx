import Image from "next/image";
import { Reveal } from "components/ui/reveal";
import { Section } from "./section";

export function AboutUs() {
  return (
    <Section id="za-nas" title="За нас">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal variant="left">
          <p className="font-heading text-2xl leading-snug text-paper-heading sm:text-3xl">
            Работилница в София за ръчна семенна хартия и продукти, които
            разцъфтяват.
          </p>
          <p className="mt-5 text-base leading-relaxed text-paper-muted">
            PaperOK създава картички, подаръци и семенна хартия с вградени
            семена. Вярваме, че подаръкът може да носи послание — и после да
            стане растение.
          </p>
          <p className="mt-4 text-base leading-relaxed text-paper-muted">
            Работим с рециклирана хартия и натурални семена. Целият процес — от
            материала до печат и довършване — е в наши ръце.
          </p>
        </Reveal>
        <Reveal variant="right" delay={120}>
          <div
            className="group relative overflow-hidden rounded-[2rem] border border-paper-border/70 lg:aspect-[16/10]"
            style={{ boxShadow: "var(--paper-shadow-lg)" }}
          >
            <div className="pointer-events-none absolute inset-0 z-10 hidden bg-gradient-to-br from-paper-accent-bg/40 via-transparent to-[#E8DFD0]/25 lg:block" />
            <Image
              src="/IMG_9801.PNG"
              alt="Работилницата на PaperOK в София"
              width={1600}
              height={1200}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="img-zoom h-auto w-full object-contain lg:absolute lg:inset-0 lg:h-full lg:w-full lg:object-cover"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
