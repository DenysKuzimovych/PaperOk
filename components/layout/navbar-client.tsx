"use client";

import CartModal from "components/cart/modal";
import { PaperTexture } from "components/ui/paper-texture";
import { SiteLogo } from "components/site-logo";
import {
  buildCategoryTree,
  type CategoryNode,
  type FlatCategory,
} from "lib/category-tree";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import { FIXED_MENU, MAIN_MENU_SECTIONS } from "lib/constants";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import MobileMenu from "./navbar/mobile-menu";
import Search, { SearchSkeleton } from "./navbar/search";

function collectionFromPath(path: string): string | null {
  if (!path.includes("collection=")) return null;
  return new URLSearchParams(path.split("?")[1] || "").get("collection");
}

function isNavActive(
  href: string,
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  if (href === "/") return pathname === "/";
  const wanted = collectionFromPath(href);
  if (wanted) {
    return (
      pathname === "/products" && searchParams.get("collection") === wanted
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-paper-green transition-all duration-300 ${
        active
          ? "scale-x-100 opacity-100"
          : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60"
      }`}
    />
  );
}

function NavLink({ href, title }: { href: string; title: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = isNavActive(href, pathname, searchParams);

  return (
    <Link
      href={href}
      prefetch={true}
      className={`relative whitespace-nowrap pb-1 text-[15px] font-medium tracking-[0.02em] transition-colors xl:text-base ${
        isActive
          ? "text-paper-green"
          : "text-paper-heading/80 hover:text-paper-green"
      }`}
    >
      {title}
      <NavUnderline active={isActive} />
    </Link>
  );
}

function DropdownTreeNode({
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
  const pad = 10 + depth * 12;

  if (!hasChildren) {
    return (
      <Link
        href={`/products?collection=${node.handle}`}
        onClick={onNavigate}
        className="block rounded-xl py-2 pr-3 text-sm text-paper-text transition-colors hover:bg-paper-accent-bg/80 hover:text-paper-green"
        style={{ paddingLeft: `${pad}px` }}
      >
        {node.title}
      </Link>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-0.5 rounded-xl transition-colors hover:bg-paper-accent-bg/80"
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
          href={`/products?collection=${node.handle}`}
          onClick={onNavigate}
          className="shrink-0 px-2 py-2 text-[11px] text-paper-muted hover:text-paper-green"
          title={`Всички в ${node.title}`}
        >
          всички
        </Link>
      </div>
      {expanded && (
        <div className="ml-3 border-l border-paper-border/80">
          {node.children.map((child) => (
            <DropdownTreeNode
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

function CategoryNavItem({
  title,
  href,
  rootHandle,
  categories,
}: {
  title: string;
  href: string;
  rootHandle: string;
  categories: FlatCategory[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = isNavActive(href, pathname, searchParams);

  const tree = buildCategoryTree(categories);
  const root = tree.find((n) => n.handle === rootHandle);
  const children = root?.children ?? [];
  const hasTree = children.length > 0;

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

  if (!hasTree) {
    return (
      <li className="group">
        <NavLink href={href} title={title} />
      </li>
    );
  }

  return (
    <li
      ref={ref}
      className="group relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-0.5">
        <Link
          href={href}
          prefetch={true}
          className={`relative whitespace-nowrap pb-1 text-[15px] font-medium tracking-[0.02em] transition-colors xl:text-base ${
            isActive || open
              ? "text-paper-green"
              : "text-paper-heading/80 hover:text-paper-green"
          }`}
        >
          {title}
          <NavUnderline active={isActive || open} />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={`${title} — подкатегории`}
          onClick={() => setOpen((v) => !v)}
          className={`pb-1 transition-colors ${
            isActive || open
              ? "text-paper-green"
              : "text-paper-heading/60 hover:text-paper-green"
          }`}
        >
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="absolute left-1/2 top-full z-50 pt-2.5 -translate-x-1/2">
          <div className="paper-dropdown-panel max-h-[70vh] w-72 overflow-y-auto p-3.5">
            <Link
              href={href}
              onClick={() => setOpen(false)}
              className="mb-2.5 block rounded-xl border border-paper-green/15 bg-paper-accent-bg/80 px-3.5 py-2.5 text-sm font-medium text-paper-heading transition-colors hover:border-paper-green/30 hover:bg-paper-accent-bg hover:text-paper-green"
            >
              Всички в {title}
            </Link>
            <p className="mb-2 px-1.5 font-heading text-[11px] tracking-wider text-paper-muted uppercase">
              Категории
            </p>
            {children.map((child) => (
              <DropdownTreeNode
                key={child.id}
                node={child}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

function SearchToggle() {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="absolute inset-x-0 top-full z-50 border-b border-paper-border bg-paper-bg px-4 py-3 shadow-sm lg:static lg:inset-auto lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <Suspense fallback={<SearchSkeleton />}>
          <Search onClose={() => setOpen(false)} compact />
        </Suspense>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Търсене"
      className="flex h-10 w-10 items-center justify-center rounded-full text-paper-text transition-colors hover:bg-paper-section hover:text-paper-green"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </button>
  );
}

function DesktopNav({ categories }: { categories: FlatCategory[] }) {
  const sectionByHandle = new Map(MAIN_MENU_SECTIONS.map((s) => [s.handle, s]));

  return (
    <ul className="ml-3 hidden min-w-0 flex-1 items-start justify-start gap-5 overflow-visible pt-6 pl-2 lg:flex xl:ml-5 xl:gap-7 xl:pl-3 lg:pt-7">
      {FIXED_MENU.map((item) => {
        const handle = collectionFromPath(item.path);
        const section = handle
          ? sectionByHandle.get(
              handle as (typeof MAIN_MENU_SECTIONS)[number]["handle"],
            )
          : null;

        if (section) {
          return (
            <CategoryNavItem
              key={item.path}
              title={item.title}
              href={item.path}
              rootHandle={section.handle}
              categories={categories}
            />
          );
        }

        return (
          <li key={item.path} className="group">
            <NavLink href={item.path} title={item.title} />
          </li>
        );
      })}
    </ul>
  );
}

export function NavbarClient() {
  const [categories, setCategories] = useState<FlatCategory[]>([]);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setCategories(
          data.map((c: any) => ({
            id: c.id,
            handle: c.handle,
            title: c.title,
            description: c.description,
            position: c.position ?? 0,
            parent_id: c.parentId ?? c.parent_id ?? null,
          })),
        );
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <header className="sticky top-0 z-40 overflow-visible border-b border-paper-border/50">
      <div className="absolute inset-0 overflow-hidden">
        <PaperTexture
          src={PAPER_BACKGROUNDS.fibers}
          overlay="rgba(236, 220, 196, 0.52)"
          sizes="100vw"
          quality={88}
          priority
          imageClassName="object-cover object-[center_45%] scale-110"
        />
        <div className="absolute inset-0 bg-[#E8D5B8]/30" />
      </div>
      <nav className="relative z-10 mx-auto flex max-w-7xl items-start justify-between gap-3 px-4 pt-3 pb-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          prefetch={true}
          className="flex shrink-0 items-start self-start"
          aria-label="PaperOK — начална страница"
        >
          <SiteLogo
            priority
            responsive
            className="h-12 w-auto sm:h-16 md:h-[4.75rem] lg:h-20"
          />
        </Link>

        <Suspense fallback={null}>
          <DesktopNav categories={categories} />
        </Suspense>

        <div className="flex shrink-0 items-center gap-1 pt-5 sm:gap-2 lg:pt-[1.35rem]">
          <div className="hidden md:block">
            <Suspense fallback={<SearchSkeleton compact />}>
              <Search compact />
            </Suspense>
          </div>
          <div className="md:hidden">
            <SearchToggle />
          </div>
          <CartModal />
          <div className="lg:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={[...FIXED_MENU]} />
            </Suspense>
          </div>
        </div>
      </nav>
    </header>
  );
}
