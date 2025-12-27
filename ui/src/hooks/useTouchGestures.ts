import { useRef, useEffect } from 'react';
import Konva from 'konva';
import { getTouchInfo, isValidTouchTarget } from '../utils/touchUtils';

interface UseTouchGesturesOptions {
  onPinchZoom?: (scale: number, center: { x: number; y: number }) => void;
  onTwoFingerPan?: (deltaX: number, deltaY: number) => void;
  onLongPress?: (position: { x: number; y: number }) => void;
  longPressDelay?: number;
}

/**
 * Hook for handling touch gestures on Konva stage
 * Supports pinch-to-zoom, two-finger pan, and long press
 */
export const useTouchGestures = (
  stageRef: React.RefObject<Konva.Stage>,
  options: UseTouchGesturesOptions = {}
) => {
  const {
    onPinchZoom,
    onTwoFingerPan,
    onLongPress,
    longPressDelay = 500
  } = options;

  const lastTouchDistance = useRef<number>(0);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!isValidTouchTarget(e.target)) return;

      touchStartTime.current = Date.now();

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartPosition.current = { x: touch.clientX, y: touch.clientY };

        // Start long press timer
        longPressTimer.current = window.setTimeout(() => {
          if (touchStartPosition.current) {
            onLongPress?.(touchStartPosition.current);
          }
        }, longPressDelay) as unknown as number;
      } else if (e.touches.length === 2) {
        // Clear long press timer for multi-touch
        if (longPressTimer.current !== null) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        const touchInfo = getTouchInfo(e);
        if (touchInfo) {
          lastTouchDistance.current = touchInfo.distance;
          lastTouchCenter.current = touchInfo.center;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isValidTouchTarget(e.target)) return;

      // Cancel long press if moved
      if (e.touches.length === 1 && touchStartPosition.current) {
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartPosition.current.x;
        const dy = touch.clientY - touchStartPosition.current.y;
        const moved = Math.hypot(dx, dy) > 10; // 10px threshold

        if (moved && longPressTimer.current !== null) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }

      if (e.touches.length === 2) {
        const touchInfo = getTouchInfo(e);
        if (touchInfo && lastTouchDistance.current > 0) {
          // Pinch to zoom
          const scale = touchInfo.distance / lastTouchDistance.current;
          onPinchZoom?.(scale, touchInfo.center);
          lastTouchDistance.current = touchInfo.distance;

          // Two finger pan
          if (lastTouchCenter.current) {
            const deltaX = touchInfo.center.x - lastTouchCenter.current.x;
            const deltaY = touchInfo.center.y - lastTouchCenter.current.y;
            onTwoFingerPan?.(deltaX, deltaY);
          }
          lastTouchCenter.current = touchInfo.center;
        }
      }
    };

    const handleTouchEnd = () => {
      // Clear long press timer
      if (longPressTimer.current !== null) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      // Reset touch tracking
      lastTouchDistance.current = 0;
      lastTouchCenter.current = null;
      touchStartPosition.current = null;
    };

    // Attach event listeners to the stage content (DOM element)
    const container = stage.container();
    container.addEventListener('touchstart', handleTouchStart, { passive: true } as any);
    container.addEventListener('touchmove', handleTouchMove, { passive: true } as any);
    container.addEventListener('touchend', handleTouchEnd, { passive: true } as any);
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true } as any);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);

      if (longPressTimer.current !== null) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [stageRef, onPinchZoom, onTwoFingerPan, onLongPress, longPressDelay]);

  return {
    // Expose methods if needed for manual gesture handling
  };
};
