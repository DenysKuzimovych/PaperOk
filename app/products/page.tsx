import Footer from "components/layout/footer";
import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { Breadcrumb } from "components/products/breadcrumb";
import { CategoryTreeSidebar } from "components/products/category-tree-sidebar";
import { FilterButton } from "components/products/filter-button";
import { SortFilter } from "components/products/sort-filter";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import {
  buildCategoryTree,
  getBreadcrumbPath,
  type FlatCategory,
} from "lib/category-tree";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
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
      <div className="relative z-20 overflow-x-hidden bg-paper-bg">
        <PaperTexture
          src={PAPER_BACKGROUNDS.plain}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={82}
        />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-row gap-4 px-3 py-6 text-paper-heading sm:gap-6 sm:px-4 sm:py-8 md:gap-8">
        {/* Category Tree Sidebar — thin column on the left (mobile + desktop) */}
        <aside className="w-[8.25rem] flex-none sm:w-44 md:w-56 lg:w-64">
          <div className="sticky top-4">
            <Reveal variant="left">
              <h2 className="mb-3 font-heading text-sm font-semibold tracking-wide text-paper-heading sm:mb-4 sm:text-lg">
                Категории
              </h2>
              <CategoryTreeSidebar
                tree={categoryTree}
                currentHandle={collection}
              />
            </Reveal>
          </div>
        </aside>

        {/* Main Content — products on the right */}
        <div className="min-w-0 flex-1 overflow-visible">
          <Reveal variant="fade">
            <Breadcrumb path={breadcrumbPath} />
          </Reveal>

          <Reveal className="mb-4" delay={80}>
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
          </Reveal>

          {/* High z-index so sort/filter panels sit above products and footer */}
          <div className="relative z-50 mb-8 flex flex-row items-center justify-end gap-2 overflow-visible sm:gap-3">
            <div className="relative z-50 shrink-0">
              <SortFilter />
            </div>
            <div className="relative z-50 shrink-0">
              <FilterButton
                collections={collections}
                currentFilters={currentFilters}
              />
            </div>
          </div>

          {products.length === 0 ? (
            <p className="py-3 text-lg text-paper-text">
              Няма намерени продукти
            </p>
          ) : (
            <div className="relative z-0">
              <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <ProductGridItems products={products} />
              </Grid>
            </div>
          )}
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
