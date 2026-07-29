"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Form from "next/form";
import { useSearchParams } from "next/navigation";

type SearchProps = {
  compact?: boolean;
  onClose?: () => void;
};

export default function Search({ compact, onClose }: SearchProps) {
  const searchParams = useSearchParams();

  if (compact) {
    return (
      <Form action="/search" className="relative w-full max-w-xs">
        <input
          key={searchParams?.get("q")}
          type="text"
          name="q"
          placeholder="Търсене..."
          autoComplete="off"
          autoFocus={!!onClose}
          defaultValue={searchParams?.get("q") || ""}
          className="w-full rounded-full border border-paper-border bg-paper-white py-2 pl-4 pr-10 text-sm text-paper-heading placeholder:text-paper-muted focus:border-paper-green focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Търси"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-paper-muted hover:text-paper-green"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Затвори търсене"
            className="absolute -right-8 top-1/2 -translate-y-1/2 text-paper-muted hover:text-paper-heading md:hidden"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </Form>
    );
  }

  return (
    <Form
      action="/search"
      className="relative w-full max-w-[550px] lg:w-80 xl:w-full"
    >
      <input
        key={searchParams?.get("q")}
        type="text"
        name="q"
        placeholder="Търсене на продукти..."
        autoComplete="off"
        defaultValue={searchParams?.get("q") || ""}
        className="w-full rounded-lg border border-paper-border bg-paper-white px-4 py-2 text-sm text-paper-heading placeholder:text-paper-muted focus:border-paper-green focus:outline-none"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <MagnifyingGlassIcon className="h-4 w-4 text-paper-muted" />
      </div>
    </Form>
  );
}

export function SearchSkeleton({ compact }: { compact?: boolean }) {
  return (
    <form className={`relative ${compact ? "w-full max-w-xs" : "w-full max-w-[550px] lg:w-80 xl:w-full"}`}>
      <input
        placeholder={compact ? "Търсене..." : "Търсене на продукти..."}
        disabled
        className={`w-full border border-paper-border bg-paper-white text-sm text-paper-heading placeholder:text-paper-muted ${
          compact ? "rounded-full py-2 pl-4 pr-10" : "rounded-lg px-4 py-2"
        }`}
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <MagnifyingGlassIcon className="h-4 w-4 text-paper-muted" />
      </div>
    </form>
  );
}
