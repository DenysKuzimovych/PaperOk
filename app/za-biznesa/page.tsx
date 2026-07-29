import Footer from "components/layout/footer";
import { BusinessInquiryForm } from "components/za-biznesa/business-inquiry-form";
import { BusinessProducts } from "components/za-biznesa/business-products";
import type { Metadata } from "next";

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
  },
  {
    title: "Сватбени покани",
    description: "200 покани A5 от крафт семенна хартия с златен печат.",
    emoji: "💒",
  },
  {
    title: "Еко етикети за козметика",
    description: "Hang tags и етикети за натурална козметична марка.",
    emoji: "🧴",
  },
  {
    title: "Коледни корпоративни подаръци",
    description: "Комплекти от картички и семенна хартия за 150 служители.",
    emoji: "🎄",
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
      <section className="bg-gradient-to-br from-paper-accent-bg via-paper-bg to-paper-section py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-paper-heading sm:text-5xl">
            Корпоративни продукти от семенна хартия
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-paper-text">
            Еко рекламни материали и корпоративни подаръци, които се засаждат и
            оставят трайно впечатление.
          </p>
        </div>
      </section>

      {/* Какво изработваме */}
      <BusinessProducts />

      {/* Видове хартия */}
      <section className="bg-paper-section py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
            Видове хартия
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {paperTypes.map((paper) => (
              <div
                key={paper.name}
                className="rounded-xl border border-paper-border bg-paper-white p-6"
              >
                <h3 className="font-semibold text-paper-green">
                  {paper.name}
                </h3>
                <p className="mt-2 text-sm text-paper-text">
                  {paper.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Размери и формати */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
            Размери и формати
          </h2>
          <ul className="space-y-3">
            {sizes.map((size) => (
              <li
                key={size}
                className="flex items-start gap-3 rounded-lg border border-paper-border bg-paper-white px-5 py-3"
              >
                <span className="mt-0.5 text-paper-green">✓</span>
                <span className="text-paper-text">{size}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Примерни цени */}
      <section className="bg-paper-section py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading mb-4 text-center text-3xl font-bold text-paper-heading">
            Примерни цени
          </h2>
          <p className="mb-8 text-center text-sm text-paper-muted">
            Ориентировъчни цени без ДДС. За точна оферта — попълнете формата
            по-долу.
          </p>
          <div className="overflow-x-auto rounded-xl border border-paper-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-green text-white">
                <tr>
                  <th className="px-6 py-3 font-semibold">Продукт</th>
                  <th className="px-6 py-3 font-semibold">Количество</th>
                  <th className="px-6 py-3 font-semibold">Цена</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border bg-paper-white">
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
        </div>
      </section>

      {/* Наши проекти */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
            Наши проекти
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((p) => (
              <div
                key={p.title}
                className="overflow-hidden rounded-2xl border border-paper-border"
              >
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-paper-accent-bg to-paper-section">
                  <span className="text-5xl">{p.emoji}</span>
                </div>
                <div className="bg-paper-white p-6">
                  <h3 className="font-semibold text-paper-heading">{p.title}</h3>
                  <p className="mt-2 text-sm text-paper-text">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Защо PaperOK за бизнеса */}
      <section className="bg-paper-accent-bg py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
            Защо PaperOK за бизнеса
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-xl bg-paper-white p-6 shadow-sm">
                <h3 className="font-semibold text-paper-heading">{b.title}</h3>
                <p className="mt-2 text-sm text-paper-text">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Отзиви от бизнес клиенти */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
            Отзиви от бизнес клиенти
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="rounded-xl border border-paper-border bg-paper-white p-6"
              >
                <p className="text-sm leading-relaxed text-paper-text">
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
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Форма за запитване */}
      <section className="bg-paper-section py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <BusinessInquiryForm />
        </div>
      </section>

      <Footer />
    </>
  );
}
