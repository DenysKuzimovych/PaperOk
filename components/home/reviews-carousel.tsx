"use client";

import clsx from "clsx";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { Review } from "lib/supabase/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5 text-paper-green"
      aria-label={`${rating} от 5 звезди`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <svg
          key={value}
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill={value <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path
            strokeLinejoin="round"
            d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L12 3.5z"
          />
        </svg>
      ))}
    </div>
  );
}

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

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  // With 3 or fewer reviews there is nothing to scroll — show a static grid.
  const isCarousel = reviews.length > 3;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: isCarousel,
      align: "start",
      skipSnaps: false,
      dragFree: false,
    },
    isCarousel
      ? [
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]
      : [],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const resetAutoplay = useCallback(() => {
    emblaApi?.plugins()?.autoplay?.reset();
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

  if (reviews.length === 0) return null;

  const Card = ({ review }: { review: Review }) => (
    <figure className="flex h-full flex-col rounded-[1.25rem] border border-paper-border/60 bg-paper-white p-5 shadow-[var(--paper-shadow)]">
      <Stars rating={review.rating} />
      <blockquote className="mt-3 line-clamp-[8] flex-1 text-paper-text">
        {review.body}
      </blockquote>
      <figcaption className="mt-4 text-sm font-semibold text-paper-heading">
        {review.author_name}
      </figcaption>
    </figure>
  );

  // Static grid for a handful of reviews.
  if (!isCarousel) {
    return (
      <ul className="mx-auto mb-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <li key={review.id} className="h-full">
            <Card review={review} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mx-auto mb-12 max-w-6xl">
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex min-w-0 shrink-0 grow-0 basis-full px-2 sm:basis-1/2 lg:basis-1/3"
              >
                <Card review={review} />
              </div>
            ))}
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
    </div>
  );
}
