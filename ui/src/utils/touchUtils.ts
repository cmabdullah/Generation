/**
 * Touch gesture utilities for mobile interactions
 */

export interface TouchDistance {
  distance: number;
  center: { x: number; y: number };
}

/**
 * Calculate distance between two touch points
 * @param touch1 - First touch point
 * @param touch2 - Second touch point
 * @returns Distance in pixels
 */
export const calculateTouchDistance = (
  touch1: Touch,
  touch2: Touch
): number => {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.hypot(dx, dy);
};

/**
 * Calculate center point between two touches
 * @param touch1 - First touch point
 * @param touch2 - Second touch point
 * @returns Center point coordinates
 */
export const calculateTouchCenter = (
  touch1: Touch,
  touch2: Touch
): { x: number; y: number } => {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
};

/**
 * Get touch distance and center from a touch event
 * @param event - Touch event with 2 touches
 * @returns Distance and center between touches
 */
export const getTouchInfo = (event: TouchEvent): TouchDistance | null => {
  if (event.touches.length !== 2) return null;

  const touch1 = event.touches[0];
  const touch2 = event.touches[1];

  return {
    distance: calculateTouchDistance(touch1, touch2),
    center: calculateTouchCenter(touch1, touch2),
  };
};

/**
 * Check if an element is a valid touch target
 * @param element - DOM element to check
 * @returns boolean indicating if element can receive touch events
 */
export const isValidTouchTarget = (element: EventTarget | null): boolean => {
  if (!element) return false;

  const el = element as HTMLElement;
  const tagName = el.tagName.toLowerCase();

  // Ignore touch on buttons and inputs (they have their own handlers)
  if (tagName === 'button' || tagName === 'input' || tagName === 'textarea') {
    return false;
  }

  return true;
};

/**
 * Debounce function for touch events
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounceTouch = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for touch events (useful for performance)
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttleTouch = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if tap is a long press (duration > threshold)
 * @param startTime - Timestamp when touch started
 * @param threshold - Long press threshold in milliseconds (default: 500ms)
 * @returns boolean indicating if it's a long press
 */
export const isLongPress = (
  startTime: number,
  threshold: number = 500
): boolean => {
  return Date.now() - startTime > threshold;
};

/**
 * Check if touch moved beyond threshold (for distinguishing tap vs drag)
 * @param startTouch - Starting touch position
 * @param currentTouch - Current touch position
 * @param threshold - Movement threshold in pixels (default: 10px)
 * @returns boolean indicating if touch moved significantly
 */
export const hasMovedBeyondThreshold = (
  startTouch: { x: number; y: number },
  currentTouch: { x: number; y: number },
  threshold: number = 10
): boolean => {
  const dx = currentTouch.x - startTouch.x;
  const dy = currentTouch.y - startTouch.y;
  return Math.hypot(dx, dy) > threshold;
};
