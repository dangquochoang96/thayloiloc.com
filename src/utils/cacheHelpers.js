/**
 * Cache Helper Functions
 * Các helper functions để làm việc với cache dễ dàng hơn
 */

import { CacheManager, CacheStrategies } from "./cacheManager.js";

/**
 * Decorator để cache kết quả function
 */
export function cached(ttl = CacheStrategies.MEDIUM) {
  const cache = new CacheManager({ defaultTTL: ttl });

  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      const cached = cache.get(cacheKey);
      if (cached !== null) {
                return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result, ttl);
            
      return result;
    };

    return descriptor;
  };
}

/**
 * Memoize function với cache
 */
export function memoize(fn, options = {}) {
  const cache = new CacheManager({
    defaultTTL: options.ttl || CacheStrategies.MEDIUM,
    maxSize: options.maxSize || 50,
  });

  return async function (...args) {
    const cacheKey = JSON.stringify(args);
    
    const result = await cache.getOrFetch(
      cacheKey,
      () => fn.apply(this, args),
      options.ttl
    );

    return result.data;
  };
}

/**
 * Cache với stale-while-revalidate strategy
 * Trả về cache cũ ngay lập tức, fetch mới ở background
 */
export class StaleWhileRevalidateCache {
  constructor(options = {}) {
    this.cache = new CacheManager(options);
    this.revalidating = new Set();
  }

  async get(key, fetchFn, ttl = CacheStrategies.MEDIUM) {
    const cached = this.cache.get(key);

    // Nếu có cache và đang fresh, return ngay
    if (cached !== null) {
      // Kiểm tra nếu sắp hết hạn (còn 20% thời gian)
      const entry = this.cache.cache.get(key);
      const timeLeft = entry.expiresAt - Date.now();
      const shouldRevalidate = timeLeft < ttl * 0.2;

      if (shouldRevalidate && !this.revalidating.has(key)) {
        // Revalidate ở background
        this.revalidating.add(key);
        fetchFn()
          .then((data) => {
            this.cache.set(key, data, ttl);
                      })
          .catch((error) => {
            console.error(`[SWR Revalidate Error] ${key}:`, error);
          })
          .finally(() => {
            this.revalidating.delete(key);
          });
      }

      return cached;
    }

    // Không có cache, fetch mới
    const data = await fetchFn();
    this.cache.set(key, data, ttl);
    return data;
  }
}

/**
 * Cache với dependency tracking
 * Tự động invalidate khi dependencies thay đổi
 */
export class DependencyCache {
  constructor(options = {}) {
    this.cache = new CacheManager(options);
    this.dependencies = new Map(); // key -> Set of dependent keys
  }

  set(key, data, ttl, dependencies = []) {
    this.cache.set(key, data, ttl);

    // Track dependencies
    dependencies.forEach((dep) => {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, new Set());
      }
      this.dependencies.get(dep).add(key);
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  invalidate(key) {
    // Invalidate key
    this.cache.delete(key);

    // Invalidate all dependent keys
    const dependents = this.dependencies.get(key);
    if (dependents) {
      dependents.forEach((depKey) => {
        this.cache.delete(depKey);
              });
      this.dependencies.delete(key);
    }
  }
}

/**
 * Multi-level cache (Memory + LocalStorage + SessionStorage)
 */
export class MultiLevelCache {
  constructor(options = {}) {
    this.memoryCache = new CacheManager({
      ...options,
      useLocalStorage: false,
    });
    this.localCache = new CacheManager({
      ...options,
      useLocalStorage: true,
      storagePrefix: "local_cache_",
    });
    this.sessionCache = new CacheManager({
      ...options,
      useLocalStorage: false,
    });
    
    // Use sessionStorage for session cache
    this.sessionCache.storage = sessionStorage;
    this.sessionCache.storagePrefix = "session_cache_";
  }

  set(key, data, ttl, level = "memory") {
    switch (level) {
      case "memory":
        this.memoryCache.set(key, data, ttl);
        break;
      case "local":
        this.localCache.set(key, data, ttl);
        break;
      case "session":
        this.sessionCache.set(key, data, ttl);
        break;
      case "all":
        this.memoryCache.set(key, data, ttl);
        this.localCache.set(key, data, ttl);
        this.sessionCache.set(key, data, ttl);
        break;
    }
  }

  get(key) {
    // Try memory first (fastest)
    let data = this.memoryCache.get(key);
    if (data !== null) return data;

    // Try session storage
    data = this.sessionCache.get(key);
    if (data !== null) {
      // Promote to memory
      this.memoryCache.set(key, data, CacheStrategies.MEDIUM);
      return data;
    }

    // Try local storage (slowest)
    data = this.localCache.get(key);
    if (data !== null) {
      // Promote to memory and session
      this.memoryCache.set(key, data, CacheStrategies.MEDIUM);
      this.sessionCache.set(key, data, CacheStrategies.MEDIUM);
      return data;
    }

    return null;
  }

  clear(level = "all") {
    switch (level) {
      case "memory":
        this.memoryCache.clear();
        break;
      case "local":
        this.localCache.clear();
        break;
      case "session":
        this.sessionCache.clear();
        break;
      case "all":
        this.memoryCache.clear();
        this.localCache.clear();
        this.sessionCache.clear();
        break;
    }
  }
}

/**
 * Cache với compression (cho dữ liệu lớn)
 */
export class CompressedCache extends CacheManager {
  set(key, data, ttl) {
    // Compress data nếu lớn hơn 1KB
    const dataStr = JSON.stringify(data);
    const compressed = dataStr.length > 1024 ? this._compress(dataStr) : dataStr;
    
    super.set(key, { compressed: dataStr.length > 1024, data: compressed }, ttl);
  }

  get(key) {
    const entry = super.get(key);
    if (!entry) return null;

    // Decompress nếu cần
    if (entry.compressed) {
      return JSON.parse(this._decompress(entry.data));
    }
    return JSON.parse(entry.data);
  }

  _compress(str) {
    // Simple compression using LZ-based algorithm
    // In production, use a proper compression library
    return btoa(encodeURIComponent(str));
  }

  _decompress(str) {
    return decodeURIComponent(atob(str));
  }
}

/**
 * Prefetch helper - load dữ liệu trước khi cần
 */
export async function prefetchData(api, endpoints, ttl = CacheStrategies.LONG) {
  const promises = endpoints.map((endpoint) =>
    api.getCached(endpoint, ttl).catch((error) => {
      console.warn(`Prefetch failed for ${endpoint}:`, error);
      return null;
    })
  );

  const results = await Promise.all(promises);
  const successCount = results.filter((r) => r !== null).length;
  
    return results;
}

/**
 * Cache warming - làm ấm cache với dữ liệu quan trọng
 */
export async function warmCache(api, config) {
    
  const tasks = [];

  // Warm critical data
  if (config.critical) {
    tasks.push(
      ...config.critical.map((endpoint) =>
        api.getCached(endpoint, CacheStrategies.LONG)
      )
    );
  }

  // Warm frequently accessed data
  if (config.frequent) {
    tasks.push(
      ...config.frequent.map((endpoint) =>
        api.getCached(endpoint, CacheStrategies.MEDIUM)
      )
    );
  }

  const results = await Promise.allSettled(tasks);
  const successCount = results.filter((r) => r.status === "fulfilled").length;
  
    return results;
}

/**
 * Cache với automatic refresh
 */
export class AutoRefreshCache extends CacheManager {
  constructor(options = {}) {
    super(options);
    this.refreshIntervals = new Map();
  }

  setWithAutoRefresh(key, data, ttl, refreshFn, refreshInterval) {
    this.set(key, data, ttl);

    // Clear existing interval
    if (this.refreshIntervals.has(key)) {
      clearInterval(this.refreshIntervals.get(key));
    }

    // Set up auto refresh
    const intervalId = setInterval(async () => {
      try {
        const newData = await refreshFn();
        this.set(key, newData, ttl);
              } catch (error) {
        console.error(`[Auto Refresh Error] ${key}:`, error);
      }
    }, refreshInterval);

    this.refreshIntervals.set(key, intervalId);
  }

  delete(key) {
    super.delete(key);
    
    // Clear refresh interval
    if (this.refreshIntervals.has(key)) {
      clearInterval(this.refreshIntervals.get(key));
      this.refreshIntervals.delete(key);
    }
  }

  clear() {
    super.clear();
    
    // Clear all intervals
    for (const intervalId of this.refreshIntervals.values()) {
      clearInterval(intervalId);
    }
    this.refreshIntervals.clear();
  }
}
