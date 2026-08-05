"use client";

import Link from "next/link";
import type { CategoryNode } from "lib/category-tree";
import { DeleteCollectionButton } from "./delete-collection-button";

function CategoryTreeRow({
  node,
  depth,
  mainMenuTitle,
}: {
  node: CategoryNode;
  depth: number;
  mainMenuTitle: string;
}) {
  const indent = depth * 24;

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
        <td className="px-6 py-4">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${indent}px` }}
          >
            {depth > 0 && (
              <span className="text-gray-400 dark:text-gray-500">└</span>
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {node.title}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {node.handle}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {depth === 0 ? (
            <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
              Главно меню
            </span>
          ) : (
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {mainMenuTitle}
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white font-medium">
            {node.position}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex gap-2">
            <Link
              href={`/admin/collections/${node.id}`}
              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
            >
              Редактирай
            </Link>
            <DeleteCollectionButton
              collectionId={node.id}
              collectionTitle={node.title}
            />
          </div>
        </td>
      </tr>
      {node.children.map((child) => (
        <CategoryTreeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          mainMenuTitle={mainMenuTitle}
        />
      ))}
    </>
  );
}

export function CategoryTreeTable({ tree }: { tree: CategoryNode[] }) {
  if (tree.length === 0) {
    return (
      <tr>
        <td
          colSpan={5}
          className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
        >
          Няма категории. Създай първата категория!
        </td>
      </tr>
    );
  }

  return (
    <>
      {tree.map((node) => (
        <CategoryTreeRow
          key={node.id}
          node={node}
          depth={0}
          mainMenuTitle={node.title}
        />
      ))}
    </>
  );
}
