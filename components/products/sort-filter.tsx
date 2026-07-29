"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarsArrowUpIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-paper-border bg-paper-white text-sm font-medium text-paper-heading shadow-sm hover:bg-paper-bg transition-all duration-200 min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <BarsArrowUpIcon className="h-5 w-5 text-paper-muted" />
          <span>{currentLabel}</span>
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 text-paper-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-auto min-w-full bg-paper-white border border-paper-border rounded-lg shadow-lg z-50 overflow-hidden">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-paper-bg transition-colors ${
                currentSort === option.value
                  ? "bg-paper-bg text-paper-heading"
                  : "text-paper-heading"
              }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
              {currentSort === option.value && (
                <CheckIcon className="h-5 w-5 text-paper-text" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
