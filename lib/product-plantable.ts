/** Categories that are not plantable by default (unless plantable=true in DB) */
const NON_PLANTABLE_CATEGORIES = new Set([
  "aromatni-sasheta",
  "aromatizatori-avtomobil",
]);

/**
 * Whether a product can be planted.
 * Uses explicit `plantable` when set; otherwise falls back to category.
 */
export function isProductPlantable(product: {
  plantable?: boolean | null;
  category?: string | null;
}): boolean {
  if (product.plantable === false) return false;
  if (product.plantable === true) return true;
  return !NON_PLANTABLE_CATEGORIES.has(product.category || "");
}
