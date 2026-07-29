"use client";

import CartModal from "components/cart/modal";
import { FIXED_MENU } from "lib/constants";
import type { FlatCategory } from "lib/category-tree";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import MobileMenu from "./navbar/mobile-menu";
import Search, { SearchSkeleton } from "./navbar/search";
import { SiteLogo } from "components/site-logo";

function NavLink({ href, title }: { href: string; title: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  let isActive = false;
  if (href === "/") {
    isActive = pathname === "/";
  } else if (href.includes("collection=")) {
    const wanted = new URLSearchParams(href.split("?")[1] || "").get(
      "collection",
    );
    isActive =
      pathname === "/products" &&
      searchParams.get("collection") === wanted;
  } else {
    isActive = pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Link
      href={href}
      prefetch={true}
      className={`whitespace-nowrap text-[13px] tracking-wide transition-colors xl:text-sm ${
        isActive
          ? "font-medium text-paper-green"
          : "text-paper-text hover:text-paper-green"
      }`}
    >
      {title}
    </Link>
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

function DesktopNav() {
  return (
    <ul className="absolute left-1/2 hidden max-w-[min(100%,54rem)] -translate-x-1/2 items-center gap-4 pb-3.5 lg:flex xl:gap-6">
      {FIXED_MENU.map((item) => (
        <li key={item.path}>
          <NavLink href={item.path} title={item.title} />
        </li>
      ))}
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
    <header className="sticky top-0 z-40 overflow-visible border-b border-paper-border/50 bg-paper-bg/90 backdrop-blur-md">
      <nav className="relative mx-auto flex max-w-7xl items-end justify-between gap-3 px-4 pt-3 pb-0 sm:px-6 lg:px-8">
        <Link
          href="/"
          prefetch={true}
          className="flex shrink-0 items-end self-end"
          aria-label="PaperOK — начална страница"
        >
          <SiteLogo
            priority
            responsive
            className="h-12 w-auto sm:h-16 md:h-[4.75rem] lg:h-20"
          />
        </Link>

        <Suspense fallback={null}>
          <DesktopNav />
        </Suspense>

        <div className="flex items-center gap-1 pb-3 sm:gap-2">
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
              <MobileMenu
                menu={[...FIXED_MENU]}
                categories={categories}
              />
            </Suspense>
          </div>
        </div>
      </nav>
    </header>
  );
}
