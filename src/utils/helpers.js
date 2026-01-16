const EXTERNAL_URL = "https://geysereco.com";

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
    return EXTERNAL_URL + imagePath;
  }

  // Handle other API images with base URL
  const baseUrl = import.meta.env.VITE_API_URL;
  return baseUrl + imagePath;
}

/**
 * Fix relative URLs in HTML content
 * @param {string} html - HTML content with relative URLs
 * @returns {string} HTML content with fixed URLs
 */
export function fixRelativeUrls(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Fix img src
  doc.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");
    if (src && src.startsWith("/")) {
      img.src = EXTERNAL_URL + src;
    }
  });

  // Fix link href (nếu cần)
  doc.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("/")) {
      a.href = EXTERNAL_URL + href;
    }
  });

  return doc.body.innerHTML;
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
