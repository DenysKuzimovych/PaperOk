import Footer from "components/layout/footer";
import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { Breadcrumb } from "components/products/breadcrumb";
import { CategoryTreeSidebar } from "components/products/category-tree-sidebar";
import { FilterButton } from "components/products/filter-button";
import { SortFilter } from "components/products/sort-filter";
import {
  buildCategoryTree,
  getBreadcrumbPath,
  type FlatCategory,
} from "lib/category-tree";
import { getProducts, getStorefrontCollections } from "lib/supabase/products";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Продукти",
  description: "Разгледайте нашите продукти от семенна хартия — картички, подаръци и още.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    collection?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    categories?: string;
    onSaleOnly?: string;
  }>;
}) {
  const params = await searchParams;
  const collection = params.collection;
  const sort = params.sort as
    | "price-asc"
    | "price-desc"
    | "discount-desc"
    | "name-asc"
    | "newest"
    | undefined;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const categories = params.categories
    ? params.categories.split(",")
    : undefined;
  const onSaleOnly = params.onSaleOnly === "true";

  const [products, collections] = await Promise.all([
    getProducts({
      collection,
      sort: sort || "newest",
      minPrice,
      maxPrice,
      categories,
      onSaleOnly,
    }),
    getStorefrontCollections(),
  ]);

  const flatCategories: FlatCategory[] = collections.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    position: c.position ?? 0,
    parent_id: c.parentId ?? null,
  }));

  const categoryTree = buildCategoryTree(flatCategories);
  const breadcrumbPath = collection
    ? getBreadcrumbPath(flatCategories, collection)
    : [];
  const currentCollection = collections.find((c) => c.handle === collection);

  const currentFilters = {
    minPrice,
    maxPrice,
    categories: categories || [],
    onSaleOnly,
  };

  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 text-paper-heading md:flex-row">
        {/* Category Tree Sidebar */}
        <aside className="order-last w-full flex-none md:order-first md:w-64">
          <div className="sticky top-4">
            <h2 className="mb-4 text-lg font-semibold text-paper-heading">
              Категории
            </h2>
            <CategoryTreeSidebar
              tree={categoryTree}
              currentHandle={collection}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="min-h-screen flex-1">
          <Breadcrumb path={breadcrumbPath} />

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-paper-heading">
              {currentCollection?.title || "Всички продукти"}
            </h1>
            {currentCollection?.description && (
              <p className="mt-3 text-lg text-paper-text">
                {currentCollection.description}
              </p>
            )}
            {products.length > 0 && (
              <p className="mt-3 text-paper-muted">
                {products.length}{" "}
                {products.length === 1 ? "продукт" : "продукта"}
              </p>
            )}
            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="w-full sm:w-auto">
                <SortFilter />
              </div>
              <div className="w-full sm:w-auto">
                <FilterButton
                  collections={collections}
                  currentFilters={currentFilters}
                />
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <p className="py-3 text-lg text-paper-text">
              Няма намерени продукти
            </p>
          ) : (
            <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <ProductGridItems products={products} />
            </Grid>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
