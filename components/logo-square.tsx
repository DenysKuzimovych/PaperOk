import clsx from "clsx";
import { SiteLogo } from "./site-logo";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  return (
    <div
      className={clsx("flex flex-none items-center justify-center", {
        "h-10": !size,
        "h-8": size === "sm",
      })}
    >
      <SiteLogo height={size === "sm" ? 28 : 36} priority />
    </div>
  );
}
