"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCollectionAction,
  updateCollectionAction,
} from "app/admin/collections/actions";
import { toast } from "sonner";
import {
  buildCategoryTree,
  flattenCategoryTree,
  getRootOfCategory,
  type FlatCategory,
} from "lib/category-tree";
import { MAIN_MENU_SECTIONS } from "lib/constants";
import { FieldHint } from "./field-hint";

interface CollectionFormData {
  handle: string;
  title: string;
  description: string;
  position: string;
  main_menu_id: string;
  nested_parent_id: string;
}

interface CollectionFormProps {
  collection?: any;
  allCollections?: FlatCategory[];
}

function resolveInitialPlacement(
  collection: any | undefined,
  allCollections: FlatCategory[],
): Pick<CollectionFormData, "main_menu_id" | "nested_parent_id"> {
  if (!collection?.parent_id) {
    return { main_menu_id: "", nested_parent_id: "" };
  }

  const root = getRootOfCategory(allCollections, collection.id);
  if (!root) {
    return { main_menu_id: "", nested_parent_id: "" };
  }

  const parentIsRoot = collection.parent_id === root.id;
  return {
    main_menu_id: root.id,
    nested_parent_id: parentIsRoot ? "" : collection.parent_id,
  };
}

export function CollectionForm({
  collection,
  allCollections = [],
}: CollectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [handleError, setHandleError] = useState<string | null>(null);
  const initialPlacement = resolveInitialPlacement(collection, allCollections);
  const [formData, setFormData] = useState<CollectionFormData>({
    handle: collection?.handle || "",
    title: collection?.title || "",
    description: collection?.description || "",
    position: collection?.position?.toString() || "0",
    main_menu_id: initialPlacement.main_menu_id,
    nested_parent_id: initialPlacement.nested_parent_id,
  });

  const isEditingRoot = Boolean(collection && !collection.parent_id);

  const rootCategories = useMemo(() => {
    const roots = allCollections.filter((c) => !c.parent_id);
    const preferred = MAIN_MENU_SECTIONS.map((section) =>
      roots.find((c) => c.handle === section.handle),
    ).filter((c): c is FlatCategory => Boolean(c));
    const preferredIds = new Set(preferred.map((c) => c.id));
    const others = roots.filter((c) => !preferredIds.has(c.id));
    return [...preferred, ...others];
  }, [allCollections]);

  const nestedOptions = useMemo(() => {
    if (!formData.main_menu_id) return [];
    const tree = buildCategoryTree(
      allCollections.filter((c) => c.id !== collection?.id),
    );
    const rootNode = tree.find((n) => n.id === formData.main_menu_id);
    if (!rootNode) return [];
    return flattenCategoryTree(rootNode.children, 1);
  }, [allCollections, collection?.id, formData.main_menu_id]);

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

  const handleMainMenuChange = (mainMenuId: string) => {
    setFormData({
      ...formData,
      main_menu_id: mainMenuId,
      nested_parent_id: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isEditingRoot && !formData.main_menu_id) {
        toast.error("Изберете към кое главно меню принадлежи категорията");
        setLoading(false);
        return;
      }

      const finalHandle = (
        formData.handle.trim() || generateHandleFromTitle(formData.title)
      ).trim();

      const parent_id = isEditingRoot
        ? null
        : formData.nested_parent_id || formData.main_menu_id || null;

      const collectionData = {
        handle: finalHandle,
        title: formData.title,
        description: formData.description.trim() || undefined,
        position: parseInt(formData.position) || 0,
        parent_id,
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
            placeholder="nastolni-lampi"
          />
          {handleError ? (
            <p className="mt-1 text-xs text-red-600">{handleError}</p>
          ) : (
            <FieldHint example="za-neya → /products?collection=za-neya">
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

        {isEditingRoot ? (
          <div className="md:col-span-2 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100">
            Това е <strong>главно меню</strong> в горната навигация на сайта
            (Картички / Подаръци / Семенна хартия). Подкатегориите се закачат
            към него чрез полето „Главно меню“ при създаване.
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Главно меню *
              </label>
              <select
                required
                value={formData.main_menu_id}
                onChange={(e) => handleMainMenuChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">— Изберете секция —</option>
                {rootCategories.map((root) => (
                  <option key={root.id} value={root.id}>
                    {root.title}
                  </option>
                ))}
              </select>
              <FieldHint example="Настолни лампи → Подаръци">
                Към коя секция от горното меню на сайта да се показва тази
                категория (Картички, Подаръци или Семенна хартия).
              </FieldHint>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Под-категория (по избор)
              </label>
              <select
                value={formData.nested_parent_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nested_parent_id: e.target.value,
                  })
                }
                disabled={!formData.main_menu_id}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">— Директно под главното меню —</option>
                {nestedOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {"—".repeat(opt.depth)} {opt.title}
                  </option>
                ))}
              </select>
              <FieldHint>
                Оставете празно, за да е директно под избраното главно меню.
                Или изберете съществуваща подкатегория за по-дълбоко влагане.
              </FieldHint>
            </div>
          </>
        )}

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
