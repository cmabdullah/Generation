import type { Person } from '../models/Person';
import type { TreeNode } from '../models/TreeNode';
import { LAYOUT_CONSTANTS, NODE_DIMENSIONS } from '../constants/dimensions';
import type { CachedPosition } from '../stores/positionCacheStore';

/**
 * Tree layout algorithm using a simplified Reingold-Tilford approach
 * Calculates positions for all nodes in the tree
 *
 * Position Cache Strategy:
 * - Nodes with cached positions use their cached values (whiteboard behavior)
 * - Only uncached nodes are calculated using the layout algorithm
 * - This prevents unexpected shifts when tree is reloaded
 */

export interface LayoutOptions {
  useCache?: boolean;
  saveCache?: boolean;
  getCachedPosition?: (id: string) => CachedPosition | null;
  setCachedPosition?: (id: string, x: number, y: number, source: 'auto' | 'manual') => void;
}

export function calculateTreeLayout(
  root: Person,
  options: LayoutOptions = {}
): TreeNode[] {
  const {
    useCache = true,
    saveCache = true,
    getCachedPosition,
    setCachedPosition,
  } = options;

  const nodes: TreeNode[] = [];
  const { horizontalSpacing, verticalSpacing } = LAYOUT_CONSTANTS;

  function traverse(
    person: Person,
    depth: number,
    leftBound: number,
    parentIsManual: boolean = false
  ): { node: TreeNode; width: number } {
    let x: number;
    let y: number;
    let source: 'auto' | 'manual' = 'auto';

    // Priority 1: Check cache (if enabled)
    const cachedPos = useCache && getCachedPosition ? getCachedPosition(person.id) : null;

    if (cachedPos) {
      // Use cached position - this is the key to whiteboard behavior!
      x = cachedPos.x;
      y = cachedPos.y;
      source = cachedPos.source;
    } else {
      // Priority 2: Check if person has manually set position (from backend)
      const hasManualPosition =
        (person.positionX !== undefined && person.positionX !== null) ||
        (person.positionY !== undefined && person.positionY !== null);

      if (hasManualPosition) {
        // Use backend position
        x = person.positionX ?? leftBound;
        y = person.positionY ?? depth * verticalSpacing;
        source = 'manual';
      } else {
        // Priority 3: Calculate position using layout algorithm
        const childResults = person.childs.map((child, index) => {
          const childLeftBound = leftBound + (index * horizontalSpacing);
          return traverse(child, depth + 1, childLeftBound, hasManualPosition);
        });

        if (parentIsManual) {
          // Parent is manual, use offset
          x = person.positionX ?? leftBound;
          y = person.positionY ?? depth * verticalSpacing;
        } else if (childResults.length > 0) {
          // Auto-center over children
          const firstChildX = childResults[0].node.x;
          const lastChildX = childResults[childResults.length - 1].node.x;
          x = (firstChildX + lastChildX) / 2;
          y = depth * verticalSpacing;
        } else {
          // Leaf node
          x = leftBound;
          y = depth * verticalSpacing;
        }
        source = 'auto';
      }
    }

    // Save to cache if enabled and position was calculated (not from cache)
    if (saveCache && !cachedPos && setCachedPosition) {
      setCachedPosition(person.id, x, y, source);
    }

    const node: TreeNode = {
      ...person,
      x,
      y,
      width: NODE_DIMENSIONS.width,
      height: NODE_DIMENSIONS.height,
    };

    nodes.push(node);

    // Calculate total width
    const totalWidth = person.childs.length > 0
      ? person.childs.reduce((sum, child, index) => {
          const childLeftBound = leftBound + (index * horizontalSpacing);
          const result = traverse(child, depth + 1, childLeftBound, !!cachedPos || (person.positionX !== undefined && person.positionX !== null));
          return sum + result.width;
        }, 0)
      : NODE_DIMENSIONS.width + horizontalSpacing;

    return { node, width: totalWidth };
  }

  traverse(root, 0, 0);
  return nodes;
}

/**
 * Calculate layout without cache (force recalculation)
 */
export function calculateTreeLayoutFresh(root: Person): TreeNode[] {
  return calculateTreeLayout(root, { useCache: false, saveCache: false });
}

/**
 * Flatten tree structure to array of all persons
 */
export function flattenTree(root: Person): Person[] {
  const result: Person[] = [];

  function traverse(person: Person) {
    result.push(person);
    person.childs.forEach(traverse);
  }

  traverse(root);
  return result;
}

/**
 * Find person by ID in tree
 */
export function findPersonById(root: Person, id: string): Person | null {
  if (root.id === id) return root;

  for (const child of root.childs) {
    const found = findPersonById(child, id);
    if (found) return found;
  }

  return null;
}

/**
 * Find parent of a person
 */
export function findParent(root: Person, childId: string): Person | null {
  for (const child of root.childs) {
    if (child.id === childId) return root;
    const found = findParent(child, childId);
    if (found) return found;
  }
  return null;
}
