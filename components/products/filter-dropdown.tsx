"use client";

import { useState, useEffect, useRef } from "react";
import { FunnelIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { Collection } from "lib/types";

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
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice?.toString() || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.categories);
  const [onSaleOnly, setOnSaleOnly] = useState(currentFilters.onSaleOnly);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMinPrice(currentFilters.minPrice?.toString() || "");
    setMaxPrice(currentFilters.maxPrice?.toString() || "");
    setSelectedCategories(currentFilters.categories);
    setOnSaleOnly(currentFilters.onSaleOnly);
  }, [currentFilters]);

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

  const hasActiveFilters =
    currentFilters.minPrice !== undefined ||
    currentFilters.maxPrice !== undefined ||
    currentFilters.categories.length > 0 ||
    currentFilters.onSaleOnly;

  const handleCategoryToggle = (categoryHandle: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryHandle)
        ? prev.filter((c) => c !== categoryHandle)
        : [...prev, categoryHandle]
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`paper-dropdown-trigger min-w-[140px] ${
          hasActiveFilters
            ? "border-paper-green bg-paper-green text-white hover:bg-paper-green-hover hover:border-paper-green"
            : ""
        } ${isOpen && !hasActiveFilters ? "is-open" : ""}`}
      >
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5" />
          <span>Филтри</span>
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
              {[
                currentFilters.minPrice !== undefined || currentFilters.maxPrice !== undefined,
                currentFilters.categories.length > 0,
                currentFilters.onSaleOnly,
              ].filter(Boolean).length}
            </span>
          )}
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="paper-dropdown-panel absolute top-full right-0 left-0 z-50 mt-2 max-h-[80vh] w-[calc(100vw-2rem)] overflow-y-auto sm:right-0 sm:left-auto sm:w-80">
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-paper-heading">Филтри</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-paper-muted transition-colors hover:bg-paper-accent-bg hover:text-paper-green"
                aria-label="Затвори"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-paper-heading mb-3">
                Ценови диапазон (EUR)
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-paper-heading mb-1">
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
                  <label className="block text-xs font-medium text-paper-heading mb-1">
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

            {/* Categories */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-paper-heading mb-3">
                Категории
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {collections.map((collection) => (
                  <label
                    key={collection.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-paper-bg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(collection.handle)}
                      onChange={() => handleCategoryToggle(collection.handle)}
                      className="h-4 w-4 text-paper-text rounded border-paper-border focus:ring-paper-green"
                    />
                    <span className="text-sm text-paper-heading">
                      {collection.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* On Sale Only */}
            <div className="mb-4">
              <label className="flex items-center gap-2 p-2 rounded-md hover:bg-paper-bg cursor-pointer">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => setOnSaleOnly(e.target.checked)}
                  className="h-4 w-4 text-paper-text rounded border-paper-border focus:ring-paper-green"
                />
                <span className="text-sm font-medium text-paper-heading">
                  Само продукти на намаление
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-paper-border">
              <button
                onClick={handleApply}
                className="btn-primary-sm flex-1"
              >
                Приложи
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-paper-heading bg-paper-section rounded-md hover:bg-paper-section transition-colors"
              >
                Изчисти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
