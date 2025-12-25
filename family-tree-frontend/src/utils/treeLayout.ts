import { Person } from '../models/Person';
import { TreeNode } from '../models/TreeNode';
import { LAYOUT_CONSTANTS, NODE_DIMENSIONS } from '../constants/dimensions';

/**
 * Tree layout algorithm using a simplified Reingold-Tilford approach
 * Calculates positions for all nodes in the tree
 */

export function calculateTreeLayout(root: Person): TreeNode[] {
  const nodes: TreeNode[] = [];
  const { horizontalSpacing, verticalSpacing } = LAYOUT_CONSTANTS;

  function traverse(
    person: Person,
    depth: number,
    leftBound: number
  ): { node: TreeNode; width: number } {
    // Use saved positions if available, otherwise calculate
    const y = person.positionY !== undefined && person.positionY !== null
      ? person.positionY
      : depth * verticalSpacing;

    // Calculate children positions first
    const childResults = person.childs.map((child, index) => {
      const childLeftBound = leftBound + (index * horizontalSpacing);
      return traverse(child, depth + 1, childLeftBound);
    });

    // Calculate this node's X position
    let x: number;

    if (person.positionX !== undefined && person.positionX !== null) {
      // Use saved position
      x = person.positionX;
    } else if (childResults.length > 0) {
      // Center over children
      const firstChildX = childResults[0].node.x;
      const lastChildX = childResults[childResults.length - 1].node.x;
      x = (firstChildX + lastChildX) / 2;
    } else {
      // Leaf node - use leftBound
      x = leftBound;
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
