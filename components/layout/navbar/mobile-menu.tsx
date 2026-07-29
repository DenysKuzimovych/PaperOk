"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { FIXED_MENU, type MenuItem } from "lib/constants";
import type { FlatCategory } from "lib/category-tree";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, Suspense, useEffect, useState } from "react";
import Search, { SearchSkeleton } from "./search";
import { ShopAccordion } from "./shop-menu";
import { SiteLogo } from "components/site-logo";

export default function MobileMenu({
  menu = [...FIXED_MENU],
  categories = [],
}: {
  menu?: MenuItem[];
  categories?: FlatCategory[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      <button
        type="button"
        onClick={openMobileMenu}
        aria-label="Отвори меню"
        className="flex h-10 w-10 items-center justify-center rounded-full text-paper-text transition-colors hover:bg-paper-section hover:text-paper-green lg:hidden"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-paper-heading/25" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-transform ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 right-0 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-paper-bg shadow-xl">
              <div className="p-5">
                <div className="mb-6 flex items-center justify-between">
                  <SiteLogo height={36} />
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-paper-text transition-colors hover:bg-paper-section"
                    onClick={closeMobileMenu}
                    aria-label="Затвори меню"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 w-full">
                  <Suspense fallback={<SearchSkeleton compact />}>
                    <Search compact />
                  </Suspense>
                </div>

                <ul className="flex w-full flex-col gap-0.5">
                  {menu.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        prefetch={true}
                        onClick={closeMobileMenu}
                        className="block rounded-xl px-3 py-3 text-base text-paper-text transition-colors hover:bg-paper-section hover:text-paper-green"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>

                {categories.length > 0 && (
                  <div className="mt-6 border-t border-paper-border pt-4">
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-paper-muted">
                      Категории
                    </p>
                    <ShopAccordion
                      categories={categories}
                      onNavigate={closeMobileMenu}
                    />
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
