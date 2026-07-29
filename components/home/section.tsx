import clsx from "clsx";

import { ReactNode } from "react";



type SectionProps = {

  id?: string;

  title?: string;

  subtitle?: string;

  children: ReactNode;

  className?: string;

  variant?: "default" | "muted" | "accent" | "green";

  animate?: boolean;

};



export function Section({

  id,

  title,

  subtitle,

  children,

  className,

  variant = "default",

  animate = true,

}: SectionProps) {

  return (

    <section

      id={id}

      className={clsx(

        "py-16 md:py-20 lg:py-24",

        {

          "bg-paper-bg": variant === "default",

          "bg-paper-section": variant === "muted",

          "bg-paper-accent-bg": variant === "accent" || variant === "green",

        },

        className,

      )}

    >

      <div

        className={clsx(

          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",

          animate && "animate-fade-in",

        )}

      >

        {(title || subtitle) && (

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

        )}

        {children}

      </div>

    </section>

  );

}

