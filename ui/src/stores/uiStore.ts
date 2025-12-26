import { create } from 'zustand';
import type { ViewMode } from '../models/TreeNode';
import { LAYOUT_CONSTANTS, CANVAS_CONSTANTS } from '../constants/dimensions';
import { saveViewport, saveViewportImmediate, loadViewport } from '../utils/viewportStorage';
import { smoothZoom } from '../utils/smoothZoom';

interface UIState {
  mode: ViewMode;
  zoom: number;
  panX: number;
  panY: number;
  showInfoPanel: boolean;
  searchQuery: string;
  selectedLevel: number | null;
  isZooming: boolean;

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
  setIsZooming: (isZooming: boolean) => void;
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
  isZooming: false,

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
    const currentZoom = get().zoom;
    const targetZoom = Math.min(
      currentZoom + LAYOUT_CONSTANTS.zoomStep,
      LAYOUT_CONSTANTS.maxZoom
    );

    // Use smooth animation for better UX
    smoothZoom({
      from: currentZoom,
      to: targetZoom,
      duration: LAYOUT_CONSTANTS.zoomAnimationDuration,
      onUpdate: (value) => {
        set({ zoom: value });
      },
      onComplete: () => {
        // Persist to localStorage only after animation completes
        const { panX, panY } = get();
        saveViewport(targetZoom, panX, panY);
      },
    });
  },

  zoomOut: () => {
    const currentZoom = get().zoom;
    const targetZoom = Math.max(
      currentZoom - LAYOUT_CONSTANTS.zoomStep,
      LAYOUT_CONSTANTS.minZoom
    );

    // Use smooth animation for better UX
    smoothZoom({
      from: currentZoom,
      to: targetZoom,
      duration: LAYOUT_CONSTANTS.zoomAnimationDuration,
      onUpdate: (value) => {
        set({ zoom: value });
      },
      onComplete: () => {
        // Persist to localStorage only after animation completes
        const { panX, panY } = get();
        saveViewport(targetZoom, panX, panY);
      },
    });
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

  setIsZooming: (isZooming) => set({ isZooming }),
}));
