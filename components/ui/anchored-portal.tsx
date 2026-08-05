"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

type AnchorRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

function readRect(el: HTMLElement | null): AnchorRect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  };
}

/**
 * Renders children in a portal, fixed under an anchor element,
 * so panels sit above footer / page stacking contexts.
 */
export function AnchoredPortal({
  open,
  anchorRef,
  panelRef,
  align = "left",
  minWidth,
  maxWidth = 360,
  className,
  children,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  panelRef?: RefObject<HTMLDivElement | null>;
  align?: "left" | "right";
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const rect = readRect(anchorRef.current);
    if (!rect) return;

    const gap = 8;
    const viewportPad = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const width = Math.min(
      Math.max(minWidth ?? rect.width, rect.width),
      maxWidth,
      vw - viewportPad * 2,
    );

    let left = align === "right" ? rect.right - width : rect.left;
    left = Math.max(viewportPad, Math.min(left, vw - width - viewportPad));

    const spaceBelow = vh - rect.bottom - gap - viewportPad;
    const spaceAbove = rect.top - gap - viewportPad;
    const preferBelow = spaceBelow >= 180 || spaceBelow >= spaceAbove;

    const maxHeight = Math.max(160, preferBelow ? spaceBelow : spaceAbove);

    setStyle({
      position: "fixed",
      top: preferBelow ? rect.bottom + gap : undefined,
      bottom: preferBelow ? undefined : vh - rect.top + gap,
      left,
      width,
      maxHeight,
      zIndex: 200,
      overflowY: "auto",
    });
  }, [align, anchorRef, maxWidth, minWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const onScrollOrResize = () => updatePosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, updatePosition]);

  if (!mounted || !open) return null;

  return createPortal(
    <div ref={panelRef} className={className} style={style} data-anchored-portal="">
      {children}
    </div>,
    document.body,
  );
}
