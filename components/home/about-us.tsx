import { Section } from "./section";

export function AboutUs() {
  return (
    <Section id="za-nas" title="За нас">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
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
        </div>
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-paper-border/70"
          style={{ boxShadow: "var(--paper-shadow-lg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-paper-accent-bg via-paper-section to-[#E8DFD0]" />
          <div className="relative flex h-full flex-col items-start justify-end p-8">
            <p className="font-heading text-2xl text-paper-heading">
              Нашата работилница
            </p>
            <p className="mt-1 text-sm text-paper-muted">София, България</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
