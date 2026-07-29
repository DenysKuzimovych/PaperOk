import Image from "next/image";
import {
  LOGO_TRANSPARENT,
  LOGO_TRANSPARENT_SIZE,
  SITE_NAME,
} from "lib/constants";

/**
 * Prefer SiteLogo for new UI. Kept for leftover imports.
 */
export default function LogoIcon({
  className,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  fill?: string;
}) {
  return (
    <Image
      src={LOGO_TRANSPARENT}
      alt={`${SITE_NAME} logo`}
      width={LOGO_TRANSPARENT_SIZE.width}
      height={LOGO_TRANSPARENT_SIZE.height}
      className={className || "h-4 w-auto"}
    />
  );
}
