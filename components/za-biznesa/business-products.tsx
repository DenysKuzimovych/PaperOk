import {
  BookmarkIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CubeIcon,
  EnvelopeIcon,
  HeartIcon,
  IdentificationIcon,
  MegaphoneIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const products: { title: string; icon: IconComponent }[] = [
  { title: "Рекламни картички", icon: MegaphoneIcon },
  { title: "Благодарствени картички", icon: HeartIcon },
  { title: "Визитки", icon: IdentificationIcon },
  { title: "Покани", icon: EnvelopeIcon },
  { title: "Етикети", icon: TagIcon },
  { title: "Hang tags", icon: BookmarkIcon },
  { title: "Бележници", icon: BookOpenIcon },
  { title: "Календари", icon: CalendarDaysIcon },
  { title: "Комплекти", icon: CubeIcon },
];

function ProductIcon({ icon: Icon }: { icon: IconComponent }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-paper-green/20 bg-paper-accent-bg/60">
      <Icon className="h-5 w-5 text-paper-green" strokeWidth={1.5} aria-hidden />
    </div>
  );
}

export function BusinessProducts() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading mb-10 text-center text-3xl font-bold text-paper-heading">
          Какво изработваме
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.title}
              className="group flex items-center gap-4 rounded-xl border border-paper-border bg-paper-white p-5 transition-colors hover:border-paper-green/30 hover:bg-paper-accent-bg/20"
            >
              <ProductIcon icon={product.icon} />
              <span className="font-medium text-paper-heading">{product.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
