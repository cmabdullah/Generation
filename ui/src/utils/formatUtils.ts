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
