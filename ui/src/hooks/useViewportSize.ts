import { useState, useEffect } from 'react';

export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Debounce helper function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Hook to track viewport dimensions
 * Debounced to prevent excessive re-renders during resize
 */
export const useViewportSize = (debounceMs: number = 100): ViewportSize => {
  const [size, setSize] = useState<ViewportSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  useEffect(() => {
    // Handler to update size
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Debounced version for performance
    const debouncedHandleResize = debounce(handleResize, debounceMs);

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', debouncedHandleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [debounceMs]);

  return size;
};

/**
 * Hook to get viewport width only
 */
export const useViewportWidth = (debounceMs: number = 100): number => {
  const { width } = useViewportSize(debounceMs);
  return width;
};

/**
 * Hook to get viewport height only
 */
export const useViewportHeight = (debounceMs: number = 100): number => {
  const { height } = useViewportSize(debounceMs);
  return height;
};
