/**
 * Utility functions for handling icons
 */

/**
 * Check if Font Awesome is loaded
 * @returns {boolean} True if Font Awesome is available
 */
export function isFontAwesomeLoaded() {
  // Check if Font Awesome CSS is loaded by looking for the fa class
  const testElement = document.createElement('i');
  testElement.className = 'fas fa-home';
  testElement.style.display = 'none';
  document.body.appendChild(testElement);
  
  const computedStyle = window.getComputedStyle(testElement);
  const fontFamily = computedStyle.getPropertyValue('font-family');
  
  document.body.removeChild(testElement);
  
  return fontFamily.includes('Font Awesome') || fontFamily.includes('FontAwesome');
}

/**
 * Load Font Awesome dynamically if not already loaded
 */
export function ensureFontAwesome() {
  if (!isFontAwesomeLoaded()) {
    console.log('Font Awesome not detected, loading dynamically...');
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    link.crossOrigin = 'anonymous';
    
    // Add to head
    document.head.appendChild(link);
    
    // Return a promise that resolves when loaded
    return new Promise((resolve, reject) => {
      link.onload = () => {
        console.log('Font Awesome loaded successfully');
        resolve();
      };
      link.onerror = () => {
        console.error('Failed to load Font Awesome');
        reject(new Error('Failed to load Font Awesome'));
      };
    });
  }
  
  return Promise.resolve();
}

/**
 * Get icon HTML with fallback
 * @param {string} iconClass - Font Awesome icon class (e.g., 'fas fa-home')
 * @param {string} fallbackText - Fallback text if icon fails to load
 * @returns {string} HTML string for the icon
 */
export function getIconHtml(iconClass, fallbackText = '') {
  if (isFontAwesomeLoaded()) {
    return `<i class="${iconClass}"></i>`;
  } else {
    return fallbackText ? `<span class="icon-fallback">${fallbackText}</span>` : '';
  }
}

/**
 * Replace text-based icons with Font Awesome icons
 * @param {string} text - Text that might contain icon placeholders
 * @returns {string} Text with icons replaced
 */
export function replaceTextIcons(text) {
  const iconMap = {
    '[check]': '<i class="fas fa-check"></i>',
    '[calendar]': '<i class="fas fa-calendar"></i>',
    '[arrow-right]': '<i class="fas fa-arrow-right"></i>',
    '[shield]': '<i class="fas fa-shield-alt"></i>',
    '[clock]': '<i class="fas fa-clock"></i>',
    '[headset]': '<i class="fas fa-headset"></i>',
    '[phone]': '<i class="fas fa-phone"></i>',
    '[email]': '<i class="fas fa-envelope"></i>',
    '[location]': '<i class="fas fa-map-marker-alt"></i>',
    '[user]': '<i class="fas fa-user"></i>',
    '[filter]': '<i class="fas fa-filter"></i>',
    '[tools]': '<i class="fas fa-tools"></i>',
    '[wrench]': '<i class="fas fa-wrench"></i>',
    '[cog]': '<i class="fas fa-cog"></i>'
  };
  
  let result = text;
  Object.entries(iconMap).forEach(([placeholder, icon]) => {
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), icon);
  });
  
  return result;
}