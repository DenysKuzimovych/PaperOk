import Footer from "components/layout/footer";
import { AboutUs } from "components/home/about-us";
import { CategoryCards } from "components/home/category-cards";
import { FAQ } from "components/home/faq";
import { FeaturedProducts } from "components/home/featured-products";
import { Hero } from "components/home/hero";
import { HowItWorks } from "components/home/how-it-works";
import { Testimonials } from "components/home/testimonials";
import { TrustedCompanies } from "components/home/trusted-companies";
import { WhyPaperOK } from "components/home/why-paperok";
import { SITE_TAGLINE, LOGO_WITH_BACKGROUND, LOGO_WITH_BACKGROUND_SIZE } from "lib/constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "PaperOK — Подаръци, които разцъфват",
  description: SITE_TAGLINE,
  openGraph: {
    type: "website",
    title: "PaperOK — Подаръци, които разцъфват",
    description: SITE_TAGLINE,
    images: [
      {
        url: LOGO_WITH_BACKGROUND,
        width: LOGO_WITH_BACKGROUND_SIZE.width,
        height: LOGO_WITH_BACKGROUND_SIZE.height,
        alt: "PaperOK",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryCards />
      <HowItWorks />
      <FeaturedProducts />
      <WhyPaperOK />
      <Testimonials />
      <AboutUs />
      <TrustedCompanies />
      <FAQ />
      <Footer />
    </>
  );
}
