/**
 * Formatting utility functions for display values
 */

/**
 * Format mobile number for display
 * Handles various input formats and standardizes to readable format
 *
 * @param mobile - Mobile number string (can be in various formats)
 * @returns Formatted mobile number or 'N/A' if not provided
 *
 * @example
 * formatMobile('01712345678') => '+880 1712-345678'
 * formatMobile('+8801712345678') => '+880 1712-345678'
 * formatMobile('1712345678') => '+880 1712-345678'
 */
export function formatMobile(mobile?: string): string {
  if (!mobile || mobile.trim() === '') {
    return 'N/A';
  }

  // Remove all non-digit characters
  const cleaned = mobile.replace(/\D/g, '');

  // Bangladesh mobile number format
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // Format: 01712-345678 => +880 1712-345678
    return `+880 ${cleaned.slice(1, 5)}-${cleaned.slice(5)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Format: 1712345678 => +880 1712-345678
    return `+880 ${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }

  if (cleaned.length === 13 && cleaned.startsWith('880')) {
    // Format: 8801712345678 => +880 1712-345678
    return `+880 ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }

  // For other formats, try to add separators for readability
  if (cleaned.length >= 10) {
    const countryCode = cleaned.slice(0, -10);
    const areaCode = cleaned.slice(-10, -7);
    const firstPart = cleaned.slice(-7, -4);
    const secondPart = cleaned.slice(-4);

    if (countryCode) {
      return `+${countryCode} ${areaCode}-${firstPart}-${secondPart}`;
    } else {
      return `${areaCode}-${firstPart}-${secondPart}`;
    }
  }

  // If format doesn't match expected patterns, return as-is
  return mobile;
}

/**
 * Truncate long text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 20): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

/**
 * Format generation level for display
 *
 * @param level - Generation level number
 * @returns Formatted generation text
 */
export function formatGeneration(level: number): string {
  return `Generation ${level}`;
}

/**
 * Estimate text width in pixels based on font size and text content
 * This is an approximation since canvas text measurement isn't available in all contexts
 *
 * @param text - Text to measure
 * @param fontSize - Font size in pixels
 * @param fontWeight - Font weight (e.g., '400', '600', 'bold')
 * @returns Estimated width in pixels
 */
export function estimateTextWidth(
  text: string,
  fontSize: number,
  fontWeight: string = '600'
): number {
  // Average character width multipliers based on font weight
  // For semibold (600) fonts, characters are roughly 0.6-0.65x the font size
  const baseMultiplier = fontWeight === '600' ? 0.62 : 0.55;

  // Account for wider characters (W, M, m, w) and narrower ones (i, l, I)
  let totalWidth = 0;
  for (const char of text) {
    if ('WMmw@'.includes(char)) {
      totalWidth += fontSize * baseMultiplier * 1.3; // Wide characters
    } else if ('iIl!|'.includes(char)) {
      totalWidth += fontSize * baseMultiplier * 0.5; // Narrow characters
    } else if (char === ' ') {
      totalWidth += fontSize * baseMultiplier * 0.4; // Spaces
    } else {
      totalWidth += fontSize * baseMultiplier; // Regular characters
    }
  }

  return totalWidth;
}

/**
 * Adaptive text sizing - finds the best font size for text to fit within available width
 * Falls back to smart truncation if text still doesn't fit at minimum size
 *
 * @param text - Text to display
 * @param availableWidth - Available width in pixels
 * @param fontSizes - Array of font sizes to try (descending order)
 * @param fontWeight - Font weight
 * @returns Object with optimized fontSize and displayText
 */
export function getAdaptiveTextSize(
  text: string,
  availableWidth: number,
  fontSizes: number[] = [15, 13, 11, 10],
  fontWeight: string = '600'
): { fontSize: number; displayText: string } {
  if (!text) {
    return { fontSize: fontSizes[0], displayText: '' };
  }

  // Try each font size to see if text fits
  for (const fontSize of fontSizes) {
    const estimatedWidth = estimateTextWidth(text, fontSize, fontWeight);

    if (estimatedWidth <= availableWidth) {
      // Text fits at this size!
      return { fontSize, displayText: text };
    }
  }

  // If we're here, text doesn't fit even at smallest size
  // Use smart truncation at the minimum font size
  const minFontSize = fontSizes[fontSizes.length - 1];

  // Binary search for optimal truncation length
  let left = 1;
  let right = text.length;
  let bestLength = 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const truncated = text.substring(0, mid) + '...';
    const width = estimateTextWidth(truncated, minFontSize, fontWeight);

    if (width <= availableWidth) {
      bestLength = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // Ensure minimum 10 characters visible (or less if text is shorter)
  const finalLength = Math.max(Math.min(bestLength, text.length), 10);
  const displayText = text.length > finalLength ? text.substring(0, finalLength) + '...' : text;

  return { fontSize: minFontSize, displayText };
}

/**
 * Adaptive multi-line text sizing - allows text to wrap to 2 lines
 * Finds the best font size that fits within available width and max lines
 *
 * @param text - Text to display
 * @param availableWidth - Available width in pixels
 * @param maxLines - Maximum number of lines (default 2)
 * @param fontSizes - Array of font sizes to try (descending order)
 * @param fontWeight - Font weight
 * @returns Object with optimized fontSize and whether wrapping is needed
 */
export function getAdaptiveMultilineTextSize(
  text: string,
  availableWidth: number,
  maxLines: number = 2,
  fontSizes: number[] = [12, 11, 10, 9],
  fontWeight: string = '600'
): { fontSize: number; displayText: string; needsWrapping: boolean } {
  if (!text) {
    return { fontSize: fontSizes[0], displayText: '', needsWrapping: false };
  }

  // Try each font size
  for (const fontSize of fontSizes) {
    const estimatedWidth = estimateTextWidth(text, fontSize, fontWeight);

    // Check if text fits on single line
    if (estimatedWidth <= availableWidth) {
      return { fontSize, displayText: text, needsWrapping: false };
    }

    // Check if text fits within maxLines when wrapped
    const maxWidthForLines = availableWidth * maxLines;
    if (estimatedWidth <= maxWidthForLines) {
      // Text will fit if wrapped
      return { fontSize, displayText: text, needsWrapping: true };
    }
  }

  // If still doesn't fit, use smallest size and truncate to fit within maxLines
  const minFontSize = fontSizes[fontSizes.length - 1];
  const maxWidthForLines = availableWidth * maxLines;

  // Binary search for optimal length that fits within maxLines
  let left = 1;
  let right = text.length;
  let bestLength = 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const truncated = text.substring(0, mid) + '...';
    const width = estimateTextWidth(truncated, minFontSize, fontWeight);

    if (width <= maxWidthForLines) {
      bestLength = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  const finalLength = Math.max(Math.min(bestLength, text.length), 15);
  const displayText = text.length > finalLength ? text.substring(0, finalLength) + '...' : text;

  return { fontSize: minFontSize, displayText, needsWrapping: true };
}
