import clsx from "clsx";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

const baseControl =
  "w-full rounded-lg border bg-paper-white px-4 py-2 text-paper-heading transition-colors focus:outline-none focus:ring-2";

const okControl =
  "border-paper-border focus:border-paper-green focus:ring-paper-green/30";

const errorControl =
  "border-red-500 bg-red-50/50 text-paper-heading focus:border-red-500 focus:ring-red-400/40";

export function formControlClass(
  hasError?: boolean,
  className?: string,
): string {
  return clsx(baseControl, hasError ? errorControl : okControl, className);
}

export function formSelectClass(hasError?: boolean, className?: string): string {
  return clsx(
    "paper-select",
    hasError &&
      "!border-red-500 !bg-red-50/50 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(248,113,113,0.35)]",
    className,
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 rounded-md border border-amber-300/80 bg-amber-50 px-2.5 py-1.5 text-sm text-amber-950"
    >
      <ExclamationTriangleIcon
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
        aria-hidden
      />
      <span>{message}</span>
    </p>
  );
}

export function FormField({
  id,
  label,
  required,
  error,
  children,
  className,
}: {
  id?: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-paper-heading"
      >
        {label}
        {required ? " *" : null}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
