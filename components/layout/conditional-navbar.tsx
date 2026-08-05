"use client";

import { usePathname } from "next/navigation";
import { NavbarClient } from "./navbar-client";

/** Hide storefront navbar on /admin routes. */
export function ConditionalNavbar() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <NavbarClient />;
}
