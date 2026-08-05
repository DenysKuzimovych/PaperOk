"use client";

import Link from "next/link";
import clsx from "clsx";
import type { CategoryNode } from "lib/category-tree";
import { MAIN_MENU_SECTIONS } from "lib/constants";

function CategoryTreeItem({
  node,
  currentHandle,
  depth = 0,
}: {
  node: CategoryNode;
  currentHandle?: string;
  depth?: number;
}) {
  const isActive = currentHandle === node.handle;
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <Link
        href={`/products?collection=${node.handle}`}
        className={clsx(
          "block rounded-lg px-2 py-1.5 text-xs leading-snug transition-colors sm:px-3 sm:py-2 sm:text-sm",
          isActive
            ? "bg-paper-green font-medium text-white"
            : "text-paper-heading hover:bg-paper-section",
        )}
        style={{ paddingLeft: `${8 + depth * 10}px` }}
      >
        {node.title}
      </Link>
      {hasChildren && (
        <ul className="mt-0.5 space-y-0.5 sm:mt-1 sm:space-y-1">
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              currentHandle={currentHandle}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CategoryTreeSidebar({
  tree,
  currentHandle,
}: {
  tree: CategoryNode[];
  currentHandle?: string;
}) {
  const mainHandles = new Set<string>(MAIN_MENU_SECTIONS.map((s) => s.handle));

  const containsHandle = (node: CategoryNode, handle: string): boolean => {
    if (node.handle === handle) return true;
    return node.children.some((child) => containsHandle(child, handle));
  };

  // When user opens "Картички" / "Подаръци" / "Семенна хартия" (or any of their descendants),
  // show only that root section subtree in the sidebar to keep the structure clear.
  const rootForCurrent = currentHandle
    ? tree.find((root) => containsHandle(root, currentHandle))
    : null;

  // When browsing "all products", show only the 3 big root categories.
  // Subcategories still appear under their respective root thanks to rootForCurrent.
  const displayTree = rootForCurrent
    ? [rootForCurrent]
    : tree.filter((node) => mainHandles.has(node.handle));

  return (
    <nav aria-label="Категории">
      <ul className="space-y-1">
        <li>
          <Link
            href="/products"
            className={clsx(
              "block rounded-lg px-2 py-1.5 text-xs leading-snug transition-colors sm:px-3 sm:py-2 sm:text-sm",
              !currentHandle
                ? "bg-paper-green font-medium text-white"
                : "text-paper-heading hover:bg-paper-section",
            )}
          >
            Всички продукти
          </Link>
        </li>
        {displayTree.map((node) => (
          <CategoryTreeItem
            key={node.id}
            node={node}
            currentHandle={currentHandle}
          />
        ))}
      </ul>
    </nav>
  );
}
