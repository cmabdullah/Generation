/**
 * Viewport storage utility for persisting zoom and pan state
 */

import { debounce } from 'lodash';

interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

const VIEWPORT_STORAGE_KEY = 'familyTree_viewport';

/**
 * Debounced save function (1000ms delay)
 * Prevents excessive localStorage writes during drag/zoom operations
 * Saves 1 second after user stops zooming for better performance
 */
const debouncedSave = debounce(
  (zoom: number, panX: number, panY: number) => {
    try {
      const viewport: ViewportState = { zoom, panX, panY };
      localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(viewport));
    } catch (error) {
      console.error('Failed to save viewport state:', error);
    }
  },
  1000
);

/**
 * Save viewport state to localStorage (debounced)
 */
export const saveViewport = (zoom: number, panX: number, panY: number): void => {
  debouncedSave(zoom, panX, panY);
};

/**
 * Immediate save (for critical operations like resetView)
 */
export const saveViewportImmediate = (zoom: number, panX: number, panY: number): void => {
  try {
    const viewport: ViewportState = { zoom, panX, panY };
    localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(viewport));
  } catch (error) {
    console.error('Failed to save viewport state:', error);
  }
};

/**
 * Load viewport state from localStorage
 * Returns default values if not found
 */
export const loadViewport = (): ViewportState => {
  try {
    const stored = localStorage.getItem(VIEWPORT_STORAGE_KEY);
    if (stored) {
      const viewport = JSON.parse(stored) as ViewportState;
      // Validate the loaded data
      if (
        typeof viewport.zoom === 'number' &&
        typeof viewport.panX === 'number' &&
        typeof viewport.panY === 'number'
      ) {
        return viewport;
      }
    }
  } catch (error) {
    console.error('Failed to load viewport state:', error);
  }

  // Return default viewport
  return {
    zoom: 1.0,
    panX: 400,
    panY: 50,
  };
};

/**
 * Clear viewport state from localStorage
 */
export const clearViewport = (): void => {
  try {
    localStorage.removeItem(VIEWPORT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear viewport state:', error);
  }
};
