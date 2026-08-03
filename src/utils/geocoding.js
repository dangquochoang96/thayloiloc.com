/**
 * Geocoding utilities for converting addresses to coordinates
 * Using OpenStreetMap Nominatim API & BigDataCloud (CORS-friendly)
 * Enhanced with 0ms Instant Local Dictionary Matching & Diacritics Stripping
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const BIGDATACLOUD_BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
const CACHE_KEY = 'geocoding_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export function stripVietnameseDiacritics(str) {
  if (!str) return '';
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

const HANOI_DISTRICTS_COORDS = [
  { name: "Hà Đông", lat: 20.9712, lon: 105.7765 },
  { name: "Thanh Xuân", lat: 20.9953, lon: 105.8070 },
  { name: "Cầu Giấy", lat: 21.0362, lon: 105.7906 },
  { name: "Nam Từ Liêm", lat: 21.0142, lon: 105.7644 },
  { name: "Bắc Từ Liêm", lat: 21.0667, lon: 105.7533 },
  { name: "Từ Liêm", lat: 21.0350, lon: 105.7600 },
  { name: "Đống Đa", lat: 21.0167, lon: 105.8250 },
  { name: "Hai Bà Trưng", lat: 21.0100, lon: 105.8500 },
  { name: "Hoàng Mai", lat: 20.9781, lon: 105.8575 },
  { name: "Tây Hồ", lat: 21.0650, lon: 105.8200 },
  { name: "Hoàn Kiếm", lat: 21.0285, lon: 105.8542 },
  { name: "Ba Đình", lat: 21.0333, lon: 105.8333 },
  { name: "Long Biên", lat: 21.0417, lon: 105.8917 },
  { name: "Thanh Trì", lat: 20.9500, lon: 105.8500 },
  { name: "Thanh Hà", lat: 20.9412, lon: 105.7950 },
  { name: "Tân Lập", lat: 21.0850, lon: 105.7050 },
  { name: "Tân Tây Đô", lat: 21.0850, lon: 105.7050 },
  { name: "Mỹ Đình", lat: 21.0280, lon: 105.7780 },
  { name: "Linh Đàm", lat: 20.9650, lon: 105.8300 },
  { name: "Hữu Lê", lat: 20.9500, lon: 105.8200 },
  { name: "Hữu Hoà", lat: 20.9500, lon: 105.8200 },
  { name: "Đông Anh", lat: 21.1378, lon: 105.8475 },
  { name: "Gia Lâm", lat: 21.0189, lon: 105.9525 },
  { name: "Hoài Đức", lat: 21.0200, lon: 105.6980 },
  { name: "Đan Phượng", lat: 21.0967, lon: 105.6739 },
  { name: "Thường Tín", lat: 20.8750, lon: 105.8600 },
  { name: "Chương Mỹ", lat: 20.9100, lon: 105.7000 },
  { name: "Phú Xuyên", lat: 20.7300, lon: 105.9000 },
  { name: "Thạch Thất", lat: 21.0000, lon: 105.5300 },
  { name: "Quốc Oai", lat: 20.9800, lon: 105.6300 },
  { name: "Mê Linh", lat: 21.1700, lon: 105.7100 },
  { name: "Sóc Sơn", lat: 21.2500, lon: 105.8500 },
  { name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  { name: "Hà Tĩnh", lat: 18.3431, lon: 105.9058 },
  { name: "Dĩ An", lat: 10.9073, lon: 106.7720 },
  { name: "Bình Dương", lat: 11.0000, lon: 106.6500 }
];

const DEFAULT_HQ_COORDS = { latitude: 20.9712, longitude: 105.7765 };

/**
 * Get nearest Hanoi district by coordinates
 */
export function getNearestHanoiDistrict(latitude, longitude) {
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  let closest = HANOI_DISTRICTS_COORDS[0];
  let minDistance = Infinity;

  for (const district of HANOI_DISTRICTS_COORDS) {
    const dist = calculateDistance(latitude, longitude, district.lat, district.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = district;
    }
  }

  return { name: closest.name, distanceKm: minDistance };
}

/**
 * Get cached geocoding results
 */
function getCache() {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return {};
    
    const parsed = JSON.parse(cache);
    const now = Date.now();
    
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
 * Geocode an address to coordinates using Nominatim & Smart Multi-tier Fallback
 * @param {string} address - Address to geocode
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export async function geocodeAddress(address) {
  if (!address || address.trim() === '') {
    throw new Error('Address is required');
  }

  const rawAddress = address.replace(/\|+/g, ' ').trim();
  const lowerAddress = rawAddress.toLowerCase();
  const strippedAddress = stripVietnameseDiacritics(rawAddress);
  // Tier 1: Check for Warehouse / Pickup Keywords (map to HQ Hà Đông)
  if (
    lowerAddress.includes('lấy hàng tại kho') ||
    lowerAddress.includes('tại kho') ||
    lowerAddress.includes('nhận tại kho') ||
    lowerAddress.includes('kho hàng') ||
    lowerAddress.includes('kho tổng')
  ) {
    return DEFAULT_HQ_COORDS;
  }

  // Tier 2: Instant Local District & Area Matching (0ms latency, static truth)
  for (const district of HANOI_DISTRICTS_COORDS) {
    const distLower = district.name.toLowerCase();
    const distStripped = stripVietnameseDiacritics(district.name);

    if (lowerAddress.includes(distLower) || strippedAddress.includes(distStripped) || distStripped.includes(strippedAddress)) {
      return { latitude: district.lat, longitude: district.lon };
    }
  }

  // Tier 3: Check Cache for non-standard custom addresses
  const cache = getCache();
  const cacheKey = strippedAddress;
  
  if (cache[cacheKey] && cache[cacheKey].latitude && cache[cacheKey].longitude) {
    return {
      latitude: cache[cacheKey].latitude,
      longitude: cache[cacheKey].longitude
    };
  }

  // Helper function to query Nominatim
  const queryNominatim = async (queryText) => {
    try {
      const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(queryText)}&limit=1&countrycodes=vn`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
    } catch (e) {
      console.warn(`Nominatim search error for query "${queryText}":`, e);
    }
    return null;
  };

  // Build sanitized candidate queries:
  const cleanedAddress = rawAddress.replace(/-/g, ',').replace(/\s+/g, ' ').trim();
  const candidates = [
    `${cleanedAddress}, Vietnam`,
    `${rawAddress}, Vietnam`
  ];

  // Extract sub-parts by splitting comma
  const parts = cleanedAddress.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    candidates.push(`${parts.slice(-1).join(', ')}, Vietnam`);
  }

  // Try candidates sequentially
  for (const query of candidates) {
    const coords = await queryNominatim(query);
    if (coords) {
      saveToCache(cacheKey, coords);
      return coords;
    }
  }

  // Default Fallback: HQ Coords
  saveToCache(cacheKey, DEFAULT_HQ_COORDS);
  return DEFAULT_HQ_COORDS;
}

/**
 * Batch geocode multiple addresses
 */
export async function batchGeocode(items) {
  const results = [];
  for (const item of items) {
    try {
      if (item.address) {
        const coords = await geocodeAddress(item.address);
        results.push({ ...item, latitude: coords.latitude, longitude: coords.longitude, geocoded: true });
      } else {
        results.push({ ...item, geocoded: false });
      }
    } catch (error) {
      results.push({ ...item, geocoded: false });
    }
  }
  return results;
}

/**
 * Parse Vietnamese address to extract city/province
 */
export function extractCity(address) {
  if (!address) return '';
  const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Hà Đông', 'Bình Dương'];
  for (const city of cities) {
    if (address.includes(city)) return city;
  }
  return '';
}

/**
 * Reverse geocode coordinates
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `${BIGDATACLOUD_BASE_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=vi`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        const districtName = data.locality || data.city || data.principalSubdivision || '';
        return { address: { city_district: districtName, district: districtName, city: data.city || 'Hà Nội' }, raw: data };
      }
    }
  } catch (err) {}

  const nearest = getNearestHanoiDistrict(latitude, longitude);
  return { address: { city_district: nearest.name, district: nearest.name, city: 'Hà Nội' }, isFallback: true };
}

export function clearGeocodeCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {}
}

/**
 * Reverse geocode coordinates to human readable text address in Vietnamese
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} Text address string
 */
export async function reverseGeocodeText(latitude, longitude) {
  // 1. Try BigDataCloud reverse geocoding API (matching ServiceQuotationPage logic)
  try {
    const url = `${BIGDATACLOUD_BASE_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=vi`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        const locality = data.locality || data.subLocality || data.localityInfo?.administrative?.[3]?.name || '';
        const district = data.city || data.localityInfo?.administrative?.[2]?.name || data.localityInfo?.administrative?.[1]?.name || '';
        const province = data.principalSubdivision || 'Hà Nội';

        const parts = [locality, district, province, "Việt Nam"].filter(Boolean);
        const uniqueParts = [...new Set(parts)];
        if (uniqueParts.length > 0) {
          return uniqueParts.join(", ");
        }
      }
    }
  } catch (err) {
    console.warn("BigDataCloud reverse geocode error:", err);
  }

  // 2. Try Nominatim reverse geocoding API
  try {
    const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=vi`;
    const response = await fetch(url, { headers: { 'User-Agent': 'ThayLoiLocApp/1.0' } });
    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.pedestrian || addr.suburb || addr.quarter || addr.neighbourhood || addr.amenity || addr.building || '';
        const ward = addr.subdistrict || addr.ward || addr.village || addr.commune || '';
        const district = addr.city_district || addr.district || addr.county || addr.town || '';
        const city = addr.city || addr.province || addr.state || 'Hà Nội';

        const parts = [street, ward, district, city, "Việt Nam"].filter(Boolean);
        const uniqueParts = [...new Set(parts)];
        if (uniqueParts.length > 0) {
          return uniqueParts.join(", ");
        }
      }
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode error:", err);
  }

  // 3. Fallback: Hanoi nearest district
  const nearest = getNearestHanoiDistrict(latitude, longitude);
  return `${nearest.name}, Hà Nội, Việt Nam`;
}

// Automatically clear stale geocode cache on module init
clearGeocodeCache();
