"use client";

import clsx from "clsx";
import { Product } from "lib/types";
import { useState } from "react";

const plantingInstructions = [
  "Намокрете хартията с вода, за да се овлажни равномерно.",
  "Поставете я в саксия или директно в градината.",
  "Покрийте с тънък слой почва — около 1 см.",
  "Поливайте редовно, като поддържате почвата влажна, но не прекалено мокра.",
  "Поставете на светло място при температура около 18–25°C.",
  "След 1–3 седмици ще забележите първите кълнове.",
];

export function ProductTabs({ product }: { product: Product }) {
  const tabs = [
    { id: "description", label: "Описание" },
    ...(product.plantable
      ? [{ id: "planting", label: "Как се засажда" } as const]
      : []),
    { id: "specs", label: "Характеристики" },
    { id: "shipping", label: "Доставка и плащане" },
  ] as const;

  type TabId = (typeof tabs)[number]["id"];
  const [activeTab, setActiveTab] = useState<TabId>("description");

  return (
    <div className="mt-8 border-t border-paper-border pt-8">
      <div className="flex flex-wrap gap-1 border-b border-paper-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-paper-green text-paper-green"
                : "text-paper-muted hover:text-paper-heading",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="py-6 text-sm leading-relaxed text-paper-text">
        {activeTab === "description" && (
          <div>
            {product.description ? (
              <p className="whitespace-pre-line">{product.description}</p>
            ) : (
              <p>
                Продукт от ръчно изработена семенна хартия, създаден с грижа в
                нашата работилница в София.
              </p>
            )}
          </div>
        )}

        {activeTab === "planting" && product.plantable && (
          <div>
            <p className="mb-4">
              Семенната хартия е лесна за засаждане. Следвайте тези стъпки:
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              {plantingInstructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {activeTab === "specs" && (
          <ul className="space-y-2">
            <li>
              <strong>Материал:</strong> Рециклирана семенна хартия
            </li>
            <li>
              <strong>Семена:</strong> Натурални семена на цветя или билки
              (съставът може да варира според сезона)
            </li>
            <li>
              <strong>Изработка:</strong> Ръчна, в София, България
            </li>
            <li>
              <strong>Еко:</strong> Без пластмаса, биоразградима
              {product.plantable ? ", може да се засади" : ""}
            </li>
            {product.variants && product.variants.length > 0 && (
              <li>
                <strong>Налични размери:</strong>{" "}
                {product.variants
                  .filter((v) => v.enabled)
                  .map((v) => v.name)
                  .join(", ")}
              </li>
            )}
          </ul>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-paper-heading">Доставка</h4>
              <p className="mt-1">
                Доставяме в цяла България чрез Speedy — до офис, автомат или
                адрес. Цената се изчислява автоматично при поръчка. Ориентировъчен
                срок след изпращане: 1–3 работни дни. Изработка: обикновено 3–7
                работни дни.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-paper-heading">Плащане</h4>
              <p className="mt-1">
                Онлайн с карта, наложен платеж или банков превод.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-paper-heading">Повече информация</h4>
              <p className="mt-1">
                Вижте страницата{" "}
                <a
                  href="/dostavka-i-plashtane"
                  className="text-paper-green underline"
                >
                  Доставка и плащане
                </a>
                .
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-paper-heading">Връщане</h4>
              <p className="mt-1">
                Поради индивидуалния характер на продуктите, връщане не се
                приема, освен при дефект. Свържете се с нас при проблем.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
