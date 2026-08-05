"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { GridTileImage } from "components/grid/tile";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export function Gallery({
  images,
}: {
  images: { src: string; altText: string }[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToImage = useCallback(
    (index: number) => {
      if (index === currentIndex || isTransitioning) return;

      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 200);
    },
    [currentIndex, isTransitioning],
  );

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    goToImage(nextIndex);
  }, [currentIndex, images.length, goToImage]);

  const goToPrevious = useCallback(() => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToImage(prevIndex);
  }, [currentIndex, images.length, goToImage]);

  useEffect(() => {
    if (images.length > 1 && typeof window !== "undefined") {
      const nextIndex = (currentIndex + 1) % images.length;
      const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;

      const nextImage = images[nextIndex];
      const prevImage = images[prevIndex];

      if (nextImage) {
        const preloadNext = new window.Image();
        preloadNext.src = nextImage.src;
      }

      if (prevImage) {
        const preloadPrev = new window.Image();
        preloadPrev.src = prevImage.src;
      }
    }
  }, [currentIndex, images]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goToNext, goToPrevious]);

  const buttonClassName =
    "h-full px-6 transition-all ease-in-out hover:scale-110 hover:text-paper-heading flex items-center justify-center";

  if (!images.length) return null;

  const current = images[currentIndex]!;

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-lg bg-paper-bg">
        <div className="relative flex min-h-[220px] w-full items-center justify-center sm:min-h-[280px]">
          <Image
            key={current.src}
            className="h-auto max-h-[min(80vh,720px)] w-full object-contain transition-opacity duration-200"
            width={1200}
            height={1200}
            sizes="(min-width: 1024px) 66vw, 100vw"
            alt={current.altText}
            src={current.src}
            priority
            unoptimized={
              current.src.startsWith("/placeholder") ||
              current.src.endsWith(".svg")
            }
          />
        </div>

        {images.length > 1 ? (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex w-full justify-center">
            <div className="mx-auto flex h-11 items-center rounded-full border border-white bg-paper-section/80 text-paper-muted backdrop-blur-sm">
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Предишна снимка на продукт"
                className={buttonClassName}
                disabled={isTransitioning}
              >
                <ArrowLeftIcon className="h-5" />
              </button>
              <div className="mx-1 h-6 w-px bg-paper-muted" />
              <button
                type="button"
                onClick={goToNext}
                aria-label="Следваща снимка на продукт"
                className={buttonClassName}
                disabled={isTransitioning}
              >
                <ArrowRightIcon className="h-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="my-12 flex flex-wrap items-center justify-center gap-2 overflow-auto py-1 lg:mb-0">
          {images.map((image, index) => {
            const isActive = index === currentIndex;

            return (
              <li key={image.src} className="h-20 w-20">
                <button
                  type="button"
                  onClick={() => goToImage(index)}
                  aria-label="Избери снимка на продукт"
                  className={`h-full w-full transition-opacity ${
                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                  disabled={isTransitioning}
                >
                  <GridTileImage
                    alt={image.altText}
                    src={image.src}
                    width={80}
                    height={80}
                    active={isActive}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
