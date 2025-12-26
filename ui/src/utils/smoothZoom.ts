/**
 * Smooth zoom animation utility using requestAnimationFrame
 * Provides buttery-smooth zoom transitions for better UX
 */

export interface SmoothZoomOptions {
  from: number;
  to: number;
  duration: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

/**
 * Easing function for smooth deceleration
 * Creates a natural "ease-out" animation curve
 */
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Performs a smooth animated zoom transition
 * Uses requestAnimationFrame for 60fps performance
 */
export const smoothZoom = (options: SmoothZoomOptions): (() => void) => {
  const { from, to, duration, onUpdate, onComplete } = options;
  const startTime = performance.now();
  let rafId: number | null = null;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Apply easing function for smooth animation
    const easedProgress = easeOutCubic(progress);
    const currentValue = from + (to - from) * easedProgress;

    onUpdate(currentValue);

    if (progress < 1) {
      rafId = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(animate);

  // Return cancel function
  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
};

/**
 * Throttle function for wheel events
 * Limits how often wheel zoom can trigger
 */
export const throttleWheel = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
