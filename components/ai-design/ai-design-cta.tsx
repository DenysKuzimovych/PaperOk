export function AiDesignCta() {
  return (
    <section
      aria-labelledby="ai-design-cta-title"
      className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#403B32] p-6 sm:p-8"
    >
      <div className="min-w-0 flex-[1_1_320px]">
        <h2
          id="ai-design-cta-title"
          className="font-heading text-2xl font-semibold text-[#F8F5EC] sm:text-[1.75rem]"
        >
          Имаш идея? Превърни я в картичка.
        </h2>
        <p className="mt-1.5 text-sm text-[#DCD6C8] sm:text-base">
          Картички от 4 €, постери А3 от 17 €. Доставка със Speedy.
        </p>
      </div>
      <a
        href="#studio"
        className="inline-flex min-h-12 items-center rounded-full bg-[#E8C86A] px-7 text-base font-bold text-[#2F2A22] hover:bg-[#F0D481]"
      >
        Започни дизайна
      </a>
    </section>
  );
}
