import Footer from "components/layout/footer";
import { Testimonials } from "components/home/testimonials";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import { BusinessInquiryForm } from "components/za-biznesa/business-inquiry-form";
import {
  BUSINESS_GRID_CLASS,
  BUSINESS_GRID_REVEAL_CLASS,
  BusinessCard,
  BusinessCardText,
  BusinessCardTitle,
} from "components/za-biznesa/business-card";
import { BusinessSamplePrices } from "components/za-biznesa/business-sample-prices";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import {
  CalendarDaysIcon,
  GiftIcon,
  BookOpenIcon,
  MegaphoneIcon,
  SparklesIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import type { Metadata } from "next";

const CARD_BG = PAPER_BACKGROUNDS.petalsSoft;

// Крайна дата за поръчки с доставка преди Коледа.
// ⚠️ Денис: потвърди реалния срок (производство + Speedy преди 24.12).
const ORDER_DEADLINE = "12 декември";

export const metadata: Metadata = {
  title: "Коледни корпоративни подаръци от семенна хартия",
  description:
    "Брандирани коледни подаръци и картички от семенна хартия за вашите клиенти и служители. Еко, запомнящи се и произведени в София. Поръчайте навреме за Коледа.",
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const benefits: { title: string; description: string; icon: IconComponent }[] =
  [
    {
      title: "Подарък, който се помни",
      description:
        "Семенната хартия се засажда и покълва в цветя — клиентите и служителите ви я пазят, а не я изхвърлят.",
      icon: SparklesIcon,
    },
    {
      title: "Вашият бранд, еко послание",
      description:
        "Печат по ваше лого и дизайн. Устойчив жест, който говори добре за компанията ви.",
      icon: MegaphoneIcon,
    },
    {
      title: "Собствено производство в София",
      description:
        "Целият процес е при нас — кратки срокове, директна комуникация и фактура с ДДС.",
      icon: GiftIcon,
    },
  ];

const products: { title: string; icon: IconComponent }[] = [
  { title: "Коледни картички с лого", icon: MegaphoneIcon },
  { title: "Брандирани подаръчни комплекти", icon: GiftIcon },
  { title: "Календари за 2026", icon: CalendarDaysIcon },
  { title: "Бележници за служители", icon: BookOpenIcon },
  { title: "Ваучери и етикети за подаръци", icon: TicketIcon },
  { title: "Персонализиран дизайн с AI", icon: SparklesIcon },
];


export default function KoledniKorporativniPodaratsiPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-paper-accent-bg via-paper-bg to-paper-section py-16 md:py-24">
        <PaperTexture
          src={PAPER_BACKGROUNDS.petals}
          overlay={PAPER_OVERLAYS.hero}
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-paper-green/30 bg-paper-white/70 px-4 py-1.5 text-sm font-medium text-paper-green">
            🎄 Коледни корпоративни поръчки
          </span>
          <h1 className="animate-fade-in-up animate-delay-100 mx-auto mt-6 max-w-3xl font-heading text-4xl font-bold tracking-tight text-paper-heading sm:text-5xl">
            Коледни подаръци от семенна хартия за вашия екип и клиенти
          </h1>
          <p className="animate-fade-in-up animate-delay-200 mx-auto mt-6 max-w-2xl text-lg text-paper-text">
            Брандирани картички, комплекти и подаръци, които се засаждат и
            покълват в цветя. Еко, запомнящи се и произведени в София.
          </p>
          <div className="animate-fade-in-up animate-delay-300 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#zapitvane" className="btn-primary rounded-full px-8">
              Поискайте оферта
            </a>
            <p className="text-sm font-medium text-paper-heading">
              ⏳ Поръчайте до {ORDER_DEADLINE} за доставка преди Коледа
            </p>
          </div>
        </div>
      </section>

      {/* Защо семенна хартия за Коледа */}
      <section className="relative overflow-hidden bg-paper-bg py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.plain}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
              Защо семенна хартия за Коледа
            </h2>
          </Reveal>
          <div className={`${BUSINESS_GRID_CLASS} gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
            {benefits.map((b, index) => (
              <Reveal
                key={b.title}
                delay={index * 80}
                variant="up"
                className={BUSINESS_GRID_REVEAL_CLASS}
              >
                <BusinessCard
                  textureSrc={CARD_BG}
                  textureOverlay={PAPER_OVERLAYS.card}
                  textureSizes="(min-width: 1024px) 33vw, 50vw"
                  className="border-paper-border/50 shadow-sm"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-paper-green/20 bg-paper-accent-bg/60">
                    <b.icon
                      className="h-5 w-5 text-paper-green"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                  <BusinessCardTitle lines={2} className="text-paper-heading">
                    {b.title}
                  </BusinessCardTitle>
                  <BusinessCardText className="min-h-[4rem]">
                    {b.description}
                  </BusinessCardText>
                </BusinessCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Какво можем да изработим за Коледа */}
      <section className="relative overflow-hidden bg-paper-section py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.seeds}
          overlay={PAPER_OVERLAYS.section}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
              Какво можем да изработим за Коледа
            </h2>
          </Reveal>
          <div className={`${BUSINESS_GRID_CLASS} gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
            {products.map((product, index) => (
              <Reveal
                key={product.title}
                delay={index * 60}
                variant="up"
                className={BUSINESS_GRID_REVEAL_CLASS}
              >
                <BusinessCard
                  textureSrc={CARD_BG}
                  textureSizes="(min-width: 1024px) 33vw, 50vw"
                  padding="md"
                  bodyClassName="justify-center"
                  className="group transition-colors hover:border-paper-green/30"
                >
                  <div className="flex min-h-[4.75rem] items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-paper-green/20 bg-paper-accent-bg/60 transition-transform duration-300 group-hover:scale-110">
                      <product.icon
                        className="h-5 w-5 text-paper-green"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </div>
                    <span className="font-medium leading-snug text-paper-heading">
                      {product.title}
                    </span>
                  </div>
                </BusinessCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Размери и примерни цени */}
      <BusinessSamplePrices />

      {/* Отзиви – реални публикации на клиенти */}
      <Testimonials />

      {/* Форма за запитване */}
      <section
        id="zapitvane"
        className="relative overflow-hidden bg-paper-section py-16 md:py-20"
      >
        <PaperTexture
          src={PAPER_BACKGROUNDS.seeds}
          overlay={PAPER_OVERLAYS.section}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="mb-6 text-center text-lg text-paper-text">
              Поискайте индивидуална оферта за коледна корпоративна поръчка —
              отговаряме бързо, с цена и срок.
            </p>
          </Reveal>
          <Reveal variant="up">
            <BusinessInquiryForm />
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
