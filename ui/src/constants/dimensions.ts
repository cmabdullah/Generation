/**
 * Dimensions and spacing constants for tree nodes and layout
 */

import type { ViewportSize } from '../hooks/useViewportSize';

// Static dimensions (backward compatibility - desktop default)
export const NODE_DIMENSIONS = {
  width: 200,
  height: 145,
  cornerRadius: 10,
  padding: 0,
  avatarSize: 64,
  avatarOverlap: 20,
  avatarBorderWidth: 3,
  signatureBadgeRadius: 18,
};

/**
 * Responsive node dimensions based on viewport size
 */
export interface NodeDimensions {
  width: number;
  height: number;
  cornerRadius: number;
  avatarSize: number;
  avatarOverlap: number;
  avatarBorderWidth: number;
  fontSize: {
    name: number;
    details: number;
    badge: number;
  };
}

export const getNodeDimensions = (viewport: ViewportSize): NodeDimensions => {
  const { width: screenWidth } = viewport;

  // Mobile small (< 375px) - iPhone SE
  if (screenWidth < 375) {
    return {
      width: 160,
      height: 120,
      cornerRadius: 8,
      avatarSize: 48,
      avatarOverlap: 16,
      avatarBorderWidth: 2,
      fontSize: {
        name: 14,
        details: 11,
        badge: 10,
      },
    };
  }

  // Mobile large (375-767px) - Most phones
  if (screenWidth < 768) {
    return {
      width: 180,
      height: 135,
      cornerRadius: 9,
      avatarSize: 56,
      avatarOverlap: 18,
      avatarBorderWidth: 2.5,
      fontSize: {
        name: 15,
        details: 12,
        badge: 11,
      },
    };
  }

  // Tablet (768-1023px)
  if (screenWidth < 1024) {
    return {
      width: 190,
      height: 140,
      cornerRadius: 10,
      avatarSize: 60,
      avatarOverlap: 19,
      avatarBorderWidth: 3,
      fontSize: {
        name: 16,
        details: 13,
        badge: 12,
      },
    };
  }

  // Desktop (1024px+)
  return {
    width: 200,
    height: 145,
    cornerRadius: 10,
    avatarSize: 64,
    avatarOverlap: 20,
    avatarBorderWidth: 3,
    fontSize: {
      name: 17,
      details: 14,
      badge: 13,
    },
  };
};

/**
 * Responsive layout constants based on viewport size
 */
export const getLayoutConstants = (viewport: ViewportSize) => {
  const { width: screenWidth } = viewport;

  return {
    horizontalSpacing: screenWidth < 768 ? 180 : 250,
    verticalSpacing: screenWidth < 768 ? 150 : 200,
    minZoom: 0.1,
    maxZoom: 5.0,
    defaultZoom: 1.0,
    zoomStep: 0.15,
    wheelZoomFactor: 1.08,
    zoomAnimationDuration: 200,
  };
};

// Static layout constants (backward compatibility)
export const LAYOUT_CONSTANTS = {
  horizontalSpacing: 250,
  verticalSpacing: 200,
  minZoom: 0.1,
  maxZoom: 5.0,
  defaultZoom: 1.0,
  zoomStep: 0.15,
  wheelZoomFactor: 1.08,
  zoomAnimationDuration: 200,
};

export const CANVAS_CONSTANTS = {
  defaultPanX: 400,
  defaultPanY: 50,
  dragThreshold: 5,
};

/**
 * Touch target sizes following iOS and Material Design guidelines
 */
export const TOUCH_TARGETS = {
  minimum: 44,      // iOS minimum (44x44pt)
  recommended: 48,  // Material Design (48x48dp)
  comfortable: 56,  // Large buttons
  spacing: 8,       // Minimum gap between targets
};
