import Footer from "components/layout/footer";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import { BusinessInquiryForm } from "components/za-biznesa/business-inquiry-form";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

// Краен срок за коледни поръчки от фирми.
const ORDER_DEADLINE = "12 декември";

export const metadata: Metadata = {
  title: "Коледни картички за фирми с лого – от хартия със семена",
  description:
    "10 коледни дизайна върху ръчно правена хартия със семена. Вашето лого и поздрав на гърба. От 100 бр., с фактура, доставка със Speedy. Поръчки до 12 декември.",
  alternates: { canonical: "/koledni-kartichki-za-firmi" },
};

const designs = [
  { file: "dizain-01.jpg", name: "Хартиена елха · Весела Коледа" },
  { file: "dizain-02.jpg", name: "Елха и подаръци · Весела Коледа" },
  { file: "dizain-03.jpg", name: "Елха със звезди" },
  { file: "dizain-04.jpg", name: "Подаръци под елхата" },
  { file: "dizain-05.jpg", name: "Коледна топка с пожелание" },
  { file: "dizain-06.jpg", name: "Подаръци · Merry Christmas" },
  { file: "dizain-07.jpg", name: "Гирлянда с топки" },
  { file: "dizain-08.jpg", name: "Имел · Светли празници" },
  { file: "dizain-09.jpg", name: "Фенер · Весела Коледа" },
  { file: "dizain-10.jpg", name: "Люлеещо се конче · Щастливи празници" },
];

const steps = [
  {
    title: "Изберете дизайн",
    text: "Един или няколко от 10-те коледни дизайна.",
  },
  {
    title: "Изпратете лого и поздрав",
    text: "Логото и текста за гърба – на имейл. Подготвяме проект за одобрение.",
  },
  {
    title: "Изработваме",
    text: "Отпечатваме върху ръчно правена хартия със семена в София.",
  },
  {
    title: "Доставка",
    text: "Изпращаме със Speedy до адрес или офис, с фактура.",
  },
];

const faq = [
  { q: "Какъв е минималният тираж?", a: "100 броя." },
  {
    q: "Къде е логото?",
    a: "Лицевата страна остава с избрания коледен дизайн. Вашето лого и поздрав са на гърба. При дизайни 3, 4 и 7 можем да добавим малко лого и отпред.",
  },
  {
    q: "Мога ли да използвам мой дизайн?",
    a: "Да. Работим и по готов дизайн от Вас или Вашата агенция.",
  },
  {
    q: "Как се засажда картичката?",
    a: "Поставя се върху влажна почва, покрива се с 2–3 мм пръст и се полива. Покълването обикновено е за 7–21 дни.",
  },
  {
    q: "Мога ли първо да видя хартията?",
    a: "Да – пишете ни и ще Ви изпратим мостри.",
  },
];

function CardImage({
  file,
  alt,
  sizes,
  priority,
}: {
  file: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-[100/143] overflow-hidden rounded-sm bg-[#efe6d6] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_14px_30px_-10px_rgba(40,50,30,0.4)]">
      <Image
        src={`/koledni-dizaini/${file}`}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover mix-blend-multiply"
      />
    </div>
  );
}

export default function KoledniKartichkiZaFirmiPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper-bg py-14 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.petals}
          overlay={PAPER_OVERLAYS.hero}
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-paper-green/30 bg-paper-white/70 px-4 py-1.5 text-sm font-medium text-paper-green">
              🎄 Коледа · за фирми
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-paper-heading sm:text-5xl">
              Коледни картички с Вашето лого, които поникват
            </h1>
            <p className="mt-6 max-w-xl text-lg text-paper-text">
              Изберете един от нашите 10 коледни дизайна – на гърба отпечатваме
              Вашето лого и поздрав от фирмата. Картичките са от ръчно правена
              хартия със семена: след празниците се засаждат и от тях поникват
              цветя.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-paper-heading">
              <li>✓ от 100 бр.</li>
              <li>✓ Ръчна изработка в София</li>
              <li>✓ Доставка със Speedy</li>
              <li>✓ С фактура</li>
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#zapitvane" className="btn-primary rounded-full px-8">
                Поискайте оферта
              </a>
              <a href="#dizaini" className="btn-outline rounded-full px-8">
                Вижте дизайните
              </a>
            </div>
            <p className="mt-5 text-sm font-semibold text-[#a8322d]">
              Поръчки за Коледа приемаме до {ORDER_DEADLINE}.
            </p>
            <p className="mt-3 text-sm text-paper-muted">
              Търсите няколко картички за себе си?{" "}
              <Link
                href="/products?collection=koleda"
                className="font-medium text-paper-green underline underline-offset-2"
              >
                Вижте коледните картички в магазина
              </Link>
            </p>
          </div>
          <div className="relative mx-auto h-[420px] w-full max-w-[520px] sm:h-[470px]">
            <div className="absolute left-[2%] top-[50px] w-[42%] -rotate-[8deg]">
              <CardImage
                file="dizain-03.jpg"
                alt="Коледна картичка – елха със звезди"
                sizes="240px"
                priority
              />
            </div>
            <div className="absolute left-[28%] top-0 z-10 w-[46%] rotate-[3deg]">
              <CardImage
                file="dizain-07.jpg"
                alt="Коледна картичка – гирлянда с топки"
                sizes="260px"
                priority
              />
            </div>
            <div className="absolute left-[56%] top-[70px] w-[42%] rotate-[9deg]">
              <CardImage
                file="dizain-08.jpg"
                alt="Коледна картичка – имел, Светли празници"
                sizes="240px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Дизайни */}
      <section id="dizaini" className="scroll-mt-24 bg-paper-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-center font-heading text-3xl font-bold text-paper-heading sm:text-4xl">
              10 коледни дизайна
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-paper-text">
              Всички са във формат 100×143 мм. Лицевата страна остава такава,
              каквато я виждате, а Вашето лого и поздрав са на гърба.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {designs.map((d, i) => (
              <figure key={d.file}>
                <CardImage
                  file={d.file}
                  alt={`Коледна картичка: ${d.name}`}
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                />
                <figcaption className="mt-3 text-center">
                  <span className="block text-sm font-semibold text-paper-heading">
                    Дизайн {i + 1}
                  </span>
                  <span className="block text-xs text-paper-muted">
                    {d.name}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* На гърба */}
      <section className="relative overflow-hidden bg-paper-section py-16 md:py-20">
        <PaperTexture
          src={PAPER_BACKGROUNDS.seeds}
          overlay={PAPER_OVERLAYS.section}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto grid max-w-5xl items-center gap-12 px-4 sm:px-6 md:grid-cols-[320px_1fr] lg:px-8">
          <div className="mx-auto flex aspect-[100/143] w-full max-w-[320px] flex-col justify-between rounded-sm bg-[#efe6d6] p-[10%] text-paper-heading shadow-[0_1px_2px_rgba(0,0,0,0.12),0_14px_30px_-10px_rgba(40,50,30,0.4)]">
            <div className="mx-auto flex h-[16%] w-[62%] items-center justify-center rounded-md border-2 border-dashed border-paper-green/60 bg-white/40 text-xs font-bold tracking-wider">
              ВАШЕТО ЛОГО
            </div>
            <div className="text-center font-heading text-lg leading-snug">
              Скъпи партньори, благодарим Ви за доверието през годината! Весела
              Коледа и успешна Нова година!
              <span className="mt-2 block text-sm italic">
                Екипът на Вашата фирма
              </span>
            </div>
            <div className="border-t border-paper-heading/20 pt-3 text-[11px] leading-snug">
              <b>Засадете ме!</b> Поставете картичката върху влажна почва,
              покрийте с 2–3 мм пръст и поливайте.
            </div>
          </div>
          <div>
            <h2 className="font-heading text-3xl font-bold text-paper-heading sm:text-4xl">
              Вашето лого и поздрав – на гърба
            </h2>
            <p className="mt-4 text-paper-text">
              Коледният дизайн отпред остава чист и красив, а на гърба е всичко
              за Вашата фирма.
            </p>
            <ul className="mt-5 space-y-3 text-paper-text">
              <li>🌱 Вашето лого – отгоре, в цвят.</li>
              <li>
                🌱 Поздрав от фирмата – на български или английски, по Ваш
                текст.
              </li>
              <li>🌱 Кратко указание как се засажда и QR код.</li>
            </ul>
            <p className="mt-5 text-sm text-paper-muted">
              Искате лого и отпред? При дизайни 3, 4 и 7 има място и за малко
              лого на лицевата страна.
            </p>
          </div>
        </div>
      </section>

      {/* Как поръчвам */}
      <section className="bg-paper-bg py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-paper-heading sm:text-4xl">
            Как поръчвам
          </h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="rounded-2xl border border-paper-border bg-paper-white p-6"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-green font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-heading text-xl font-bold text-paper-heading">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-paper-text">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Цени */}
      <section id="ceni" className="scroll-mt-24 bg-paper-white py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-paper-heading sm:text-4xl">
            Цени
          </h2>
          <p className="mt-3 text-center text-paper-text">
            Цена за 1 коледна картичка 100×143 мм с Вашето лого.
          </p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-paper-border">
            <table className="w-full text-left">
              <thead className="bg-paper-green text-sm text-white">
                <tr>
                  <th className="px-5 py-3 font-medium">Тираж</th>
                  <th className="px-5 py-3 font-medium">Цена за брой</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-paper-border">
                  <td className="px-5 py-4">100–199 бр.</td>
                  <td className="px-5 py-4 text-lg font-bold text-paper-heading">
                    1,34 €
                  </td>
                </tr>
                <tr className="border-t border-paper-border">
                  <td className="px-5 py-4">1000+ бр.</td>
                  <td className="px-5 py-4 text-lg font-bold text-paper-heading">
                    0,99 €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-sm text-paper-muted">
            Минимален тираж 100 бр. Междинните количества са в{" "}
            <Link
              href="/za-biznesa"
              className="text-paper-green underline underline-offset-2"
            >
              таблицата за бизнеса
            </Link>
            . Доставка със Speedy по тарифа.
          </p>
        </div>
      </section>

      {/* Запитване */}
      <section
        id="zapitvane"
        className="relative scroll-mt-24 overflow-hidden bg-paper-section py-16 md:py-20"
      >
        <PaperTexture
          src={PAPER_BACKGROUNDS.fibers}
          overlay={PAPER_OVERLAYS.section}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-paper-heading sm:text-4xl">
            Поискайте оферта
          </h2>
          <p className="mb-6 mt-3 text-center text-paper-text">
            Напишете кой дизайн харесвате и колко броя са Ви нужни – ще Ви
            изпратим проект с Вашето лого. Коледни поръчки – до{" "}
            {ORDER_DEADLINE}.
          </p>
          <BusinessInquiryForm />
        </div>
      </section>

      {/* Въпроси */}
      <section className="bg-paper-bg py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-paper-heading">
            Често задавани въпроси
          </h2>
          <dl className="mt-8 divide-y divide-paper-border">
            {faq.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-semibold text-paper-heading">{f.q}</dt>
                <dd className="mt-1 text-sm text-paper-text">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Footer />
    </>
  );
}
