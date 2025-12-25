/**
 * Dimensions and spacing constants for tree nodes and layout
 */

export const NODE_DIMENSIONS = {
  width: 200,
  height: 120,
  cornerRadius: 8,
  padding: 10,
  signatureBadgeRadius: 18,
  avatarSize: 40,
};

export const LAYOUT_CONSTANTS = {
  horizontalSpacing: 250, // Gap between siblings
  verticalSpacing: 200,   // Gap between generations
  minZoom: 0.1,
  maxZoom: 5.0,
  defaultZoom: 1.0,
  zoomStep: 0.1,
};

export const CANVAS_CONSTANTS = {
  defaultPanX: 400,
  defaultPanY: 50,
  dragThreshold: 5, // Minimum pixels to consider it a drag
};
