import Image from "next/image";

const EXAMPLES = [
  {
    src: "/ai-design/primer-nov-dom.jpg",
    alt: "Постер „Честит нов дом!“ с акварелна къща",
    title: "Нов дом",
    format: "Постер · А3",
  },
  {
    src: "/ai-design/primer-bebe.jpg",
    alt: "Постер за бебе с розово мече, име, дата, тегло и ръст",
    title: "Посрещане на бебе",
    format: "Постер · А3",
  },
  {
    src: "/ai-design/primer-tate.jpg",
    alt: "Картичка „Обичам те, тате!“ в детски стил с пастели",
    title: "За татко",
    format: "Картичка · А6",
  },
  {
    src: "/ai-design/primer-rozhden-den.jpg",
    alt: "Картичка „Честит рожден ден, Нилчо!“ с балони и торта",
    title: "Рожден ден",
    format: "Картичка · А6",
  },
] as const;

/**
 * Four example designs. Laptop/desktop: one row of 4. Tablet: 2 x 2.
 * Phone: one row that scrolls sideways, so the page doesn't get 4 tall images.
 */
export function AiDesignExamples() {
  return (
    <section
      id="primeri"
      aria-labelledby="ai-design-examples-title"
      className="mt-4 scroll-mt-24"
    >
      <p className="text-xs font-semibold tracking-[0.06em] text-paper-green-hover uppercase">
        Вдъхнови се
      </p>
      <h2
        id="ai-design-examples-title"
        className="mt-1 font-heading text-2xl font-semibold text-paper-heading sm:text-[1.75rem]"
      >
        Какво можеш да създадеш
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper-muted sm:text-base">
        Примерни дизайни, създадени с AI в PaperOK. Твоят ще бъде направен по
        твоята идея, текст и стил.
      </p>

      <ul className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {EXAMPLES.map((ex) => (
          <li
            key={ex.src}
            className="w-[70%] shrink-0 snap-start sm:w-auto"
          >
            <figure className="flex flex-col gap-2.5">
              <div className="rounded-2xl border border-paper-border bg-white p-2.5 shadow-[var(--paper-shadow)]">
                <Image
                  src={ex.src}
                  alt={ex.alt}
                  width={376}
                  height={566}
                  sizes="(max-width: 640px) 70vw, (max-width: 1024px) 45vw, 260px"
                  className="block h-auto w-full rounded-lg"
                />
              </div>
              <figcaption className="flex justify-between gap-2 text-sm">
                <span className="font-semibold text-paper-heading">
                  {ex.title}
                </span>
                <span className="text-paper-muted">{ex.format}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
