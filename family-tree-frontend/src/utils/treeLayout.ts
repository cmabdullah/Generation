import type { Person } from '../models/Person';
import type { TreeNode } from '../models/TreeNode';
import { LAYOUT_CONSTANTS, NODE_DIMENSIONS } from '../constants/dimensions';

/**
 * Tree layout algorithm using a simplified Reingold-Tilford approach
 * Calculates positions for all nodes in the tree
 *
 * Manual Positioning Strategy:
 * - Nodes with saved positionX/positionY are "anchored" and won't shift
 * - Parent nodes don't auto-center over manually positioned children
 * - This prevents cascading realignment when a single node is moved
 */

export function calculateTreeLayout(root: Person): TreeNode[] {
  const nodes: TreeNode[] = [];
  const { horizontalSpacing, verticalSpacing } = LAYOUT_CONSTANTS;

  function traverse(
    person: Person,
    depth: number,
    leftBound: number,
    parentIsManual: boolean = false
  ): { node: TreeNode; width: number } {
    // Determine if this node is manually positioned
    const isManuallyPositioned =
      (person.positionX !== undefined && person.positionX !== null) ||
      (person.positionY !== undefined && person.positionY !== null);

    // Calculate children positions first
    // Children inherit manual positioning mode
    const childResults = person.childs.map((child, index) => {
      const childLeftBound = leftBound + (index * horizontalSpacing);
      return traverse(child, depth + 1, childLeftBound, isManuallyPositioned);
    });

    let x: number;
    let y: number;

    if (isManuallyPositioned) {
      // Use saved positions (no calculation)
      x = person.positionX ?? leftBound;
      y = person.positionY ?? depth * verticalSpacing;

    } else if (parentIsManual) {
      // Parent is manual, so don't auto-calculate
      // Keep existing position or use offset
      x = person.positionX ?? leftBound;
      y = person.positionY ?? depth * verticalSpacing;

    } else {
      // Auto-layout mode (only if neither node nor parent is manual)
      if (childResults.length > 0) {
        const firstChildX = childResults[0].node.x;
        const lastChildX = childResults[childResults.length - 1].node.x;
        x = (firstChildX + lastChildX) / 2;
      } else {
        x = leftBound;
      }
      y = depth * verticalSpacing;
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
    const totalWidth = childResults.length > 0
      ? childResults.reduce((sum, child) => sum + child.width, 0)
      : NODE_DIMENSIONS.width + horizontalSpacing;

    return { node, width: totalWidth };
  }

  traverse(root, 0, 0);
  return nodes;
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
