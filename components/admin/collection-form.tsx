"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCollectionAction,
  updateCollectionAction,
} from "app/admin/collections/actions";
import { toast } from "sonner";
import {
  buildCategoryTree,
  flattenCategoryTree,
  type FlatCategory,
} from "lib/category-tree";
import { FieldHint } from "./field-hint";

interface CollectionFormData {
  handle: string;
  title: string;
  description: string;
  position: string;
  parent_id: string;
}

interface CollectionFormProps {
  collection?: any;
  allCollections?: FlatCategory[];
}

export function CollectionForm({
  collection,
  allCollections = [],
}: CollectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [handleError, setHandleError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CollectionFormData>({
    handle: collection?.handle || "",
    title: collection?.title || "",
    description: collection?.description || "",
    position: collection?.position?.toString() || "0",
    parent_id: collection?.parent_id || "",
  });

  const tree = buildCategoryTree(
    allCollections.filter((c) => c.id !== collection?.id),
  );
  const flatOptions = flattenCategoryTree(tree);

  const formatHandle = (value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const generateHandleFromTitle = (title: string): string =>
    formatHandle(title);

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, handle: formatHandle(e.target.value) });
    if (handleError) setHandleError(null);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (
      !formData.handle ||
      formData.handle === formatHandle(collection?.title || "")
    ) {
      setFormData({
        ...formData,
        title: newTitle,
        handle: generateHandleFromTitle(newTitle),
      });
    } else {
      setFormData({ ...formData, title: newTitle });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalHandle = (
        formData.handle.trim() || generateHandleFromTitle(formData.title)
      ).trim();

      const collectionData = {
        handle: finalHandle,
        title: formData.title,
        description: formData.description.trim() || undefined,
        position: parseInt(formData.position) || 0,
        parent_id: formData.parent_id || null,
      };

      let result;
      if (collection) {
        result = await updateCollectionAction({
          ...collectionData,
          id: collection.id,
        });
      } else {
        result = await createCollectionAction(collectionData);
      }

      if (result.success) {
        toast.success(
          collection
            ? "Категорията е обновена успешно"
            : "Категорията е създадена успешно",
        );
        router.push("/admin/collections");
        router.refresh();
      } else {
        const errorMessage = result.error || "Грешка при запазване";
        if (errorMessage.includes("Slug") && errorMessage.includes("зает")) {
          setHandleError(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Грешка при запазване");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slug (URL)
          </label>
          <input
            type="text"
            value={formData.handle}
            onChange={handleHandleChange}
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
              handleError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
            placeholder="kartichki-za-povod"
          />
          {handleError ? (
            <p className="mt-1 text-xs text-red-600">{handleError}</p>
          ) : (
            <FieldHint example="za-mama → /products?collection=za-mama">
              Адресът на категорията в URL. Само латински букви, цифри и тирета.
              Ако е празно, се генерира автоматично от името.
            </FieldHint>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Име *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={handleTitleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Родителска категория
          </label>
          <select
            value={formData.parent_id}
            onChange={(e) =>
              setFormData({ ...formData, parent_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">— Коренова категория —</option>
            {flatOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {"—".repeat(opt.depth)} {opt.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Позиция
          </label>
          <input
            type="number"
            min="0"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Картички от семенна хартия за любимите хора — мама, татко, баба и дядо."
        />
        <FieldHint example="Картички от семенна хартия за мама. Ръчна изработка в София.">
          Кратко описание на категорията. Помага на клиентите и за SEO —
          опиши за кого са продуктите и каква е ползата.
        </FieldHint>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Запазване..." : collection ? "Обнови" : "Създай"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
        >
          Отказ
        </button>
      </div>
    </form>
  );
}
