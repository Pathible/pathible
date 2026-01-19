/**
 * Content Utilities
 *
 * Utility functions for content manipulation, including
 * truncation for subscriber article teasers.
 */

/**
 * Truncate content to approximately a given number of words.
 * Used for creating subscriber article teasers on public pages.
 *
 * @param content - The full content string
 * @param wordLimit - Maximum number of words (default: 200)
 * @returns Object with truncated content and whether truncation occurred
 */
export function truncateContent(
  content: string,
  wordLimit = 200,
): { content: string; isTruncated: boolean } {
  if (!content) {
    return { content: "", isTruncated: false };
  }

  const words = content.split(/\s+/).filter((word) => word.length > 0);

  if (words.length <= wordLimit) {
    return { content, isTruncated: false };
  }

  return {
    content: `${words.slice(0, wordLimit).join(" ")}...`,
    isTruncated: true,
  };
}

/**
 * Calculate estimated read time in minutes based on word count.
 * Uses average reading speed of 200 words per minute.
 *
 * @param content - The content string
 * @returns Estimated read time in minutes (minimum 1)
 */
export function calculateReadTime(content: string): number {
  if (!content) return 1;

  const words = content.split(/\s+/).filter((word) => word.length > 0);
  const readTimeMinutes = Math.ceil(words.length / 200);

  return Math.max(1, readTimeMinutes);
}

/**
 * Count words in a content string.
 *
 * @param content - The content string
 * @returns Word count
 */
export function countWords(content: string): number {
  if (!content) return 0;
  return content.split(/\s+/).filter((word) => word.length > 0).length;
}
