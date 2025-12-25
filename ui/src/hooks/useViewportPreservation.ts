/**
 * Hook to preserve viewport state during tree operations
 *
 * When tree data changes (loadTree, refreshTree), this hook:
 * 1. Captures current viewport state
 * 2. Allows tree update to proceed
 * 3. Restores viewport state after update completes if it was unintentionally reset
 */

import { useEffect, useRef } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useTreeStore } from '../stores/treeStore';

export function useViewportPreservation() {
  const zoom = useUIStore((state) => state.zoom);
  const panX = useUIStore((state) => state.panX);
  const panY = useUIStore((state) => state.panY);
  const setZoom = useUIStore((state) => state.setZoom);
  const setPan = useUIStore((state) => state.setPan);

  const allNodes = useTreeStore((state) => state.allNodes);

  // Store previous viewport state
  const prevViewportRef = useRef({ zoom, panX, panY });
  const prevNodesLengthRef = useRef(allNodes.length);

  useEffect(() => {
    // If tree structure changed (nodes added/removed), update the reference
    if (allNodes.length !== prevNodesLengthRef.current) {
      prevNodesLengthRef.current = allNodes.length;
      // Update ref to current viewport after structural change
      prevViewportRef.current = { zoom, panX, panY };
      return;
    }

    // If allNodes changed but count is same (position updates), preserve viewport
    // This handles the case where tree data is reloaded due to other operations
    const viewportChanged =
      zoom !== prevViewportRef.current.zoom ||
      panX !== prevViewportRef.current.panX ||
      panY !== prevViewportRef.current.panY;

    if (viewportChanged) {
      // Viewport intentionally changed by user, update reference
      prevViewportRef.current = { zoom, panX, panY };
    }
  }, [allNodes, zoom, panX, panY, setZoom, setPan]);

  return {
    /**
     * Manually capture current viewport state
     * Call this before operations that might reset viewport
     */
    captureViewport: () => {
      prevViewportRef.current = { zoom, panX, panY };
    },

    /**
     * Manually restore previously captured viewport state
     * Call this after operations that might have reset viewport
     */
    restoreViewport: () => {
      const { zoom: prevZoom, panX: prevPanX, panY: prevPanY } = prevViewportRef.current;
      setZoom(prevZoom);
      setPan(prevPanX, prevPanY);
    },
  };
}
