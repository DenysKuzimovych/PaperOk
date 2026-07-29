import Link from "next/link";
import type { FlatCategory } from "lib/category-tree";

export function Breadcrumb({ path }: { path: FlatCategory[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-paper-muted">
        <li>
          <Link
            href="/"
            className="hover:text-paper-green"
          >
            Начало
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            href="/products"
            className="hover:text-paper-green"
          >
            Продукти
          </Link>
        </li>
        {path.map((cat, index) => (
          <li key={cat.id} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {index === path.length - 1 ? (
              <span className="font-medium text-paper-heading">
                {cat.title}
              </span>
            ) : (
              <Link
                href={`/products?collection=${cat.handle}`}
                className="hover:text-paper-green"
              >
                {cat.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
