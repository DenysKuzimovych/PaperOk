import { AiDesignBanner } from "components/ai-design/ai-design-banner";
import { AiDesignStudio } from "components/ai-design/ai-design-studio";
import {
  LOGO_WITH_BACKGROUND,
  LOGO_WITH_BACKGROUND_SIZE,
  SITE_NAME,
} from "lib/constants";
import { baseUrl } from "lib/utils";
import type { Metadata } from "next";

const PAGE_TITLE = "Създай персонализирана картичка или постер с AI";
const PAGE_DESCRIPTION =
  "Опиши идеята си и AI създава уникална картичка или постер за всеки повод. Формати А6–А3, от 4 €, доставка със Speedy.";
const PAGE_URL = `${baseUrl}/ai-design`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: SITE_NAME,
    url: PAGE_URL,
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: LOGO_WITH_BACKGROUND,
        width: LOGO_WITH_BACKGROUND_SIZE.width,
        height: LOGO_WITH_BACKGROUND_SIZE.height,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [LOGO_WITH_BACKGROUND],
  },
};

/**
 * Structured data for Google: the same prices that are shown in the format
 * picker (A6 4 EUR ... A3 with frame 25 EUR). Keep in sync with the studio.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Персонализирана картичка или постер с AI дизайн",
  description: PAGE_DESCRIPTION,
  url: PAGE_URL,
  brand: { "@type": "Brand", name: SITE_NAME },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "4",
    highPrice: "25",
    offerCount: "6",
    availability: "https://schema.org/InStock",
    url: PAGE_URL,
  },
};

export default function AiDesignPage() {
  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(221,232,204,0.4),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(239,231,219,0.45),_transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <AiDesignBanner />
        <AiDesignStudio />
      </div>
    </div>
  );
}
