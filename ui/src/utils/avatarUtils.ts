/**
 * Avatar utility functions for tree nodes
 * Handles avatar URL resolution and gender-based placeholder images
 */

/**
 * Default placeholder avatars for male and female
 * Using data URIs with SVG for scalable, professional-looking placeholders
 */

// Male placeholder: Blue background with white silhouette
const MALE_PLACEHOLDER = `data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='32' cy='32' r='32' fill='%233498DB'/%3E%3Cg fill='%23FFFFFF'%3E%3Ccircle cx='32' cy='24' r='8'/%3E%3Cpath d='M 20 48 Q 20 38 32 38 Q 44 38 44 48 Z'/%3E%3C/g%3E%3C/svg%3E`;

// Female placeholder: Pink/Rose background with white silhouette
const FEMALE_PLACEHOLDER = `data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23E74C3C'/%3E%3Cg fill='%23FFFFFF'%3E%3Ccircle cx='32' cy='24' r='8'/%3E%3Cpath d='M 18 48 Q 18 38 32 38 Q 46 38 46 48 Z'/%3E%3C/g%3E%3C/svg%3E`;

/**
 * Get the appropriate avatar URL for a person
 * Priority:
 * 1. If avatar is not "io.jpeg" and looks like a valid URL/path, use it
 * 2. If avatar is "io.jpeg" or invalid, use gender-based placeholder
 *
 * @param avatar - Avatar string from API
 * @param gender - Gender of the person ('Male' or 'Female')
 * @returns Avatar URL or placeholder data URI
 */
export function getAvatarUrl(avatar: string | undefined, gender?: 'Male' | 'Female'): string {
  // Check if avatar is valid (not the default "io.jpeg" and not empty)
  const isValidAvatar = avatar &&
                        avatar !== 'io.jpeg' &&
                        avatar.trim() !== '';

  if (isValidAvatar) {
    // Check if it's already a full URL
    if (avatar!.startsWith('http://') || avatar!.startsWith('https://') || avatar!.startsWith('data:')) {
      return avatar!;
    }

    // If it's a relative path, construct the URL
    // Assuming avatars are served from /api/avatars/ or similar
    // Adjust this based on your actual avatar storage strategy
    if (avatar!.startsWith('/')) {
      return avatar!;
    }

    // Otherwise, assume it's a filename and construct the path
    return `/avatars/${avatar}`;
  }

  // Use gender-based placeholder
  return gender === 'Female' ? FEMALE_PLACEHOLDER : MALE_PLACEHOLDER;
}

/**
 * Check if an avatar URL is a placeholder (not a real image)
 * Useful for conditional rendering logic
 *
 * @param avatarUrl - The avatar URL to check
 * @returns true if it's a placeholder, false otherwise
 */
export function isPlaceholderAvatar(avatarUrl: string): boolean {
  return avatarUrl === MALE_PLACEHOLDER || avatarUrl === FEMALE_PLACEHOLDER;
}

/**
 * Get avatar alt text based on person's name and gender
 *
 * @param name - Person's name
 * @param gender - Person's gender
 * @returns Alt text for the avatar image
 */
export function getAvatarAltText(name: string, gender?: 'Male' | 'Female'): string {
  return `${name}${gender ? ` (${gender})` : ''}`;
}
