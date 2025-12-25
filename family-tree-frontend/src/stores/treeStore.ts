import { create } from 'zustand';
import { Person } from '../models/Person';
import { TreeNode } from '../models/TreeNode';
import { familyTreeService } from '../services/familyTreeService';
import { calculateTreeLayout, flattenTree } from '../utils/treeLayout';
import { toast } from 'react-toastify';

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
      const nodes = calculateTreeLayout(root);
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
  },

  persistNodePosition: async (id: string, x: number, y: number) => {
    try {
      await familyTreeService.updatePerson(id, { positionX: x, positionY: y });
    } catch (error) {
      console.error('Failed to persist position:', error);
      toast.error('Failed to save position');
    }
  },

  setSelectedNode: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  refreshTree: async () => {
    await get().loadTree();
  },
}));
