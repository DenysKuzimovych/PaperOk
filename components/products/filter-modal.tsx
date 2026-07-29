"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Collection } from "lib/types";

interface FilterModalProps {
  collections: Collection[];
  isOpen: boolean;
  onClose: () => void;
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

export function FilterModal({
  collections,
  isOpen,
  onClose,
  onApply,
  currentFilters,
}: FilterModalProps) {
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice?.toString() || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.categories);
  const [onSaleOnly, setOnSaleOnly] = useState(currentFilters.onSaleOnly);

  useEffect(() => {
    setMinPrice(currentFilters.minPrice?.toString() || "");
    setMaxPrice(currentFilters.maxPrice?.toString() || "");
    setSelectedCategories(currentFilters.categories);
    setOnSaleOnly(currentFilters.onSaleOnly);
  }, [currentFilters, isOpen]);

  if (!isOpen) return null;

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
    onClose();
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-paper-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-paper-heading">Филтри</h2>
            <button
              onClick={onClose}
              className="text-paper-muted hover:text-paper-text"
              aria-label="Затвори"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-paper-heading mb-4">
              Ценови диапазон (EUR)
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-paper-heading mb-1">
                  От
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-paper-border bg-paper-white px-3 py-2 text-sm text-paper-heading shadow-sm focus:border-paper-green focus:outline-none focus:ring-1 focus:ring-paper-green"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-paper-heading mb-1">
                  До
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="1000.00"
                  className="w-full rounded-md border border-paper-border bg-paper-white px-3 py-2 text-sm text-paper-heading shadow-sm focus:border-paper-green focus:outline-none focus:ring-1 focus:ring-paper-green"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-paper-heading mb-4">
              Категории
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {collections.map((collection) => (
                <label
                  key={collection.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-paper-bg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(collection.handle)}
                    onChange={() => handleCategoryToggle(collection.handle)}
                    className="h-4 w-4 text-paper-green rounded border-paper-border focus:ring-paper-green"
                  />
                  <span className="text-sm text-paper-heading">
                    {collection.title}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* On Sale Only */}
          <div className="mb-6">
            <label className="flex items-center gap-2 p-2 rounded-md hover:bg-paper-bg cursor-pointer">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="h-4 w-4 text-paper-green rounded border-paper-border focus:ring-paper-green"
              />
              <span className="text-sm font-medium text-paper-heading">
                Само продукти на намаление
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-paper-border">
            <button
              onClick={handleApply}
              className="btn-primary-sm flex-1"
            >
              Приложи
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 text-sm font-medium text-paper-heading bg-paper-section rounded-md hover:bg-paper-section transition-colors"
            >
              Изчисти
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-paper-heading bg-paper-section rounded-md hover:bg-paper-section transition-colors"
            >
              Отказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
