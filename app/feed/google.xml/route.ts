import { getProducts } from "lib/supabase/products";
import { baseUrl } from "lib/utils";

// Google Merchant Center product feed (RSS 2.0 + g: namespace).
// Read-only: exposes only public storefront data (same as the product pages).
export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function plainText(value: string | undefined, maxLength: number): string {
  const text = (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength
    ? `${text.slice(0, maxLength - 3).trimEnd()}...`
    : text;
}

function formatPrice(value: number): string {
  return `${value.toFixed(2)} EUR`;
}

export async function GET() {
  const products = await getProducts({});

  const items = products
    .filter(
      (product) =>
        product.available &&
        product.handle &&
        product.title &&
        product.featuredImage?.url &&
        Number.isFinite(product.price) &&
        product.price > 0,
    )
    .map((product) => {
      const description =
        plainText(product.description, 4900) ||
        plainText(product.title, 150);
      const additionalImages = product.images
        .map((image) => image.url)
        .filter((url) => url && url !== product.featuredImage.url)
        .slice(0, 10)
        .map(
          (url) =>
            `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`,
        )
        .join("\n");

      const salePrice =
        product.compareAtPrice && product.compareAtPrice > product.price
          ? `      <g:price>${formatPrice(product.compareAtPrice)}</g:price>\n      <g:sale_price>${formatPrice(product.price)}</g:sale_price>`
          : `      <g:price>${formatPrice(product.price)}</g:price>`;

      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(plainText(product.title, 150))}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(`${baseUrl}/product/${product.handle}`)}</g:link>
      <g:image_link>${escapeXml(product.featuredImage.url)}</g:image_link>
${additionalImages ? `${additionalImages}\n` : ""}      <g:availability>in_stock</g:availability>
${salePrice}
      <g:brand>PaperOK</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>PaperOK</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>PaperOK product feed</description>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
