import type { Metadata } from "next";
import Link from "next/link";
import Footer from "components/layout/footer";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import { WithdrawalForm } from "components/withdrawal/withdrawal-form";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import { CONTACT_EMAIL, SITE_NAME } from "lib/constants";

export const metadata: Metadata = {
  title: "Отказ от договора",
  description:
    "Онлайн отказ от договора за поръчка от PaperOK в 14-дневния срок — без регистрация, с потвърждение по имейл.",
  alternates: { canonical: "/otkaz-ot-dogovora" },
};

export default function WithdrawalPage() {
  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-paper-bg py-12 px-4 sm:px-6 lg:px-8">
        <PaperTexture
          src={PAPER_BACKGROUNDS.seeds}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Reveal>
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-paper-green">
              {SITE_NAME}
            </p>
            <h1 className="font-heading mb-4 text-4xl font-bold text-paper-heading">
              Отказ от договора
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-paper-text">
              Имате право да се откажете от договора за покупка от разстояние в
              срок от 14 дни, без да посочвате причина. Тук можете да го
              направите онлайн — без регистрация. След като потвърдите, ще
              получите потвърждение с датата и часа на заявлението на посочения
              от Вас имейл.
            </p>
          </Reveal>

          <div className="space-y-8">
            <WithdrawalForm />

            <section className="rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8">
              <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
                Срок за отказ
              </h2>
              <p className="leading-relaxed text-paper-text">
                Срокът е 14 дни от деня, в който Вие или посочено от Вас лице
                (различно от превозвача) получите стоките. При поръчка с няколко
                артикула, доставени поотделно, срокът тече от получаването на
                последния. Отказът е направен в срок, ако заявлението е подадено
                преди изтичането на 14-те дни.
              </p>
            </section>

            <section className="rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8">
              <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
                Връщане на стоките и възстановяване на сумата
              </h2>
              <ul className="list-disc space-y-2 pl-5 leading-relaxed text-paper-text">
                <li>
                  Изпратете артикулите обратно не по-късно от 14 дни от деня на
                  отказа. Ще Ви изпратим указания за връщането.
                </li>
                <li>
                  Преките разходи по връщането на стоките са за Ваша сметка.
                </li>
                <li>
                  Ще Ви възстановим всички получени плащания, включително
                  разходите за стандартна доставка, до 14 дни от получаване на
                  заявлението, по същия начин, по който сте платили, освен ако
                  не се договорим друго. Можем да изчакаме, докато получим
                  стоките или доказателство, че са изпратени.
                </li>
                <li>
                  Отговаряте за намаляването на стойността на стоките, ако то е
                  резултат от боравене с тях извън необходимото за установяване
                  на естеството, характеристиките и функционирането им.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8">
              <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
                Кога правото на отказ не се прилага
              </h2>
              <p className="leading-relaxed text-paper-text">
                Правото на отказ не се прилага за стоки, изработени по поръчка на
                потребителя или съобразно индивидуалните му изисквания —
                например персонализирани картички и постери с Ваш текст, снимка
                или дизайн, както и корпоративни поръчки с Ваше лого (чл. 57, т.
                3 от Закона за защита на потребителите). Повече информация има в
                страницата{" "}
                <Link
                  href="/blog/vrashtane-i-reklamacii"
                  className="text-paper-green underline"
                >
                  Връщане и рекламации
                </Link>
                .
              </p>
            </section>

            <section className="rounded-2xl border border-paper-border bg-paper-white p-6 sm:p-8">
              <h2 className="font-heading mb-3 text-2xl font-semibold text-paper-heading">
                Други начини за отказ
              </h2>
              <p className="leading-relaxed text-paper-text">
                Можете да заявите отказа си и с недвусмислено писмено заявление
                на имейл{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-paper-green underline"
                >
                  {CONTACT_EMAIL}
                </a>
                , като посочите име, номер на поръчката и артикулите. Не сте
                длъжни да използвате формата на тази страница.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
