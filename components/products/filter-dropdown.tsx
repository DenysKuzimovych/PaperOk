"use client";

import { useState, useEffect, useRef } from "react";
import {
  FunnelIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Collection } from "lib/types";
import { AnchoredPortal } from "components/ui/anchored-portal";

interface FilterDropdownProps {
  collections: Collection[];
  onApply: (filters: {
    minPrice?: number;
    maxPrice?: number;
    categories: string[];
    onSaleOnly: boolean;
  }) => void;
  currentFilters: {
    minPrice?: number;
    maxPrice?: number;
    categories: string[];
    onSaleOnly: boolean;
  };
}

export function FilterDropdown({
  collections,
  onApply,
  currentFilters,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(
    currentFilters.minPrice?.toString() || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    currentFilters.maxPrice?.toString() || "",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentFilters.categories,
  );
  const [onSaleOnly, setOnSaleOnly] = useState(currentFilters.onSaleOnly);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMinPrice(currentFilters.minPrice?.toString() || "");
    setMaxPrice(currentFilters.maxPrice?.toString() || "");
    setSelectedCategories(currentFilters.categories);
    setOnSaleOnly(currentFilters.onSaleOnly);
  }, [currentFilters]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const hasActiveFilters =
    currentFilters.minPrice !== undefined ||
    currentFilters.maxPrice !== undefined ||
    currentFilters.categories.length > 0 ||
    currentFilters.onSaleOnly;

  const handleCategoryToggle = (categoryHandle: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryHandle)
        ? prev.filter((c) => c !== categoryHandle)
        : [...prev, categoryHandle],
    );
  };

  const handleApply = () => {
    onApply({
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      categories: selectedCategories,
      onSaleOnly,
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategories([]);
    setOnSaleOnly(false);
    onApply({
      minPrice: undefined,
      maxPrice: undefined,
      categories: [],
      onSaleOnly: false,
    });
  };

  const activeCount = [
    currentFilters.minPrice !== undefined ||
      currentFilters.maxPrice !== undefined,
    currentFilters.categories.length > 0,
    currentFilters.onSaleOnly,
  ].filter(Boolean).length;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={
          hasActiveFilters
            ? `Филтри (${activeCount} активни)`
            : "Филтри"
        }
        title="Филтри"
        className={`paper-dropdown-trigger paper-dropdown-trigger-compact relative ${
          hasActiveFilters
            ? "border-paper-green bg-paper-green text-white hover:bg-paper-green-hover hover:border-paper-green"
            : ""
        } ${isOpen && !hasActiveFilters ? "is-open" : ""}`}
      >
        <div className="flex items-center gap-2">
          <span className="relative inline-flex">
            <FunnelIcon
              className={`h-5 w-5 ${hasActiveFilters ? "text-white" : "text-paper-muted"}`}
            />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-0.5 text-[10px] font-bold text-paper-green sm:hidden">
                {activeCount}
              </span>
            )}
          </span>
          <span className="hidden sm:inline">Филтри</span>
          {hasActiveFilters && (
            <span className="ml-1 hidden rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold sm:inline">
              {activeCount}
            </span>
          )}
        </div>
        <ChevronDownIcon
          className={`hidden h-4 w-4 transition-transform duration-200 sm:block ${
            hasActiveFilters ? "text-white" : "text-paper-muted"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnchoredPortal
        open={isOpen}
        anchorRef={triggerRef}
        panelRef={panelRef}
        align="right"
        minWidth={288}
        maxWidth={340}
        className="paper-dropdown-panel"
      >
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold text-paper-heading">
              Филтри
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-paper-muted transition-colors hover:bg-paper-accent-bg hover:text-paper-green"
              aria-label="Затвори"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <h4 className="mb-3 text-sm font-semibold text-paper-heading">
              Ценови диапазон (EUR)
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-paper-heading">
                  От
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-paper-border bg-paper-white px-3 py-2 text-sm text-paper-heading shadow-sm focus:border-paper-border focus:outline-none focus:ring-1 focus:ring-paper-green"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-paper-heading">
                  До
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="1000.00"
                  className="w-full rounded-md border border-paper-border bg-paper-white px-3 py-2 text-sm text-paper-heading shadow-sm focus:border-paper-border focus:outline-none focus:ring-1 focus:ring-paper-green"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="mb-3 text-sm font-semibold text-paper-heading">
              Категории
            </h4>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {collections.map((collection) => (
                <label
                  key={collection.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-paper-bg"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(collection.handle)}
                    onChange={() => handleCategoryToggle(collection.handle)}
                    className="h-4 w-4 rounded border-paper-border text-paper-text focus:ring-paper-green"
                  />
                  <span className="text-sm text-paper-heading">
                    {collection.title}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-paper-bg">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="h-4 w-4 rounded border-paper-border text-paper-text focus:ring-paper-green"
              />
              <span className="text-sm font-medium text-paper-heading">
                Само продукти на намаление
              </span>
            </label>
          </div>

          <div className="flex gap-2 border-t border-paper-border pt-3">
            <button onClick={handleApply} className="btn-primary-sm flex-1">
              Приложи
            </button>
            <button
              onClick={handleReset}
              className="rounded-md bg-paper-section px-4 py-2 text-sm font-medium text-paper-heading transition-colors hover:bg-paper-section"
            >
              Изчисти
            </button>
          </div>
        </div>
      </AnchoredPortal>
    </div>
  );
}
