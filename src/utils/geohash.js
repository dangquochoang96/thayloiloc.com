// Geohash utility for location-based search
// Base32 character set for geohash encoding
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encode latitude and longitude to geohash
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} precision - Geohash precision (default: 6)
 * @returns {string} Geohash string
 */
export function encodeGeohash(latitude, longitude, precision = 6) {
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';

  let latMin = -90, latMax = 90;
  let lonMin = -180, lonMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      // Longitude
      const lonMid = (lonMin + lonMax) / 2;
      if (longitude > lonMid) {
        idx = (idx << 1) + 1;
        lonMin = lonMid;
      } else {
        idx = idx << 1;
        lonMax = lonMid;
      }
    } else {
      // Latitude
      const latMid = (latMin + latMax) / 2;
      if (latitude > latMid) {
        idx = (idx << 1) + 1;
        latMin = latMid;
      } else {
        idx = idx << 1;
        latMax = latMid;
      }
    }
    evenBit = !evenBit;

    if (++bit === 5) {
      geohash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
}

/**
 * Decode geohash to latitude and longitude bounds
 * @param {string} geohash - Geohash string
 * @returns {object} Object with lat/lon bounds
 */
export function decodeGeohash(geohash) {
  let evenBit = true;
  let latMin = -90, latMax = 90;
  let lonMin = -180, lonMax = 180;

  for (let i = 0; i < geohash.length; i++) {
    const chr = geohash[i];
    const idx = BASE32.indexOf(chr);
    if (idx === -1) throw new Error('Invalid geohash');

    for (let n = 4; n >= 0; n--) {
      const bitN = (idx >> n) & 1;
      if (evenBit) {
        // Longitude
        const lonMid = (lonMin + lonMax) / 2;
        if (bitN === 1) {
          lonMin = lonMid;
        } else {
          lonMax = lonMid;
        }
      } else {
        // Latitude
        const latMid = (latMin + latMax) / 2;
        if (bitN === 1) {
          latMin = latMid;
        } else {
          latMax = latMid;
        }
      }
      evenBit = !evenBit;
    }
  }

  const lat = (latMin + latMax) / 2;
  const lon = (lonMin + lonMax) / 2;

  return {
    latitude: lat,
    longitude: lon,
    latMin,
    latMax,
    lonMin,
    lonMax
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get geohash neighbors (8 surrounding cells)
 * @param {string} geohash - Center geohash
 * @returns {array} Array of neighbor geohashes
 */
export function getGeohashNeighbors(geohash) {
  const neighbors = {
    right: { even: 'bc01fg45238967deuvhjyznpkmstqrwx', odd: 'p0r21436x8zb9dcf5h7kjnmqesgutwvy' },
    left: { even: '238967debc01fg45kmstqrwxuvhjyznp', odd: '14365h7k9dcfesgujnmqp0r2twvyx8zb' },
    top: { even: 'p0r21436x8zb9dcf5h7kjnmqesgutwvy', odd: 'bc01fg45238967deuvhjyznpkmstqrwx' },
    bottom: { even: '14365h7k9dcfesgujnmqp0r2twvyx8zb', odd: '238967debc01fg45kmstqrwxuvhjyznp' }
  };

  const borders = {
    right: { even: 'bcfguvyz', odd: 'prxz' },
    left: { even: '0145hjnp', odd: '028b' },
    top: { even: 'prxz', odd: 'bcfguvyz' },
    bottom: { even: '028b', odd: '0145hjnp' }
  };

  function getNeighbor(hash, direction) {
    const lastChar = hash.slice(-1);
    const parent = hash.slice(0, -1);
    const type = hash.length % 2 ? 'odd' : 'even';

    if (borders[direction][type].indexOf(lastChar) !== -1 && parent) {
      parent = getNeighbor(parent, direction);
    }

    return parent + BASE32[neighbors[direction][type].indexOf(lastChar)];
  }

  return [
    getNeighbor(geohash, 'top'),
    getNeighbor(geohash, 'bottom'),
    getNeighbor(geohash, 'left'),
    getNeighbor(geohash, 'right'),
    getNeighbor(getNeighbor(geohash, 'top'), 'left'),
    getNeighbor(getNeighbor(geohash, 'top'), 'right'),
    getNeighbor(getNeighbor(geohash, 'bottom'), 'left'),
    getNeighbor(getNeighbor(geohash, 'bottom'), 'right')
  ];
}

/**
 * Get user's current location
 * @returns {Promise} Promise resolving to {latitude, longitude}
 */
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn đã từ chối quyền truy cập vị trí';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng';
            break;
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu lấy vị trí đã hết thời gian';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Watch user's location continuously
 * @param {Function} onSuccess - Callback when location updates
 * @param {Function} onError - Callback when error occurs
 * @returns {number} Watch ID to clear later
 */
export function watchUserLocation(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported by your browser'));
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
    },
    (error) => {
      let errorMessage = 'Unable to retrieve your location';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Bạn đã từ chối quyền truy cập vị trí';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Thông tin vị trí không khả dụng';
          break;
        case error.TIMEOUT:
          errorMessage = 'Yêu cầu lấy vị trí đã hết thời gian';
          break;
      }
      onError(new Error(errorMessage));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000 // Cache location for 5 seconds
    }
  );

  return watchId;
}

/**
 * Stop watching user's location
 * @param {number} watchId - Watch ID returned from watchUserLocation
 */
export function clearLocationWatch(watchId) {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}
