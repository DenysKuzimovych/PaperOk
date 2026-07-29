import Link from "next/link";
import { SITE_HEADLINE, SITE_TAGLINE } from "lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(221,232,204,0.55),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(239,231,219,0.7),_transparent_50%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-28">
        <div className="animate-fade-in-up lg:col-span-6 lg:pr-4">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-paper-green">
            PaperOK · София
          </p>
          <h1 className="font-heading text-[2.6rem] font-semibold leading-[1.08] text-paper-heading sm:text-5xl lg:text-[3.4rem]">
            {SITE_HEADLINE}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-paper-muted sm:text-lg">
            {SITE_TAGLINE}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="btn-primary px-8 py-3.5">
              Разгледай продуктите
            </Link>
            <Link href="/za-biznesa" className="btn-outline px-8 py-3.5">
              За бизнеса
            </Link>
          </div>
        </div>

        <div className="animate-fade-in-right relative lg:col-span-6">
          <div
            className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] border border-paper-border/70"
            style={{ boxShadow: "var(--paper-shadow-lg)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8F0D8] via-paper-section to-[#E5D9C8]" />
            <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_30%,rgba(94,127,58,0.18),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(74,52,40,0.1),transparent_40%)]" />
            <div className="relative flex h-full flex-col justify-end p-7 sm:p-9">
              <div className="max-w-sm rounded-2xl border border-white/50 bg-paper-white/75 p-5 backdrop-blur-sm">
                <p className="font-heading text-xl text-paper-heading sm:text-2xl">
                  Картички, хартия и поникнали цветя
                </p>
                <p className="mt-2 text-sm leading-relaxed text-paper-muted">
                  Тук стои главната визуализация — продукти, листенца и живот
                  след засаждането.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
