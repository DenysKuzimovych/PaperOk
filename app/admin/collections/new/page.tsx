import { getAllCollectionsForAdmin } from "lib/supabase/admin-collections";
import { CollectionForm } from "components/admin/collection-form";

export default async function NewCollectionPage() {
  const collections = await getAllCollectionsForAdmin();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Нова Категория
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Изберете към кое главно меню на сайта да принадлежи категорията
          (Картички, Подаръци или Семенна хартия)
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <CollectionForm
          allCollections={collections.map((c: any) => ({
            id: c.id,
            handle: c.handle,
            title: c.title,
            position: c.position ?? 0,
            parent_id: c.parent_id || null,
          }))}
        />
      </div>
    </div>
  );
}
