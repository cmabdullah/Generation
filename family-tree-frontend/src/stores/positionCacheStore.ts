/**
 * Position Cache Store
 *
 * Manages position caching for all nodes in the family tree.
 * This ensures that node positions remain stable across tree operations,
 * preventing unexpected shifts when the tree is reloaded.
 */

import { create } from 'zustand';

/**
 * Cached position entry for a single node
 */
export interface CachedPosition {
  x: number;
  y: number;
  timestamp: number;
  source: 'auto' | 'manual';
  version: number;
}

interface PositionCacheState {
  // State
  cache: Map<string, CachedPosition>;
  version: number;
  lastCalculated: number;

  // Actions
  setCachedPosition: (id: string, x: number, y: number, source: 'auto' | 'manual') => void;
  getCachedPosition: (id: string) => CachedPosition | null;
  hasCachedPosition: (id: string) => boolean;
  invalidateCache: (nodeIds?: string[]) => void;
  clearCache: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  incrementVersion: () => void;
  getCacheStats: () => { total: number; manual: number; auto: number };
}

const STORAGE_KEY = 'familyTree_positionCache';

export const usePositionCacheStore = create<PositionCacheState>((set, get) => ({
  cache: new Map(),
  version: 1,
  lastCalculated: Date.now(),

  setCachedPosition: (id: string, x: number, y: number, source: 'auto' | 'manual') => {
    const { cache, version } = get();
    const newCache = new Map(cache);

    newCache.set(id, {
      x,
      y,
      timestamp: Date.now(),
      source,
      version,
    });

    set({ cache: newCache });

    // Save to localStorage (debounced in practice, but immediate for now)
    get().saveToStorage();
  },

  getCachedPosition: (id: string) => {
    const { cache } = get();
    return cache.get(id) || null;
  },

  hasCachedPosition: (id: string) => {
    const { cache } = get();
    return cache.has(id);
  },

  invalidateCache: (nodeIds?: string[]) => {
    const { cache } = get();
    const newCache = new Map(cache);

    if (nodeIds && nodeIds.length > 0) {
      // Invalidate specific nodes
      nodeIds.forEach(id => newCache.delete(id));
    } else {
      // Invalidate all
      newCache.clear();
    }

    set({ cache: newCache });
    get().saveToStorage();
  },

  clearCache: () => {
    set({
      cache: new Map(),
      version: 1,
      lastCalculated: Date.now()
    });

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear position cache from localStorage:', error);
    }
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);

        // Validate data structure
        if (data.cache && typeof data.cache === 'object') {
          const cache = new Map<string, CachedPosition>(
            Object.entries(data.cache) as [string, CachedPosition][]
          );
          set({
            cache,
            version: data.version || 1,
            lastCalculated: data.lastCalculated || Date.now(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to load position cache from localStorage:', error);
      // Clear corrupted data
      get().clearCache();
    }
  },

  saveToStorage: () => {
    try {
      const { cache, version, lastCalculated } = get();

      const data = {
        cache: Object.fromEntries(cache),
        version,
        lastCalculated,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save position cache to localStorage:', error);
    }
  },

  incrementVersion: () => {
    set(state => ({ version: state.version + 1 }));
  },

  getCacheStats: () => {
    const { cache } = get();
    const positions = Array.from(cache.values());

    return {
      total: positions.length,
      manual: positions.filter(p => p.source === 'manual').length,
      auto: positions.filter(p => p.source === 'auto').length,
    };
  },
}));

// Initialize cache from localStorage on module load
usePositionCacheStore.getState().loadFromStorage();
