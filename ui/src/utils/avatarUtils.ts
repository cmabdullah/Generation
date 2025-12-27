/**
 * Avatar utility functions for tree nodes
 * Handles avatar URL resolution and gender-based placeholder images
 */

/**
 * Default placeholder avatars for male and female
 * Uses SVG avatars (work immediately) or PNG if user provides custom images
 */

// Male placeholder: Blue avatar with male silhouette (SVG - works immediately!)
// Replace with male-avatar.png if you have a custom image
const MALE_PLACEHOLDER = '/avatars/male-avatar.svg';

// Female placeholder: Red avatar with female silhouette (SVG - works immediately!)
// Replace with female-avatar.png if you have a custom image
const FEMALE_PLACEHOLDER = '/avatars/female-avatar.svg';

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
