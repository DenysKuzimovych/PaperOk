"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="absolute top-0 left-0 z-40 flex items-center gap-2 px-4 py-2 bg-paper-white/80 backdrop-blur-sm rounded-br-lg shadow-lg hover:bg-paper-white transition-all duration-200 border-r border-b border-paper-border hover:shadow-xl group"
      aria-label="Върни се назад"
      title="Върни се назад"
    >
      <ArrowLeftIcon className="h-5 w-5 text-paper-heading group-hover:text-paper-heading transition-colors" />
      <span className="text-sm font-medium text-paper-heading group-hover:text-paper-heading transition-colors">
        назад
      </span>
    </button>
  );
}
