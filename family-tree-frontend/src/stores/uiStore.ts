import { create } from 'zustand';
import { ViewMode } from '../models/TreeNode';
import { LAYOUT_CONSTANTS, CANVAS_CONSTANTS } from '../constants/dimensions';

interface UIState {
  mode: ViewMode;
  zoom: number;
  panX: number;
  panY: number;
  showInfoPanel: boolean;
  searchQuery: string;
  selectedLevel: number | null;

  // Actions
  setMode: (mode: ViewMode) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  toggleInfoPanel: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedLevel: (level: number | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mode: 'view',
  zoom: LAYOUT_CONSTANTS.defaultZoom,
  panX: CANVAS_CONSTANTS.defaultPanX,
  panY: CANVAS_CONSTANTS.defaultPanY,
  showInfoPanel: false,
  searchQuery: '',
  selectedLevel: null,

  setMode: (mode) => set({ mode }),

  setZoom: (zoom) => {
    const clampedZoom = Math.max(
      LAYOUT_CONSTANTS.minZoom,
      Math.min(LAYOUT_CONSTANTS.maxZoom, zoom)
    );
    set({ zoom: clampedZoom });
  },

  setPan: (x, y) => set({ panX: x, panY: y }),

  zoomIn: () =>
    set((state) => ({
      zoom: Math.min(
        state.zoom + LAYOUT_CONSTANTS.zoomStep,
        LAYOUT_CONSTANTS.maxZoom
      ),
    })),

  zoomOut: () =>
    set((state) => ({
      zoom: Math.max(
        state.zoom - LAYOUT_CONSTANTS.zoomStep,
        LAYOUT_CONSTANTS.minZoom
      ),
    })),

  resetView: () =>
    set({
      zoom: LAYOUT_CONSTANTS.defaultZoom,
      panX: CANVAS_CONSTANTS.defaultPanX,
      panY: CANVAS_CONSTANTS.defaultPanY,
    }),

  toggleInfoPanel: () =>
    set((state) => ({ showInfoPanel: !state.showInfoPanel })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedLevel: (level) => set({ selectedLevel: level }),
}));
