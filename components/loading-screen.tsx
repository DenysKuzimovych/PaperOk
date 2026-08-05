import Image from "next/image";
import { PaperTexture } from "components/ui/paper-texture";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import {
  LOGO_TRANSPARENT,
  LOGO_TRANSPARENT_SIZE,
  SITE_NAME,
} from "lib/constants";

/**
 * Soft cream loading screen with seed-paper texture and PaperOK logo.
 * Used by route `loading.tsx` files during navigation.
 */
export default function LoadingScreen() {
  return (
    <div
      className="relative flex min-h-[calc(100dvh-5.5rem)] w-full flex-col items-center justify-center overflow-hidden bg-paper-bg px-6"
      role="status"
      aria-live="polite"
      aria-label="Зареждане"
    >
      <PaperTexture
        src={PAPER_BACKGROUNDS.petals}
        overlay={PAPER_OVERLAYS.cream}
        sizes="100vw"
        quality={85}
        priority
      />
      <div className="relative z-10 flex flex-col items-center">
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
    </div>
  );
}
