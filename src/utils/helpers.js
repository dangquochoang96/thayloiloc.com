/**
 * Get the full image URL from relative or absolute path
 * @param {string} imagePath - Image path from API (can be relative or absolute)
 * @param {string} fallbackImage - Fallback image path if no image provided
 * @returns {string} Full image URL
 */
export function getImageUrl(imagePath, fallbackImage = "/images/logo.png") {
  if (!imagePath) {
    return fallbackImage;
  }

  // If already absolute URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Handle Geysereco API images (they start with /public/uploads/)
  if (imagePath.startsWith("/public/uploads/")) {
    return "https://geysereco.com" + imagePath;
  }

  // Handle other API images with base URL
  const baseUrl = import.meta.env.VITE_API_URL;
  return baseUrl + imagePath;
}

/**
 * Format date string to Vietnamese locale
 * @param {string} dateStr - Date string to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  } catch (e) {
    return dateStr;
  }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate (can contain HTML)
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength) {
  if (!text) return "";
  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, "");
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
}
