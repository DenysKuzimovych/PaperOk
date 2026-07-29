"use client";

import Link from "next/link";
import clsx from "clsx";
import type { CategoryNode } from "lib/category-tree";

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
          "block rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-paper-green font-medium text-white"
            : "text-paper-heading hover:bg-paper-section",
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {node.title}
      </Link>
      {hasChildren && (
        <ul className="mt-1 space-y-1">
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
  return (
    <nav aria-label="Категории">
      <ul className="space-y-1">
        <li>
          <Link
            href="/products"
            className={clsx(
              "block rounded-lg px-3 py-2 text-sm transition-colors",
              !currentHandle
                ? "bg-paper-green font-medium text-white"
                : "text-paper-heading hover:bg-paper-section",
            )}
          >
            Всички продукти
          </Link>
        </li>
        {tree.map((node) => (
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
