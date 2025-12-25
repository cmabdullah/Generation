import { useCallback, useMemo } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { useTreeStore } from '../stores/treeStore';
import { debounce } from '../utils/debounce';

/**
 * Hook for handling node drag and drop with position persistence
 */
export const useNodeDrag = () => {
  const updateNodePosition = useTreeStore((state) => state.updateNodePosition);
  const persistNodePosition = useTreeStore((state) => state.persistNodePosition);

  // Debounced save to prevent excessive API calls
  const debouncedSave = useMemo(
    () => debounce((id: string, x: number, y: number) => {
      persistNodePosition(id, x, y);
    }, 300),
    [persistNodePosition]
  );

  const handleDragEnd = useCallback(
    (nodeId: string, e: KonvaEventObject<DragEvent>) => {
      const newX = e.target.x();
      const newY = e.target.y();

      // Optimistic update
      updateNodePosition(nodeId, newX, newY);

      // Persist to backend (debounced)
      debouncedSave(nodeId, newX, newY);
    },
    [updateNodePosition, debouncedSave]
  );

  return { handleDragEnd };
};
