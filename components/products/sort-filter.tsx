"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarsArrowUpIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

type SortOption = "price-asc" | "price-desc" | "discount-desc" | "name-asc" | "newest";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "price-asc", label: "Цена: Възходяща" },
  { value: "price-desc", label: "Цена: Низходяща" },
  { value: "discount-desc", label: "Най-голямо намаление" },
  { value: "name-asc", label: "Азбучен ред" },
  { value: "newest", label: "Най-нови" },
];

export function SortFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get("sort") as SortOption) || "newest";
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel = sortOptions.find((opt) => opt.value === currentSort)?.label || "Най-нови";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={clsx("paper-dropdown-trigger w-full min-w-[200px] sm:w-auto", isOpen && "is-open")}
      >
        <div className="flex items-center gap-2">
          <BarsArrowUpIcon className="h-5 w-5 text-paper-green/80" />
          <span>{currentLabel}</span>
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 text-paper-green/70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="paper-dropdown-panel absolute top-full left-0 z-50 mt-2 w-full min-w-full overflow-hidden sm:w-auto">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSortChange(option.value)}
              className={clsx(
                "paper-dropdown-item",
                currentSort === option.value && "is-active",
              )}
            >
              <span>{option.label}</span>
              {currentSort === option.value && (
                <CheckIcon className="h-4 w-4 text-paper-green" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
