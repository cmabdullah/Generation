import { NODE_DIMENSIONS, LAYOUT_CONSTANTS } from '../constants/dimensions';
import type { Breakpoint } from '../hooks/useResponsiveBreakpoint';

/**
 * Responsive node dimensions for different breakpoints
 */
const RESPONSIVE_NODE_DIMENSIONS = {
  mobileSmall: {
    width: 140,
    height: 100,
    avatarSize: 48,
    avatarOverlap: 15,
    avatarBorderWidth: 2,
    cornerRadius: 8,
  },
  mobile: {
    width: 160,
    height: 115,
    avatarSize: 52,
    avatarOverlap: 17,
    avatarBorderWidth: 2,
    cornerRadius: 9,
  },
  tablet: {
    width: 180,
    height: 130,
    avatarSize: 56,
    avatarOverlap: 18,
    avatarBorderWidth: 3,
    cornerRadius: 10,
  },
  desktop: NODE_DIMENSIONS, // Use existing desktop dimensions
};

/**
 * Get responsive node dimensions based on current breakpoint
 * @param breakpoint - Current breakpoint
 * @returns Node dimensions object
 */
export const getResponsiveNodeDimensions = (breakpoint: Breakpoint) => {
  return RESPONSIVE_NODE_DIMENSIONS[breakpoint] || RESPONSIVE_NODE_DIMENSIONS.desktop;
};

/**
 * Responsive layout spacing for different breakpoints
 */
const RESPONSIVE_LAYOUT_SPACING = {
  mobileSmall: {
    horizontalSpacing: 60,
    verticalSpacing: 50,
  },
  mobile: {
    horizontalSpacing: 80,
    verticalSpacing: 60,
  },
  tablet: {
    horizontalSpacing: 120,
    verticalSpacing: 100,
  },
  desktop: LAYOUT_CONSTANTS, // Use existing desktop constants
};

/**
 * Get responsive layout spacing based on current breakpoint
 * @param breakpoint - Current breakpoint
 * @returns Layout spacing constants
 */
export const getResponsiveLayoutSpacing = (breakpoint: Breakpoint) => {
  return RESPONSIVE_LAYOUT_SPACING[breakpoint] || RESPONSIVE_LAYOUT_SPACING.desktop;
};

/**
 * Calculate font sizes for different breakpoints
 * @param breakpoint - Current breakpoint
 * @returns Font sizes for different text elements
 */
export const getResponsiveFontSizes = (breakpoint: Breakpoint) => {
  const fontSizes = {
    mobileSmall: {
      name: 10,
      address: 10,
      mobile: 10,
      generation: 8,
    },
    mobile: {
      name: 11,
      address: 11,
      mobile: 11,
      generation: 9,
    },
    tablet: {
      name: 12,
      address: 12,
      mobile: 12,
      generation: 10,
    },
    desktop: {
      name: 12,
      address: 12,
      mobile: 12,
      generation: 10,
    },
  };

  return fontSizes[breakpoint] || fontSizes.desktop;
};

/**
 * Get responsive navbar height
 * @param breakpoint - Current breakpoint
 * @returns Navbar height in pixels
 */
export const getResponsiveNavbarHeight = (breakpoint: Breakpoint): number => {
  const heights = {
    mobileSmall: 50,
    mobile: 50,
    tablet: 60,
    desktop: 60,
  };

  return heights[breakpoint] || heights.desktop;
};

/**
 * Check if touch is supported on the device
 * @returns boolean indicating touch support
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - msMaxTouchPoints is deprecated but still needed for IE
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Get optimal text truncation length based on breakpoint
 * @param breakpoint - Current breakpoint
 * @returns Maximum characters before truncation
 */
export const getTextTruncateLength = (breakpoint: Breakpoint): number => {
  const lengths = {
    mobileSmall: 12,
    mobile: 15,
    tablet: 18,
    desktop: 18,
  };

  return lengths[breakpoint] || lengths.desktop;
};
