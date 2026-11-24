import { AI_MAX_ATTEMPTS } from "lib/ai-design/constants";

const STEPS = [
  {
    title: "Избери формат",
    text: "Картичка А6 или А5, или постер А4 или А3. Цената се вижда веднага до формата.",
  },
  {
    title: "Опиши идеята",
    text: "За какъв повод е и за кого: например „рожден ден на 5-годишния Нилчо, балони и торта“. Текстът, който трябва да е на картичката, пиши в отделното поле.",
  },
  {
    title: "Избери стил и създай",
    text: `Акварелен, ботанически, детски и закачлив и други. Получаваш до ${AI_MAX_ATTEMPTS} варианта – ако не ти харесат, промени описанието и опитай пак.`,
  },
  {
    title: "Добави в количката",
    text: "Прегледай внимателно текста и правописа и добави любимия вариант в количката. Ние го отпечатваме върху ръчна хартия.",
  },
] as const;

export function AiDesignHowItWorks() {
  return (
    <section
      id="kak-raboti"
      aria-labelledby="ai-design-how-title"
      className="mt-12 mb-10 scroll-mt-24"
    >
      <p className="text-xs font-semibold tracking-[0.06em] text-paper-green-hover uppercase">
        Лесно е
      </p>
      <h2
        id="ai-design-how-title"
        className="mt-1 font-heading text-2xl font-semibold text-paper-heading sm:text-[1.75rem]"
      >
        Как работи
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper-muted sm:text-base">
        Четири стъпки и няколко минути – не ти трябват умения по дизайн.
      </p>

      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-paper-border bg-white/80 p-4"
          >
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#5F7A48] text-sm font-semibold text-white"
            >
              {index + 1}
            </span>
            <p className="mt-3 text-sm font-semibold text-paper-heading">
              {step.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-paper-text">
              {step.text}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-sm leading-relaxed text-paper-muted">
        <strong className="text-paper-heading">Съвет:</strong> колкото
        по-конкретно опишеш идеята – повод, цветове, герои, настроение –
        толкова по-близо до мечтания резултат ще е дизайнът.
      </p>
    </section>
  );
}
