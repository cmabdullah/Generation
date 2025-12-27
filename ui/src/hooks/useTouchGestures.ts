import { useRef, useCallback } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface TouchGestureHandlers {
  onPinchZoom?: (scale: number, center: Point) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  onLongPress?: (point: Point) => void;
  onDoubleTap?: (point: Point) => void;
  onSingleTap?: (point: Point) => void;
}

/**
 * Custom hook for handling touch gestures
 * Supports: pinch-zoom, pan, long-press, double-tap, single-tap
 */
export const useTouchGestures = (handlers: TouchGestureHandlers) => {
  const touchesRef = useRef<Map<number, React.Touch>>(new Map());
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const initialDistanceRef = useRef<number>(0);
  const lastPanRef = useRef<Point>({ x: 0, y: 0 });
  const isPinchingRef = useRef<boolean>(false);
  const isPanningRef = useRef<boolean>(false);

  /**
   * Clear long press timer
   */
  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  /**
   * Calculate distance between two touches
   */
  const getDistance = useCallback((t1: React.Touch, t2: React.Touch): number => {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  /**
   * Calculate center point between two touches
   */
  const getCenter = useCallback((t1: React.Touch, t2: React.Touch): Point => {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    };
  }, []);

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback(
    (e: TouchEvent | React.TouchEvent) => {
      const touches = Array.from(e.touches);

      // Store all current touches
      touches.forEach((touch) => {
        touchesRef.current.set(touch.identifier, touch);
      });

      // Single touch - check for long press and potential double tap
      if (touches.length === 1) {
        const touch = touches[0];
        const now = Date.now();

        // Store initial pan position
        lastPanRef.current = { x: touch.clientX, y: touch.clientY };

        // Double tap detection (300ms window)
        if (now - lastTapTimeRef.current < 300) {
          handlers.onDoubleTap?.({ x: touch.clientX, y: touch.clientY });
          lastTapTimeRef.current = 0; // Reset to prevent triple tap
          clearLongPress(); // Cancel long press if double tap
        } else {
          lastTapTimeRef.current = now;

          // Long press detection (500ms hold)
          longPressTimerRef.current = setTimeout(() => {
            if (!isPanningRef.current && !isPinchingRef.current) {
              handlers.onLongPress?.({ x: touch.clientX, y: touch.clientY });

              // Haptic feedback on supported devices
              if (navigator.vibrate) {
                navigator.vibrate(50);
              }
            }
          }, 500);
        }
      }

      // Two finger pinch - calculate initial distance
      if (touches.length === 2) {
        clearLongPress(); // Cancel long press if second finger added
        const [touch1, touch2] = touches;
        initialDistanceRef.current = getDistance(touch1, touch2);
        isPinchingRef.current = true;
        isPanningRef.current = false; // Stop panning if started
      }

      // More than two fingers - cancel all gestures
      if (touches.length > 2) {
        clearLongPress();
        isPinchingRef.current = false;
        isPanningRef.current = false;
      }
    },
    [handlers, clearLongPress, getDistance]
  );

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback(
    (e: TouchEvent | React.TouchEvent) => {
      const touches = Array.from(e.touches);

      // Cancel long press on any movement
      if (touches.length === 1 || touches.length === 2) {
        clearLongPress();
      }

      // Single finger pan
      if (touches.length === 1 && !isPinchingRef.current) {
        const touch = touches[0];
        const previousTouch = touchesRef.current.get(touch.identifier);

        if (previousTouch) {
          const deltaX = touch.clientX - previousTouch.clientX;
          const deltaY = touch.clientY - previousTouch.clientY;

          // Only trigger pan if movement is > 3px (prevents jitter)
          if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            isPanningRef.current = true;
            handlers.onPan?.(deltaX, deltaY);
          }
        }

        touchesRef.current.set(touch.identifier, touch);
      }

      // Two finger pinch zoom
      if (touches.length === 2 && initialDistanceRef.current > 0) {
        const [touch1, touch2] = touches;
        const currentDistance = getDistance(touch1, touch2);
        const scale = currentDistance / initialDistanceRef.current;
        const center = getCenter(touch1, touch2);

        // Only trigger pinch if scale change is significant (> 2%)
        if (Math.abs(scale - 1) > 0.02) {
          handlers.onPinchZoom?.(scale, center);
          initialDistanceRef.current = currentDistance; // Update for next frame
        }
      }
    },
    [handlers, clearLongPress, getDistance, getCenter]
  );

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(
    (e: TouchEvent | React.TouchEvent) => {
      const endedTouches = Array.from(e.changedTouches);

      // Remove ended touches
      endedTouches.forEach((touch) => {
        touchesRef.current.delete(touch.identifier);
      });

      // If single tap (no pan, no pinch, quick tap)
      if (
        endedTouches.length === 1 &&
        !isPanningRef.current &&
        !isPinchingRef.current
      ) {
        const touch = endedTouches[0];
        const now = Date.now();

        // Only trigger single tap if not part of double tap sequence
        if (now - lastTapTimeRef.current > 300) {
          handlers.onSingleTap?.({ x: touch.clientX, y: touch.clientY });
        }
      }

      // Reset pinch state if no more touches or less than 2 fingers
      if (e.touches.length < 2) {
        isPinchingRef.current = false;
        initialDistanceRef.current = 0;
      }

      // Reset panning state if no touches
      if (e.touches.length === 0) {
        isPanningRef.current = false;
        clearLongPress();
      }

      // Update pan reference if one finger remains
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        lastPanRef.current = { x: touch.clientX, y: touch.clientY };
      }
    },
    [handlers, clearLongPress]
  );

  /**
   * Handle touch cancel (e.g., phone call interruption)
   */
  const handleTouchCancel = useCallback(() => {
    touchesRef.current.clear();
    clearLongPress();
    isPinchingRef.current = false;
    isPanningRef.current = false;
    initialDistanceRef.current = 0;
  }, [clearLongPress]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  };
};
