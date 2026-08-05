"use client";

import clsx from "clsx";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Reveal } from "components/ui/reveal";
import { Section } from "./section";

const REVIEW_IMAGES = [
  "/reviews/1.png",
  "/reviews/2.png",
  "/reviews/3.png",
  "/reviews/4.png",
  "/reviews/5.png",
  "/reviews/6.png",
  "/reviews/7.png",
] as const;

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
    },
    [
      Autoplay({
        delay: 4200,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const resetAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;
    autoplay.reset();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    resetAutoplay();
  }, [emblaApi, resetAutoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    resetAutoplay();
  }, [emblaApi, resetAutoplay]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      resetAutoplay();
    },
    [emblaApi, resetAutoplay],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <Section
      title="Отзиви за нас"
      subtitle="Реални думи от клиенти и партньори — плъзнете или изчакайте следващия"
      texture="petalsSoft"
    >
      <Reveal variant="up">
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y items-center">
              {REVIEW_IMAGES.map((src, index) => {
                const isActive = index === selectedIndex;
                return (
                  <div
                    key={src}
                    className="flex min-w-0 shrink-0 grow-0 basis-[86%] justify-center px-2 sm:basis-[58%] sm:px-3 md:basis-[42%] lg:basis-[34%]"
                  >
                    <button
                      type="button"
                      onClick={() => scrollTo(index)}
                      className={clsx(
                        "group relative mx-auto flex max-h-[min(72vh,560px)] w-auto max-w-full items-center justify-center overflow-hidden rounded-[1.5rem] border border-paper-border/60 bg-paper-white transition-all duration-500 ease-out focus-visible:outline-none",
                        isActive
                          ? "scale-100 shadow-[var(--paper-shadow-lg)]"
                          : "scale-[0.92] shadow-[var(--paper-shadow)] hover:scale-[0.95]",
                      )}
                      aria-label={`Отзив ${index + 1} от ${REVIEW_IMAGES.length}`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <Image
                        src={src}
                        alt={`Отзив за PaperOK ${index + 1}`}
                        width={1200}
                        height={1600}
                        sizes="(min-width: 1024px) 34vw, (min-width: 640px) 58vw, 86vw"
                        className="h-auto max-h-[min(72vh,560px)] w-auto max-w-full object-contain"
                        priority={index < 2}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={scrollPrev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-paper-border/80 bg-paper-white/90 text-paper-heading shadow-sm transition hover:border-paper-green hover:text-paper-green"
              aria-label="Предишен отзив"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Отзиви">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === selectedIndex}
                  aria-label={`Към отзив ${index + 1}`}
                  onClick={() => scrollTo(index)}
                  className={clsx(
                    "h-2 rounded-full transition-all duration-300",
                    index === selectedIndex
                      ? "w-7 bg-paper-green"
                      : "w-2 bg-paper-border hover:bg-paper-muted",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={scrollNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-paper-border/80 bg-paper-white/90 text-paper-heading shadow-sm transition hover:border-paper-green hover:text-paper-green"
              aria-label="Следващ отзив"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
