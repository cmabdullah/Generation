import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

/**
 * Hook to detect device orientation
 */
export const useOrientation = (): Orientation => {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    return 'portrait';
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);
    };

    // Set initial orientation
    handleOrientationChange();

    // Listen to both resize and orientationchange events
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
};

/**
 * Hook to check if device is in portrait mode
 */
export const useIsPortrait = (): boolean => {
  const orientation = useOrientation();
  return orientation === 'portrait';
};

/**
 * Hook to check if device is in landscape mode
 */
export const useIsLandscape = (): boolean => {
  const orientation = useOrientation();
  return orientation === 'landscape';
};
