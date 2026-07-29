import Image from "next/image";
import {
  LOGO_TRANSPARENT,
  LOGO_TRANSPARENT_SIZE,
  SITE_NAME,
} from "lib/constants";
import clsx from "clsx";

type SiteLogoProps = {
  /** Visual height in px (width scales from logo aspect ratio) */
  height?: number;
  className?: string;
  priority?: boolean;
  /** When true, height comes from className only (no inline size) */
  responsive?: boolean;
};

/**
 * Transparent PaperOK logo for on-site UI (nav, footer, etc.).
 */
export function SiteLogo({
  height = 40,
  className,
  priority = false,
  responsive = false,
}: SiteLogoProps) {
  const width = Math.round(
    (height * LOGO_TRANSPARENT_SIZE.width) / LOGO_TRANSPARENT_SIZE.height,
  );

  return (
    <Image
      src={LOGO_TRANSPARENT}
      alt={SITE_NAME}
      width={responsive ? LOGO_TRANSPARENT_SIZE.width : width}
      height={responsive ? LOGO_TRANSPARENT_SIZE.height : height}
      priority={priority}
      className={clsx("object-contain", className)}
      style={responsive ? undefined : { height, width: "auto" }}
    />
  );
}
