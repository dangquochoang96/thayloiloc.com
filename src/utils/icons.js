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
        
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    link.crossOrigin = 'anonymous';
    
    // Add to head
    document.head.appendChild(link);
    
    // Return a promise that resolves when loaded
    return new Promise((resolve, reject) => {
      link.onload = () => {
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

/**
 * Shared SVG Inline illustrations for service subcategories
 * @param {string} subcategory 
 * @returns {string} Data URI SVG string
 */
export const getSubcategorySVG = (subcategory) => {
  const baseSVG = (content) => {
    const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" width="100%" height="100%">${content}</svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(rawSvg)))}`;
  };
  
  switch(subcategory) {
    case 'water_purifier':
      return baseSVG(`
        <defs>
          <linearGradient id="blueGradWater" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#60a5fa" />
            <stop offset="100%" stop-color="#2563eb" />
          </linearGradient>
        </defs>
        <rect width="200" height="180" rx="15" fill="#f0fdf4" />
        <circle cx="100" cy="90" r="50" fill="#dbeafe" opacity="0.6"/>
        <rect x="75" y="55" width="50" height="75" rx="8" fill="url(#blueGradWater)" stroke="#1e3a8a" stroke-width="3" />
        <rect x="83" y="63" width="34" height="20" rx="4" fill="#ffffff" opacity="0.8" />
        <line x1="83" y1="92" x2="117" y2="92" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <line x1="83" y1="102" x2="110" y2="102" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <path d="M125,70 C135,70 135,55 140,55 C143,55 145,58 145,63 L145,68" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
        <circle cx="145" cy="78" r="3" fill="#3b82f6" />
        <circle cx="145" cy="88" r="2" fill="#60a5fa" />
        <path d="M60,115 L45,130 C43,132 40,132 38,130 C36,128 36,125 38,123 L53,108 M55,105 C58,102 63,102 66,105 C69,108 69,113 66,116 Z" fill="none" stroke="#f97316" stroke-width="3" stroke-linecap="round" />
      `);
    case 'water_heater':
      return baseSVG(`
        <defs>
          <linearGradient id="orangeGradHeater" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f97316" />
            <stop offset="100%" stop-color="#ea580c" />
          </linearGradient>
        </defs>
        <rect width="200" height="180" rx="15" fill="#fff7ed" />
        <circle cx="100" cy="90" r="50" fill="#ffedd5" opacity="0.6"/>
        <rect x="55" y="65" width="90" height="50" rx="10" fill="url(#orangeGradHeater)" stroke="#7c2d12" stroke-width="3" />
        <rect x="65" y="75" width="70" height="8" rx="4" fill="#ffffff" opacity="0.3" />
        <line x1="80" y1="115" x2="80" y2="135" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
        <line x1="120" y1="115" x2="120" y2="135" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
        <circle cx="100" cy="95" r="10" fill="#ffffff" stroke="#7c2d12" stroke-width="2" />
        <path d="M100,95 L105,90" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
      `);
    case 'camera':
      return baseSVG(`
        <defs>
          <linearGradient id="slateGradCam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#64748b" />
            <stop offset="100%" stop-color="#334155" />
          </linearGradient>
        </defs>
        <rect width="200" height="180" rx="15" fill="#f1f5f9" />
        <circle cx="100" cy="90" r="50" fill="#e2e8f0" opacity="0.8"/>
        <path d="M60,65 L140,65 L130,90 L70,90 Z" fill="url(#slateGradCam)" stroke="#1e293b" stroke-width="3" />
        <path d="M70,90 C70,110 130,110 130,90" fill="#0f172a" opacity="0.8" stroke="#1e293b" stroke-width="3" />
        <circle cx="100" cy="95" r="16" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
        <circle cx="95" cy="90" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="120" cy="78" r="3" fill="#ef4444" />
      `);
    case 'air_purifier':
      return baseSVG(`
        <defs>
          <linearGradient id="tealGradAir" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2dd4bf" />
            <stop offset="100%" stop-color="#0d9488" />
          </linearGradient>
        </defs>
        <rect width="200" height="180" rx="15" fill="#f0fdfa" />
        <circle cx="100" cy="90" r="50" fill="#ccfbf1" opacity="0.7"/>
        <rect x="75" y="50" width="50" height="85" rx="10" fill="url(#tealGradAir)" stroke="#115e59" stroke-width="3"/>
        <circle cx="87" cy="75" r="1.5" fill="#ffffff"/>
        <circle cx="100" cy="75" r="1.5" fill="#ffffff"/>
        <circle cx="113" cy="75" r="1.5" fill="#ffffff"/>
        <circle cx="87" cy="85" r="1.5" fill="#ffffff"/>
        <circle cx="100" cy="85" r="1.5" fill="#ffffff"/>
        <circle cx="113" cy="85" r="1.5" fill="#ffffff"/>
        <circle cx="87" cy="95" r="1.5" fill="#ffffff"/>
        <circle cx="100" cy="95" r="1.5" fill="#ffffff"/>
        <circle cx="113" cy="95" r="1.5" fill="#ffffff"/>
        <path d="M70,40 C80,30 90,45 100,35 C110,25 120,40 130,30" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        <path d="M80,45 C90,38 95,50 105,42 C115,35 120,48 125,40" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round"/>
      `);
    default:
      return baseSVG(`
        <rect width="200" height="180" rx="15" fill="#f8fafc" />
        <circle cx="100" cy="90" r="40" fill="#e2e8f0"/>
        <path d="M100,65 L100,115 M75,90 L125,90" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
      `);
  }
};