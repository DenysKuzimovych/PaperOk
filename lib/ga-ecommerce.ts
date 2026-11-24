import { GA_MEASUREMENT_ID } from "lib/constants";

/**
 * Minimal GA4 e-commerce event helpers (client-side).
 *
 * The Google tag (gtag.js) is loaded once in components/google-tags.tsx with
 * Consent Mode v2 (storage denied until the visitor accepts cookies). We push
 * events through the same `gtag` queue; GA4 withholds data until consent is
 * granted, so no extra gating is needed here.
 *
 * Covers the upper funnel (view_item, add_to_cart, begin_checkout). The
 * `purchase` event + Google Ads conversion live in lib/google-ads.ts and fire
 * on the checkout success page.
 */

declare global {
  interface Window {
    // Keep in sync with the declaration in lib/google-ads.ts.
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type GaItem = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
};

function ensureGtag(): boolean {
  if (typeof window === "undefined") return false;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      // Must push `arguments` (not a rest-array) for gtag.js to process it.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
  return true;
}

function round2(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function cleanItems(items: GaItem[]): GaItem[] {
  return items
    .filter((i) => i && i.item_id)
    .map((i) => ({
      item_id: String(i.item_id),
      item_name: String(i.item_name || ""),
      price: i.price != null ? round2(i.price) : undefined,
      quantity: i.quantity != null ? i.quantity : 1,
    }));
}

function itemsValue(items: GaItem[]): number {
  return round2(
    items.reduce(
      (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
      0,
    ),
  );
}

function emit(event: string, items: GaItem[]) {
  if (!ensureGtag()) return;
  const cleaned = cleanItems(items);
  if (cleaned.length === 0) return;
  window.gtag!("event", event, {
    send_to: GA_MEASUREMENT_ID,
    currency: "EUR",
    value: itemsValue(cleaned),
    items: cleaned,
  });
}

/** Product or AI-design preview viewed. */
export function reportViewItem(item: GaItem) {
  emit("view_item", [{ ...item, quantity: item.quantity ?? 1 }]);
}

/** Item added to the cart (product page or AI-design studio). */
export function reportAddToCart(item: GaItem) {
  emit("add_to_cart", [{ ...item, quantity: item.quantity ?? 1 }]);
}

/** Checkout page reached with a non-empty cart. */
export function reportBeginCheckout(items: GaItem[]) {
  emit("begin_checkout", items);
}

/**
 * AI-design studio: a design was generated. `attempt` is the attempt number
 * within the current design (1..AI_MAX_ATTEMPTS), so GA shows how many
 * visitors try again before adding to cart.
 */
export function reportAiDesignGenerate(params: {
  formatId: string;
  attempt: number;
  styles: string[];
}) {
  if (!ensureGtag()) return;
  window.gtag!("event", "ai_design_generate", {
    send_to: GA_MEASUREMENT_ID,
    format: params.formatId,
    attempt: params.attempt,
    styles: params.styles.join(","),
  });
}
