/**
 * Geocoding utilities for converting addresses to coordinates
 * Using OpenStreetMap Nominatim API (free, no API key required)
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const CACHE_KEY = 'geocoding_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Get cached geocoding results
 */
function getCache() {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return {};
    
    const parsed = JSON.parse(cache);
    const now = Date.now();
    
    // Remove expired entries
    Object.keys(parsed).forEach(key => {
      if (parsed[key].timestamp + CACHE_EXPIRY < now) {
        delete parsed[key];
      }
    });
    
    return parsed;
  } catch (error) {
    console.error('Error reading geocoding cache:', error);
    return {};
  }
}

/**
 * Save to cache
 */
function saveToCache(address, result) {
  try {
    const cache = getCache();
    cache[address] = {
      ...result,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving to geocoding cache:', error);
  }
}

/**
 * Geocode an address to coordinates using Nominatim
 * @param {string} address - Address to geocode
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export async function geocodeAddress(address) {
  if (!address || address.trim() === '') {
    throw new Error('Address is required');
  }

  // Clean address: remove ||| separators
  const cleanAddress = address.replace(/\|+/g, ' ').trim();

  // Check cache first
  const cache = getCache();
  const cacheKey = cleanAddress.toLowerCase().trim();
  
  if (cache[cacheKey]) {
    return {
      latitude: cache[cacheKey].latitude,
      longitude: cache[cacheKey].longitude
    };
  }

  try {
    // Try with Vietnam suffix first
    const searchQuery = `${cleanAddress}, Vietnam`;
    const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=vn`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WaterFilterApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Address not found');
    }

    const result = {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon)
    };

    saveToCache(cacheKey, result);

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Batch geocode multiple addresses
 * @param {Array<{id: string, address: string}>} items - Items with addresses
 * @returns {Promise<Array>} Items with coordinates added
 */
export async function batchGeocode(items) {
  const results = [];
  
  for (const item of items) {
    try {
      if (item.address) {
        const coords = await geocodeAddress(item.address);
        results.push({
          ...item,
          latitude: coords.latitude,
          longitude: coords.longitude,
          geocoded: true
        });
      } else {
        results.push({
          ...item,
          geocoded: false
        });
      }
      
      // Rate limiting: wait 1 second between requests (Nominatim requirement)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to geocode address for item ${item.id}:`, error);
      results.push({
        ...item,
        geocoded: false
      });
    }
  }
  
  return results;
}

/**
 * Parse Vietnamese address to extract city/province
 * @param {string} address - Full address
 * @returns {string} City/province name
 */
export function extractCity(address) {
  if (!address) return '';
  
  const cities = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Lâm Đồng', 'Nghệ An',
    'Thừa Thiên Huế', 'Quảng Nam', 'Quảng Ninh', 'Bà Rịa Vũng Tàu',
    'Hà Đông', 'Dĩ An'
  ];
  
  for (const city of cities) {
    if (address.includes(city)) {
      return city;
    }
  }
  
  return '';
}

/**
 * Clear geocoding cache
 */
export function clearGeocodeCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing geocoding cache:', error);
  }
}
