"use client";

import type { ProductSizeVariant } from "lib/types";

const PRESET_SIZES = ["A7", "A6", "A5", "A4", "A3", "90×50 мм", "50×70 мм"];

function newVariantId() {
  return crypto.randomUUID();
}

interface ProductVariantsEditorProps {
  variants: ProductSizeVariant[];
  basePrice: string;
  onChange: (variants: ProductSizeVariant[]) => void;
}

export function ProductVariantsEditor({
  variants,
  basePrice,
  onChange,
}: ProductVariantsEditorProps) {
  const enabledVariants = variants.filter((v) => v.enabled);

  const togglePreset = (name: string) => {
    const existing = variants.find((v) => v.name === name);
    if (existing) {
      onChange(
        variants.map((v) =>
          v.name === name ? { ...v, enabled: !v.enabled } : v,
        ),
      );
    } else {
      onChange([
        ...variants,
        {
          id: newVariantId(),
          name,
          price: parseFloat(basePrice) || 0,
          description: "",
          enabled: true,
        },
      ]);
    }
  };

  const updateVariant = (
    id: string,
    field: keyof ProductSizeVariant,
    value: string | boolean | number,
  ) => {
    onChange(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const addCustomVariant = () => {
    onChange([
      ...variants,
      {
        id: newVariantId(),
        name: "",
        price: parseFloat(basePrice) || 0,
        description: "",
        enabled: true,
      },
    ]);
  };

  const removeVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Размери (варианти)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Активирай размери с тикчета. Всеки размер има собствена цена и кратко
          описание. Ако няма активни размери, се използва основната цена.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_SIZES.map((size) => {
            const variant = variants.find((v) => v.name === size);
            const isEnabled = variant?.enabled ?? false;
            return (
              <button
                key={size}
                type="button"
                onClick={() => togglePreset(size)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  isEnabled
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {enabledVariants.length > 0 && (
        <div className="space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Активни размери
          </h4>
          {enabledVariants.map((variant) => (
            <div
              key={variant.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
            >
              <div>
                <label className="text-xs text-gray-500">Име</label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) =>
                    updateVariant(variant.id, "name", e.target.value)
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="A5"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Цена (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(
                      variant.id,
                      "price",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500">Кратко описание</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={variant.description || ""}
                    onChange={(e) =>
                      updateVariant(variant.id, "description", e.target.value)
                    }
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="148×210 мм"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id)}
                    className="px-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addCustomVariant}
        className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
      >
        + Добави персонализиран размер
      </button>
    </div>
  );
}
