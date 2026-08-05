import Footer from "components/layout/footer";
import { TrustedCompanies } from "components/home/trusted-companies";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import { BusinessInquiryForm } from "components/za-biznesa/business-inquiry-form";
import { BusinessProducts } from "components/za-biznesa/business-products";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import type { Metadata } from "next";
import Image from "next/image";

const CARD_BG = PAPER_BACKGROUNDS.petalsSoft;

export const metadata: Metadata = {
  title: "За бизнеса",
  description:
    "Корпоративни продукти от семенна хартия — еко рекламни материали и корпоративни подаръци от PaperOK, София.",
};

const paperTypes = [
  {
    name: "Хартия с цветя",
    description: "Семенна хартия с подбрани цветни семена.",
  },
  {
    name: "Хартия с диви цветя",
    description: "Семенна хартия с микс от диворастящи цветя.",
  },
  {
    name: "Хартия с билки",
    description: "Семенна хартия със семена от билки и зелени подправки.",
  },
  {
    name: "Хартия с цветни листенца",
    description: "Семенна хартия с естествени цветни листенца и семена.",
  },
];

const sizes = [
  "56 × 50 mm",
  "65 × 65 mm",
  "90 × 50 mm",
  "50 × 70 mm",
  "74 × 105 mm (A7)",
  "105 × 148 mm (A6)",
  "148 × 210 mm (A5)",
  "Размер по поръчка",
];

const samplePrices = [
  { product: "Визитки (85×55 mm)", qty: "100 бр.", price: "от 45 €" },
  { product: "Картички A6", qty: "100 бр.", price: "от 60 €" },
  { product: "Картички A5", qty: "100 бр.", price: "от 80 €" },
  { product: "Покани A5", qty: "50 бр.", price: "от 55 €" },
  { product: "Етикети / Hang tags", qty: "200 бр.", price: "от 50 €" },
  { product: "Бележници A6", qty: "50 бр.", price: "от 70 €" },
  { product: "Календари настолни", qty: "50 бр.", price: "от 120 €" },
  { product: "Корпоративен комплект", qty: "по заявка", price: "индивидуална оферта" },
];

const projects = [
  {
    title: "Корпоративни картички за IT компания",
    description: "500 благодарствени картички с лого и персонализиран дизайн.",
    emoji: "💻",
    image: "/IMG_9777.JPG",
  },
  {
    title: "Сватбени покани",
    description: "200 покани A5 от крафт семенна хартия с златен печат.",
    emoji: "💒",
    image: "/IMG_9773.JPG",
  },
  {
    title: "Еко етикети за козметика",
    description: "Hang tags и етикети за натурална козметична марка.",
    emoji: "🧴",
    image: "/IMG_9774.JPG",
  },
  {
    title: "Коледни корпоративни подаръци",
    description: "Комплекти от картички и семенна хартия за 150 служители.",
    emoji: "🎄",
    image: "/santa.png",
  },
];

const benefits = [
  {
    title: "Продукти, които оставят впечатление",
    description: "Корпоративен подарък и рекламен материал с еко характер.",
  },
  {
    title: "Устойчив избор",
    description: "Рециклирана семенна хартия, която може да се засади.",
  },
  {
    title: "Собствено производство",
    description: "Целият процес е в наши ръце — от хартията до печат.",
  },
  {
    title: "Персонализация",
    description: "Лого, цветове и дизайн по вашите изисквания.",
  },
  {
    title: "Произведено в София",
    description: "Кратки срокове и директна комуникация.",
  },
  {
    title: "Опит с корпоративни клиенти",
    description: "Работим с фирми, агенции, хотели и организатори на събития.",
  },
];

const testimonials = [
  {
    name: "Иван М.",
    company: "Tech Solutions EOOD",
    text: "Поръчахме 300 благодарствени картички за клиенти. Реакцията беше невероятна — всеки пита откъде са.",
  },
  {
    name: "Петя С.",
    company: "Green Beauty BG",
    text: "Етикетите от семенна хартия перфектно допълват нашия еко бранд. Качеството е отлично.",
  },
  {
    name: "Димитър К.",
    company: "Event Pro",
    text: "Работихме по покани за сватба — красиви, оригинални и на достъпна цена. Препоръчвам!",
  },
  {
    name: "Анна В.",
    company: "HR Manager, FinCorp",
    text: "Коледните комплекти за служителите бяха хит. PaperOK ни помогнаха с дизайна и доставката навреме.",
  },
];

export default function ZaBiznesaPage() {
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
          <h1 className="animate-fade-in-up font-heading text-4xl font-bold tracking-tight text-paper-heading sm:text-5xl">
            Корпоративни продукти от семенна хартия
          </h1>
          <p className="animate-fade-in-up animate-delay-200 mx-auto mt-6 max-w-2xl text-lg text-paper-text">
            Еко рекламни материали и корпоративни подаръци, които се засаждат и
            оставят трайно впечатление.
          </p>
        </div>
      </section>

      {/* Какво изработваме */}
      <BusinessProducts />

      {/* Видове хартия */}
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
              Видове хартия
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {paperTypes.map((paper, index) => (
              <Reveal key={paper.name} delay={index * 80} variant="up">
                <div className="hover-lift relative overflow-hidden rounded-xl border border-paper-border p-6">
                  <PaperTexture
                    src={CARD_BG}
                    overlay={PAPER_OVERLAYS.card}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    quality={85}
                  />
                  <div className="relative z-10">
                    <h3 className="font-semibold text-paper-green">
                      {paper.name}
                    </h3>
                    <p className="mt-2 text-sm text-paper-text">
                      {paper.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Размери и формати */}
      <section className="relative overflow-hidden bg-paper-bg py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.plain}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
              Размери и формати
            </h2>
          </Reveal>
          <ul className="space-y-3">
            {sizes.map((size, index) => (
              <Reveal key={size} as="li" delay={index * 40} variant="left">
                <div className="relative flex items-start gap-3 overflow-hidden rounded-lg border border-paper-border px-5 py-3">
                  <PaperTexture
                    src={CARD_BG}
                    overlay={PAPER_OVERLAYS.white}
                    sizes="(min-width: 768px) 48rem, 100vw"
                    quality={80}
                  />
                  <span className="relative z-10 mt-0.5 text-paper-green">✓</span>
                  <span className="relative z-10 text-paper-text">{size}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Примерни цени */}
      <section className="relative overflow-hidden bg-paper-section py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.seeds}
          overlay={PAPER_OVERLAYS.section}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading mb-4 text-center text-3xl font-bold text-paper-heading">
              Примерни цени
            </h2>
            <p className="mb-8 text-center text-sm text-paper-muted">
              Ориентировъчни цени без ДДС. За точна оферта — попълнете формата
              по-долу.
            </p>
          </Reveal>
          <Reveal delay={100} variant="up">
          <div className="relative overflow-hidden rounded-xl border border-paper-border">
            <PaperTexture
              src={CARD_BG}
              overlay={PAPER_OVERLAYS.white}
              sizes="(min-width: 768px) 56rem, 100vw"
              quality={80}
            />
            <table className="relative z-10 w-full text-left text-sm">
              <thead className="bg-paper-green text-white">
                <tr>
                  <th className="px-6 py-3 font-semibold">Продукт</th>
                  <th className="px-6 py-3 font-semibold">Количество</th>
                  <th className="px-6 py-3 font-semibold">Цена</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border">
                {samplePrices.map((row) => (
                  <tr key={row.product}>
                    <td className="px-6 py-4 text-paper-heading">
                      {row.product}
                    </td>
                    <td className="px-6 py-4 text-paper-text">{row.qty}</td>
                    <td className="px-6 py-4 font-medium text-paper-green">
                      {row.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </Reveal>
        </div>
      </section>

      {/* Наши проекти */}
      <section className="relative overflow-hidden bg-paper-bg py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.fibers}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
              Наши проекти
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((p, index) => (
              <Reveal key={p.title} delay={index * 90} variant="up">
                <div className="hover-lift group overflow-hidden rounded-2xl border border-paper-border">
                  <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-paper-accent-bg to-paper-section">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="img-zoom object-cover"
                      />
                    ) : (
                      <span className="text-5xl">{p.emoji}</span>
                    )}
                  </div>
                  <div className="relative overflow-hidden p-6">
                    <PaperTexture
                      src={CARD_BG}
                      overlay={PAPER_OVERLAYS.white}
                      sizes="(min-width: 640px) 50vw, 100vw"
                      quality={80}
                    />
                    <div className="relative z-10">
                      <h3 className="font-semibold text-paper-heading">{p.title}</h3>
                      <p className="mt-2 text-sm text-paper-text">{p.description}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Защо PaperOK за бизнеса */}
      <section className="relative overflow-hidden bg-paper-accent-bg py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.fibers}
          overlay={PAPER_OVERLAYS.accent}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
              Защо PaperOK за бизнеса
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, index) => (
              <Reveal key={b.title} delay={index * 70} variant="up">
                <div className="hover-lift relative overflow-hidden rounded-xl border border-paper-border/50 p-6 shadow-sm">
                  <PaperTexture
                    src={CARD_BG}
                    overlay={PAPER_OVERLAYS.white}
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    quality={85}
                  />
                  <div className="relative z-10">
                    <h3 className="font-semibold text-paper-heading">{b.title}</h3>
                    <p className="mt-2 text-sm text-paper-text">{b.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TrustedCompanies />

      {/* Отзиви от бизнес клиенти */}
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
              Отзиви от бизнес клиенти
            </h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, index) => (
              <Reveal key={t.name} delay={index * 80} variant="up">
                <blockquote className="hover-lift relative flex h-full flex-col overflow-hidden rounded-xl border border-paper-border p-6">
                  <PaperTexture
                    src={CARD_BG}
                    overlay={PAPER_OVERLAYS.white}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    quality={80}
                  />
                  <div className="relative z-10 flex h-full flex-col">
                    <p className="flex-1 text-sm leading-relaxed text-paper-text">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <footer className="mt-4 border-t border-paper-border pt-4">
                      <cite className="not-italic">
                        <span className="font-semibold text-paper-heading">
                          {t.name}
                        </span>
                        <span className="block text-xs text-paper-muted">
                          {t.company}
                        </span>
                      </cite>
                    </footer>
                  </div>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Форма за запитване */}
      <section className="relative overflow-hidden bg-paper-section py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.seeds}
          overlay={PAPER_OVERLAYS.section}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <BusinessInquiryForm />
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
