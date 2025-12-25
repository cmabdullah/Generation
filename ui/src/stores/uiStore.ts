import { create } from 'zustand';
import type { ViewMode } from '../models/TreeNode';
import { LAYOUT_CONSTANTS, CANVAS_CONSTANTS } from '../constants/dimensions';
import { saveViewport, saveViewportImmediate, loadViewport } from '../utils/viewportStorage';

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
  setShowInfoPanel: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedLevel: (level: number | null) => void;
}

// Load persisted viewport state on initialization
const initialViewport = loadViewport();

export const useUIStore = create<UIState>((set, get) => ({
  mode: 'view',
  zoom: initialViewport.zoom,
  panX: initialViewport.panX,
  panY: initialViewport.panY,
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

    // Persist to localStorage
    const { panX, panY } = get();
    saveViewport(clampedZoom, panX, panY);
  },

  setPan: (x, y) => {
    set({ panX: x, panY: y });

    // Persist to localStorage
    const { zoom } = get();
    saveViewport(zoom, x, y);
  },

  zoomIn: () => {
    const newZoom = Math.min(
      get().zoom + LAYOUT_CONSTANTS.zoomStep,
      LAYOUT_CONSTANTS.maxZoom
    );
    set({ zoom: newZoom });

    // Persist to localStorage
    const { panX, panY } = get();
    saveViewport(newZoom, panX, panY);
  },

  zoomOut: () => {
    const newZoom = Math.max(
      get().zoom - LAYOUT_CONSTANTS.zoomStep,
      LAYOUT_CONSTANTS.minZoom
    );
    set({ zoom: newZoom });

    // Persist to localStorage
    const { panX, panY } = get();
    saveViewport(newZoom, panX, panY);
  },

  resetView: () => {
    set({
      zoom: LAYOUT_CONSTANTS.defaultZoom,
      panX: CANVAS_CONSTANTS.defaultPanX,
      panY: CANVAS_CONSTANTS.defaultPanY,
    });

    // Persist reset immediately (not debounced)
    saveViewportImmediate(
      LAYOUT_CONSTANTS.defaultZoom,
      CANVAS_CONSTANTS.defaultPanX,
      CANVAS_CONSTANTS.defaultPanY
    );
  },

  toggleInfoPanel: () =>
    set((state) => ({ showInfoPanel: !state.showInfoPanel })),

  setShowInfoPanel: (show) => set({ showInfoPanel: show }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedLevel: (level) => set({ selectedLevel: level }),
}));
