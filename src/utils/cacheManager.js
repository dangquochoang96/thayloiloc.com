/**
 * Cache Manager
 * Quản lý cache dữ liệu với TTL (Time To Live) và các chiến lược cache khác nhau
 */

export class CacheManager {
  constructor(options = {}) {
    this.cache = new Map();
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 phút
    this.maxSize = options.maxSize || 100; // Số lượng items tối đa
    this.storage = options.useLocalStorage ? localStorage : null;
    this.storagePrefix = options.storagePrefix || "cache_";
  }

  /**
   * Tạo cache key từ endpoint và params
   */
  _createKey(endpoint, params = {}) {
    const paramStr = JSON.stringify(params);
    return `${endpoint}:${paramStr}`;
  }

  /**
   * Lưu dữ liệu vào cache
   */
  set(key, data, ttl = this.defaultTTL) {
    // Kiểm tra size limit
    if (this.cache.size >= this.maxSize) {
      this._evictOldest();
    }

    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, cacheEntry);

    // Lưu vào localStorage nếu được bật
    if (this.storage) {
      try {
        this.storage.setItem(
          this.storagePrefix + key,
          JSON.stringify(cacheEntry)
        );
      } catch (error) {
        console.warn("Failed to save to localStorage:", error);
      }
    }
  }

  /**
   * Lấy dữ liệu từ cache
   */
  get(key) {
    // Kiểm tra memory cache trước
    let cacheEntry = this.cache.get(key);

    // Nếu không có trong memory, thử localStorage
    if (!cacheEntry && this.storage) {
      try {
        const stored = this.storage.getItem(this.storagePrefix + key);
        if (stored) {
          cacheEntry = JSON.parse(stored);
          // Restore vào memory cache
          this.cache.set(key, cacheEntry);
        }
      } catch (error) {
        console.warn("Failed to read from localStorage:", error);
      }
    }

    if (!cacheEntry) {
      return null;
    }

    // Kiểm tra expiration
    if (Date.now() > cacheEntry.expiresAt) {
      this.delete(key);
      return null;
    }

    return cacheEntry.data;
  }

  /**
   * Kiểm tra cache có tồn tại và còn valid không
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Xóa một cache entry
   */
  delete(key) {
    this.cache.delete(key);
    if (this.storage) {
      this.storage.removeItem(this.storagePrefix + key);
    }
  }

  /**
   * Xóa tất cả cache
   */
  clear() {
    this.cache.clear();
    if (this.storage) {
      // Xóa tất cả keys có prefix
      const keysToRemove = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => this.storage.removeItem(key));
    }
  }

  /**
   * Xóa cache theo pattern
   */
  clearPattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];

    // Memory cache
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.delete(key));
  }

  /**
   * Evict oldest entry khi đạt max size
   */
  _evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Lấy thông tin cache stats
   */
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      maxSize: this.maxSize,
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.delete(key));
    return keysToDelete.length;
  }

  /**
   * Get or fetch pattern - lấy từ cache hoặc fetch mới
   */
  async getOrFetch(key, fetchFn, ttl = this.defaultTTL) {
    // Kiểm tra cache trước
    const cached = this.get(key);
    if (cached !== null) {
      return { data: cached, fromCache: true };
    }

    // Fetch mới
    const data = await fetchFn();
    this.set(key, data, ttl);
    return { data, fromCache: false };
  }

  /**
   * Invalidate cache khi có update
   */
  invalidate(keys) {
    if (Array.isArray(keys)) {
      keys.forEach((key) => this.delete(key));
    } else {
      this.delete(keys);
    }
  }
}

/**
 * Cache Strategy Presets
 */
export const CacheStrategies = {
  // Cache ngắn hạn (1 phút) - cho dữ liệu thay đổi thường xuyên
  SHORT: 1 * 60 * 1000,

  // Cache trung bình (5 phút) - mặc định
  MEDIUM: 5 * 60 * 1000,

  // Cache dài hạn (30 phút) - cho dữ liệu ít thay đổi
  LONG: 30 * 60 * 1000,

  // Cache rất dài (1 giờ) - cho dữ liệu static
  VERY_LONG: 60 * 60 * 1000,

  // Cache vĩnh viễn (1 ngày) - cho dữ liệu không đổi
  PERMANENT: 24 * 60 * 60 * 1000,
};

// Default cache instance
export const defaultCache = new CacheManager({
  defaultTTL: CacheStrategies.MEDIUM,
  maxSize: 100,
  useLocalStorage: true,
  storagePrefix: "api_cache_",
});

// Cleanup expired cache mỗi 5 phút
setInterval(() => {
  const cleaned = defaultCache.cleanup();
  if (cleaned > 0) {
      }
}, 5 * 60 * 1000);
