import { create } from 'zustand';
import type { Person } from '../models/Person';
import type { TreeNode } from '../models/TreeNode';
import { familyTreeService } from '../services/familyTreeService';
import { calculateTreeLayout, flattenTree } from '../utils/treeLayout';
import { toast } from 'react-toastify';
import { usePositionCacheStore } from './positionCacheStore';

/**
 * Helper function to update a person's data deep in the tree structure
 * Used to keep rootPerson in sync without triggering full tree reload
 */
function updatePersonInTree(
  person: Person,
  id: string,
  updates: Partial<Person>
): Person {
  if (person.id === id) {
    return { ...person, ...updates };
  }

  return {
    ...person,
    childs: person.childs.map(child => updatePersonInTree(child, id, updates)),
  };
}

interface TreeState {
  rootPerson: Person | null;
  allNodes: TreeNode[];
  allPersons: Person[];
  selectedNodeId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTree: () => Promise<void>;
  updateNodePosition: (id: string, x: number, y: number) => void;
  persistNodePosition: (id: string, x: number, y: number) => Promise<void>;
  setSelectedNode: (id: string | null) => void;
  refreshTree: () => Promise<void>;
  recalculateLayout: () => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  rootPerson: null,
  allNodes: [],
  allPersons: [],
  selectedNodeId: null,
  isLoading: false,
  error: null,

  loadTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await familyTreeService.getFullTree();
      const root = response.data;

      // Get cache functions
      const getCachedPosition = usePositionCacheStore.getState().getCachedPosition;
      const setCachedPosition = usePositionCacheStore.getState().setCachedPosition;

      // Calculate layout with cache support
      const nodes = calculateTreeLayout(root, {
        useCache: true,
        saveCache: true,
        getCachedPosition,
        setCachedPosition,
      });

      const persons = flattenTree(root);

      set({
        rootPerson: root,
        allNodes: nodes,
        allPersons: persons,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load tree:', error);
      set({ error: 'Failed to load family tree', isLoading: false });
      toast.error('Failed to load family tree');
    }
  },

  updateNodePosition: (id: string, x: number, y: number) => {
    set(state => ({
      allNodes: state.allNodes.map(node =>
        node.id === id ? { ...node, x, y, positionX: x, positionY: y } : node
      ),
    }));

    // Update position cache immediately
    usePositionCacheStore.getState().setCachedPosition(id, x, y, 'manual');
  },

  persistNodePosition: async (id: string, x: number, y: number) => {
    try {
      // Save to backend
      await familyTreeService.updatePerson(id, { positionX: x, positionY: y });

      // Update rootPerson data to include new position
      // This keeps state consistent without full reload
      const { rootPerson } = get();
      if (rootPerson) {
        const updatedRoot = updatePersonInTree(rootPerson, id, { positionX: x, positionY: y });
        set({ rootPerson: updatedRoot });

        // Also update allPersons array to keep it in sync
        set(state => ({
          allPersons: state.allPersons.map(person =>
            person.id === id ? { ...person, positionX: x, positionY: y } : person
          ),
        }));
      }

      // Cache is already updated by updateNodePosition()
      // DO NOT call loadTree() - it would recalculate the entire layout
    } catch (error) {
      console.error('Failed to persist position:', error);

      // Show error but keep the visual position (optimistic UI)
      // User can see their change immediately even if save fails
      toast.error('Failed to save position to server. Will retry automatically.');

      // Keep the position in cache and UI - don't rollback
      // The position is already set in the UI and cache
      // If user refreshes, it will use cached position
      // Next successful save will persist it to backend
    }
  },

  setSelectedNode: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  refreshTree: async () => {
    await get().loadTree();
  },

  recalculateLayout: () => {
    const { rootPerson } = get();
    if (!rootPerson) return;

    // Clear cache to force recalculation
    usePositionCacheStore.getState().clearCache();

    // Recalculate without cache
    const getCachedPosition = usePositionCacheStore.getState().getCachedPosition;
    const setCachedPosition = usePositionCacheStore.getState().setCachedPosition;

    const nodes = calculateTreeLayout(rootPerson, {
      useCache: true,
      saveCache: true,
      getCachedPosition,
      setCachedPosition,
    });

    set({ allNodes: nodes });
    toast.success('Layout recalculated');
  },
}));
