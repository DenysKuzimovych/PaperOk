import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import { getStorefrontCollections } from "lib/supabase/products";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";
import { SITE_NAME } from "lib/constants";

export async function Navbar() {
  const collections = await getStorefrontCollections();
  const menu = collections.map(c => ({ title: c.title, path: `/search/${c.handle}` }));

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
            aria-label={SITE_NAME}
          >
            <LogoSquare />
          </Link>
          <ul className="hidden gap-6 text-sm md:flex md:items-center">
            <li>
              <Link
                href="/products"
                prefetch={true}
                className="text-paper-muted underline-offset-4 hover:text-paper-heading hover:underline"
              >
                Продукти
              </Link>
            </li>
            {menu.length ? (
              menu.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="text-paper-muted underline-offset-4 hover:text-paper-heading hover:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))
            ) : null}
            <li>
              <Link
                href="/contact"
                prefetch={true}
                className="text-paper-muted underline-offset-4 hover:text-paper-heading hover:underline"
              >
                Контакти
              </Link>
            </li>
          </ul>
        </div>
        <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>
        <div className="flex justify-end md:w-1/3">
          <CartModal />
        </div>
      </div>
    </nav>
  );
}
