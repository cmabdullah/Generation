/**
 * Cache Invalidation Strategy
 *
 * Determines which cached positions should be invalidated
 * based on tree structure changes.
 */

import type { Person } from '../models/Person';
import { findPersonById } from './treeLayout';

export class CacheInvalidationStrategy {
  /**
   * When a node is added, invalidate:
   * - The new node (obviously)
   * - The parent node (may need to re-center)
   * - All ancestors up to root (cascading effect)
   * - Siblings (may shift due to parent shift)
   */
  static onNodeAdded(
    newNodeId: string,
    parentId: string,
    rootPerson: Person
  ): string[] {
    const toInvalidate = new Set<string>();

    // Invalidate the new node
    toInvalidate.add(newNodeId);

    // Invalidate parent and all ancestors
    const ancestors = this.getAncestors(parentId, rootPerson);
    ancestors.forEach(id => toInvalidate.add(id));
    toInvalidate.add(parentId);

    // Invalidate parent's children (siblings of new node)
    const parent = findPersonById(rootPerson, parentId);
    if (parent) {
      parent.childs.forEach(child => toInvalidate.add(child.id));
    }

    return Array.from(toInvalidate);
  }

  /**
   * When a node is deleted, invalidate:
   * - The parent node (may need to re-center)
   * - All ancestors up to root
   * - Remaining siblings
   */
  static onNodeDeleted(
    _deletedNodeId: string,
    parentId: string | null,
    rootPerson: Person
  ): string[] {
    if (!parentId) {
      // Deleting root node - clear entire cache
      return [];
    }

    const toInvalidate = new Set<string>();

    // Invalidate parent and ancestors
    const ancestors = this.getAncestors(parentId, rootPerson);
    ancestors.forEach(id => toInvalidate.add(id));
    toInvalidate.add(parentId);

    // Invalidate parent's remaining children
    const parent = findPersonById(rootPerson, parentId);
    if (parent) {
      parent.childs.forEach(child => toInvalidate.add(child.id));
    }

    return Array.from(toInvalidate);
  }

  /**
   * When a node is manually positioned, invalidate:
   * - Nothing! Manual positions are absolute and don't affect others
   * - This is the whole point of the cache system
   */
  static onNodeManuallyPositioned(_nodeId: string): string[] {
    return []; // No invalidation needed
  }

  /**
   * When a node is edited (name, avatar, etc.), invalidate:
   * - Nothing! Non-positional changes don't affect layout
   */
  static onNodeEdited(_nodeId: string): string[] {
    return []; // No invalidation needed
  }

  /**
   * Get all ancestors of a node
   */
  private static getAncestors(nodeId: string, root: Person): string[] {
    const ancestors: string[] = [];

    function traverse(person: Person, targetId: string, path: string[]): boolean {
      if (person.id === targetId) {
        ancestors.push(...path);
        return true;
      }

      for (const child of person.childs) {
        if (traverse(child, targetId, [...path, person.id])) {
          return true;
        }
      }

      return false;
    }

    traverse(root, nodeId, []);
    return ancestors;
  }
}
