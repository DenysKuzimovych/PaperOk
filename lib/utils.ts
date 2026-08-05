import { ReadonlyURLSearchParams } from "next/navigation";
import { SITE_URL } from "lib/constants";

/**
 * Site URL for metadata, emails, sitemap, Stripe redirects.
 * Prefers NEXT_PUBLIC_SITE_URL, then production domain; localhost only in development.
 */
export function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return SITE_URL;
}

export const baseUrl = getBaseUrl();

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams,
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const formatPrice = (price: number, currency: string = "EUR"): string => {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency,
  }).format(price);
};
