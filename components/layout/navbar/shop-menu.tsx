"use client";

import {
  buildCategoryTree,
  type CategoryNode,
  type FlatCategory,
} from "lib/category-tree";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function categoryHref(handle: string) {
  return `/products?collection=${handle}`;
}

/** Expandable category node — leaf = link, parent = expand + optional "виж всички" */
function ExpandableCategory({
  node,
  depth = 0,
  onNavigate,
}: {
  node: CategoryNode;
  depth?: number;
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  const pad = 12 + depth * 12;

  if (!hasChildren) {
    return (
      <Link
        href={categoryHref(node.handle)}
        onClick={onNavigate}
        className="block rounded-lg py-2 pr-3 text-sm text-paper-text transition-colors hover:bg-paper-section hover:text-paper-green"
        style={{ paddingLeft: `${pad}px` }}
      >
        {node.title}
      </Link>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-0.5 rounded-lg transition-colors hover:bg-paper-section"
        style={{ paddingLeft: `${pad}px` }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-1.5 py-2 pr-1 text-left text-sm text-paper-text hover:text-paper-green"
        >
          <ChevronRightIcon
            className={`h-3.5 w-3.5 shrink-0 text-paper-muted transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
          <span className="truncate font-medium">{node.title}</span>
        </button>
        <Link
          href={categoryHref(node.handle)}
          onClick={onNavigate}
          className="shrink-0 px-2 py-2 text-[11px] text-paper-muted hover:text-paper-green"
          title={`Всички в ${node.title}`}
        >
          всички
        </Link>
      </div>

      {expanded && (
        <div className="border-l border-paper-border/80 ml-3">
          {node.children.map((child) => (
            <ExpandableCategory
              key={child.id}
              node={child}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryTreeExpandable({
  nodes,
  onNavigate,
}: {
  nodes: CategoryNode[];
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <ExpandableCategory
          key={node.id}
          node={node}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

/** Desktop: Магазин → expandable category tree (no products) */
export function ShopDropdown({
  categories,
}: {
  categories: FlatCategory[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tree = buildCategoryTree(categories);
  const isShopActive =
    pathname === "/products" || pathname.startsWith("/product/");

  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 whitespace-nowrap text-sm transition-colors ${
          isShopActive || open
            ? "font-medium text-paper-green"
            : "text-paper-text hover:text-paper-green"
        }`}
      >
        Магазин
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 pt-2 -translate-x-1/2">
          <div className="max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-paper-border bg-paper-bg p-3 shadow-[var(--paper-shadow-lg)]">
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="mb-2 block rounded-lg bg-paper-accent-bg px-3 py-2.5 text-sm font-medium text-paper-heading transition-colors hover:bg-paper-section"
            >
              Всички продукти
            </Link>
            <p className="mb-1.5 px-1 text-[11px] uppercase tracking-wider text-paper-muted">
              Категории
            </p>
            {tree.length === 0 ? (
              <p className="px-3 py-2 text-sm text-paper-muted">
                Няма категории
              </p>
            ) : (
              <CategoryTreeExpandable
                nodes={tree}
                onNavigate={() => setOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Mobile: same expandable tree under Магазин */
export function ShopAccordion({
  categories,
  onNavigate,
}: {
  categories: FlatCategory[];
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const tree = buildCategoryTree(categories);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-base text-paper-text transition-colors hover:bg-paper-section hover:text-paper-green"
      >
        <span>Магазин</span>
        <ChevronRightIcon
          className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="mb-1 ml-2 border-l border-paper-border pl-1">
          <Link
            href="/products"
            onClick={onNavigate}
            className="mb-1 block rounded-lg px-3 py-2 text-sm font-medium text-paper-green"
          >
            Всички продукти
          </Link>
          <CategoryTreeExpandable nodes={tree} onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
}
