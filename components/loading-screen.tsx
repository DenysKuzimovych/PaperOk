import Image from "next/image";
import {
  LOGO_TRANSPARENT,
  LOGO_TRANSPARENT_SIZE,
  SITE_NAME,
} from "lib/constants";

/**
 * Soft cream loading screen with large PaperOK logo.
 * Used by route `loading.tsx` files during navigation.
 */
export default function LoadingScreen() {
  return (
    <div
      className="flex min-h-[calc(100dvh-5.5rem)] w-full flex-col items-center justify-center bg-paper-bg px-6"
      role="status"
      aria-live="polite"
      aria-label="Зареждане"
    >
      <Image
        src={LOGO_TRANSPARENT}
        alt={SITE_NAME}
        width={LOGO_TRANSPARENT_SIZE.width}
        height={LOGO_TRANSPARENT_SIZE.height}
        priority
        className="h-auto w-full max-w-[280px] animate-pulse object-contain sm:max-w-[360px] md:max-w-[420px]"
      />
      <span className="sr-only">Зареждане…</span>
    </div>
  );
}
