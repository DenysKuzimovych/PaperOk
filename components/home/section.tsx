import clsx from "clsx";
import { PaperTexture } from "components/ui/paper-texture";
import { Reveal } from "components/ui/reveal";
import {
  PAPER_BACKGROUNDS,
  PAPER_OVERLAYS,
  type PaperBackgroundKey,
} from "lib/backgrounds";
import { ReactNode } from "react";

type SectionProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "muted" | "accent" | "green";
  animate?: boolean;
  /** Optional seed-paper texture under the section color */
  texture?: PaperBackgroundKey | false;
};

const VARIANT_OVERLAY: Record<
  NonNullable<SectionProps["variant"]>,
  string
> = {
  default: PAPER_OVERLAYS.cream,
  muted: PAPER_OVERLAYS.section,
  accent: PAPER_OVERLAYS.accent,
  green: PAPER_OVERLAYS.accent,
};

const VARIANT_TEXTURE: Record<
  NonNullable<SectionProps["variant"]>,
  PaperBackgroundKey
> = {
  default: "plain",
  muted: "seeds",
  accent: "fibers",
  green: "petalsSoft",
};

export function Section({
  id,
  title,
  subtitle,
  children,
  className,
  variant = "default",
  animate = true,
  texture,
}: SectionProps) {
  const textureKey =
    texture === false
      ? null
      : texture ?? VARIANT_TEXTURE[variant];

  return (
    <section
      id={id}
      className={clsx(
        "relative overflow-hidden py-16 md:py-20 lg:py-24",
        {
          "bg-paper-bg": variant === "default",
          "bg-paper-section": variant === "muted",
          "bg-paper-accent-bg": variant === "accent" || variant === "green",
        },
        className,
      )}
    >
      {textureKey && (
        <PaperTexture
          src={PAPER_BACKGROUNDS[textureKey]}
          overlay={VARIANT_OVERLAY[variant]}
          sizes="100vw"
          quality={85}
        />
      )}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || subtitle) &&
          (animate ? (
            <Reveal className="mb-10 text-center md:mb-14">
              {title && (
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-paper-heading md:text-4xl lg:text-[2.75rem]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mx-auto mt-3 max-w-2xl text-base text-paper-muted md:text-lg">
                  {subtitle}
                </p>
              )}
            </Reveal>
          ) : (
            <div className="mb-10 text-center md:mb-14">
              {title && (
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-paper-heading md:text-4xl lg:text-[2.75rem]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mx-auto mt-3 max-w-2xl text-base text-paper-muted md:text-lg">
                  {subtitle}
                </p>
              )}
            </div>
          ))}
        {children}
      </div>
    </section>
  );
}
