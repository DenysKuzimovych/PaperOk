"use client";

import clsx from "clsx";
import Image from "next/image";
import { Reveal } from "components/ui/reveal";
import { Section } from "./section";

const COMPANY_LOGOS = [
  { src: "/logos/new_logo_yr.png", alt: "YR" },
  { src: "/logos/Dupissima-Aesthetics-logo-79.png", alt: "Dupissima Aesthetics" },
  { src: "/logos/ec1ec712-cd0b-45ce-8ff2-72d184149cf3.png", alt: "Партньор" },
  { src: "/logos/1.svg", alt: "Партньор" },
  { src: "/logos/radioplay_long.svg", alt: "Radio Play" },
  { src: "/logos/gianni website logo.png", alt: "Gianni" },
  { src: "/logos/3.png", alt: "Партньор" },
  { src: "/logos/3.jpeg", alt: "Партньор" },
  { src: "/logos/op-logo-300x300.png", alt: "Our Place" },
] as const;

function LogoTrack({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 px-5 sm:gap-14 sm:px-7"
      aria-hidden={ariaHidden || undefined}
    >
      {COMPANY_LOGOS.map((logo, index) => (
        <li
          key={`${logo.src}-${index}`}
          className="flex h-16 w-[9.5rem] shrink-0 items-center justify-center sm:h-20 sm:w-44"
        >
          <Image
            src={logo.src}
            alt={ariaHidden ? "" : logo.alt}
            width={220}
            height={100}
            className="max-h-14 w-auto max-w-full object-contain opacity-80 transition-opacity duration-300 hover:opacity-100 sm:max-h-16"
          />
        </li>
      ))}
    </ul>
  );
}

type TrustedCompaniesProps = {
  className?: string;
  /** Slightly tighter section for embedding mid-page */
  compact?: boolean;
};

export function TrustedCompanies({ className, compact }: TrustedCompaniesProps) {
  return (
    <Section
      title="Компаниите които ни се довериха"
      texture="plain"
      className={clsx(compact && "!py-12 md:!py-14", className)}
    >
      <Reveal variant="up">
        <div className="relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8">
          <div className="logo-marquee flex w-max items-center">
            <LogoTrack />
            <LogoTrack ariaHidden />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
