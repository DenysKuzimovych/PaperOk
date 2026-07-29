export type CategoryNode = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  position: number;
  parent_id: string | null;
  children: CategoryNode[];
};

export type FlatCategory = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  position: number;
  parent_id: string | null;
};

export function buildCategoryTree(categories: FlatCategory[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.position - b.position || a.title.localeCompare(b.title, "bg"));
    nodes.forEach((n) => sortNodes(n.children));
  };

  sortNodes(roots);
  return roots;
}

/** Flatten tree for select dropdown with indentation */
export function flattenCategoryTree(
  nodes: CategoryNode[],
  depth = 0,
): Array<{ id: string; handle: string; title: string; depth: number }> {
  const result: Array<{ id: string; handle: string; title: string; depth: number }> = [];
  for (const node of nodes) {
    result.push({ id: node.id, handle: node.handle, title: node.title, depth });
    result.push(...flattenCategoryTree(node.children, depth + 1));
  }
  return result;
}

/** Get breadcrumb path from root to the category with given handle */
export function getBreadcrumbPath(
  categories: FlatCategory[],
  handle: string,
): FlatCategory[] {
  const map = new Map(categories.map((c) => [c.id, c]));
  const current = categories.find((c) => c.handle === handle);
  if (!current) return [];

  const path: FlatCategory[] = [];
  let node: FlatCategory | undefined = current;
  while (node) {
    path.unshift(node);
    node = node.parent_id ? map.get(node.parent_id) : undefined;
  }
  return path;
}

export function getDescendantHandles(node: CategoryNode): string[] {
  const handles = [node.handle];
  for (const child of node.children) {
    handles.push(...getDescendantHandles(child));
  }
  return handles;
}

/**
 * Keep only categories that have available products on themselves
 * or anywhere in their descendant subtree. Empty leaf/branch categories
 * are removed from the customer-facing tree.
 */
export function filterCategoriesWithProducts(
  categories: FlatCategory[],
  handlesWithProducts: Set<string>,
): FlatCategory[] {
  if (handlesWithProducts.size === 0) return [];

  const tree = buildCategoryTree(categories);

  function nodeHasProducts(node: CategoryNode): boolean {
    if (handlesWithProducts.has(node.handle)) return true;
    return node.children.some(nodeHasProducts);
  }

  function collectVisible(nodes: CategoryNode[]): FlatCategory[] {
    const result: FlatCategory[] = [];
    for (const node of nodes) {
      if (!nodeHasProducts(node)) continue;
      const visibleChildren = collectVisible(node.children);
      result.push({
        id: node.id,
        handle: node.handle,
        title: node.title,
        description: node.description,
        position: node.position,
        parent_id: node.parent_id,
      });
      result.push(...visibleChildren);
    }
    return result;
  }

  return collectVisible(tree);
}
