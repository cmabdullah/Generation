import { useState, useEffect } from 'react';

/**
 * Breakpoint definitions following Bootstrap 5 + custom mobile-first approach
 */
export const BREAKPOINTS = {
  mobile: {
    small: 320,   // iPhone SE, old Android
    medium: 375,  // iPhone 12/13/14 Pro
    large: 414,   // iPhone 14 Plus
    max: 767      // Maximum mobile width
  },
  tablet: {
    small: 768,   // iPad Mini
    large: 1024,  // iPad Pro
    min: 768,
    max: 1023
  },
  desktop: {
    min: 1024,
    large: 1280,
    xlarge: 1920
  }
} as const;

/**
 * Custom hook for media query matching
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add listener (using both methods for compatibility)
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
};

/**
 * Check if current viewport is mobile size
 */
export const useIsMobile = (): boolean => {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.mobile.max}px)`);
};

/**
 * Check if current viewport is tablet size
 */
export const useIsTablet = (): boolean => {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS.tablet.min}px) and (max-width: ${BREAKPOINTS.tablet.max}px)`
  );
};

/**
 * Check if current viewport is desktop size
 */
export const useIsDesktop = (): boolean => {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.desktop.min}px)`);
};

/**
 * Check if device supports hover (not touch-only)
 */
export const useHoverSupported = (): boolean => {
  return useMediaQuery('(hover: hover)');
};

/**
 * Check if user prefers reduced motion
 */
export const usePrefersReducedMotion = (): boolean => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

/**
 * Get device type based on viewport width
 */
export const useDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
};

/**
 * Get specific mobile size category
 */
export const useMobileSize = (): 'small' | 'medium' | 'large' | null => {
  const isMobile = useIsMobile();
  const isSmall = useMediaQuery(`(max-width: ${BREAKPOINTS.mobile.small}px)`);
  const isMedium = useMediaQuery(
    `(min-width: ${BREAKPOINTS.mobile.small + 1}px) and (max-width: ${BREAKPOINTS.mobile.medium}px)`
  );
  const isLarge = useMediaQuery(
    `(min-width: ${BREAKPOINTS.mobile.medium + 1}px) and (max-width: ${BREAKPOINTS.mobile.max}px)`
  );

  if (!isMobile) return null;
  if (isSmall) return 'small';
  if (isMedium) return 'medium';
  if (isLarge) return 'large';
  return 'medium'; // Default fallback
};
