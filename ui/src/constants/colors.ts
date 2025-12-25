/**
 * Color palette for the family tree application
 */

export const GENERATION_COLORS: Record<number, string> = {
  1: '#2C3E50', // Dark Blue - Root
  2: '#3498DB', // Blue
  3: '#1ABC9C', // Turquoise
  4: '#27AE60', // Green
  5: '#F39C12', // Orange
  6: '#E74C3C', // Red
  7: '#9B59B6', // Purple
  8: '#34495E', // Dark Gray
  9: '#16A085', // Teal
  10: '#D35400', // Pumpkin
};

export const UI_COLORS = {
  background: '#ECF0F1',
  text: '#2C3E50',
  border: '#BDC3C7',
  hover: '#3498DB',
  selected: '#E74C3C',
  connection: '#95A5A6',
  white: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.2)',
};

/**
 * Get color for a specific generation level
 */
export function getColorForLevel(level: number): string {
  return GENERATION_COLORS[level] || GENERATION_COLORS[1];
}
