import { defaultRequestQueue, RequestQueue } from "../utils/requestQueue.js";
import { defaultCache, CacheStrategies } from "../utils/cacheManager.js";

export class ApiClient {
  constructor(baseURL, useQueue = true, maxConcurrent = 3, useCache = true) {
    this.baseURL = baseURL;
    this.useQueue = useQueue;
    this.useCache = useCache;
    this.cache = useCache ? defaultCache : null;
    
    // Sử dụng queue mặc định hoặc tạo queue riêng
    if (useQueue) {
      if (maxConcurrent === 3) {
        this.requestQueue = defaultRequestQueue;
      } else {
        this.requestQueue = new RequestQueue(maxConcurrent);
      }
    } else {
      this.requestQueue = null;
    }
  }

  async request(endpoint, options = {}) {
    const method = options.method || "GET";
    const cacheKey = this._createCacheKey(endpoint, options);
    
    // Chỉ cache GET requests
    if (method === "GET" && this.useCache && this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
                return cached;
      }
    }

    // Nếu sử dụng queue, wrap request trong queue
    let result;
    if (this.useQueue && this.requestQueue) {
      result = await this.requestQueue.enqueue(() =>
        this._executeRequest(endpoint, options)
      );
    } else {
      result = await this._executeRequest(endpoint, options);
    }

    // Cache GET requests
    if (method === "GET" && this.useCache && this.cache) {
      const ttl = options.cacheTTL || CacheStrategies.MEDIUM;
      this.cache.set(cacheKey, result, ttl);
          }

    return result;
  }

  async _executeRequest(endpoint, options = {}) {
    let finalEndpoint = endpoint;
    if (
      endpoint.startsWith("/tasks") ||
      endpoint.startsWith("/rent-tasks") ||
      endpoint.startsWith("/order") ||
      endpoint.startsWith("/feedbacks")
    ) {
      finalEndpoint = `/socbay${endpoint}`;
    }
    const url = `${this.baseURL}${finalEndpoint}`;
    const method = options.method || "GET";
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add Auth Token if exists
    const token = localStorage.getItem("auth_token");
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
          }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Special handling for unauthorized errors
        if (response.status === 401) {
          localStorage.removeItem("user_info");
          localStorage.removeItem("auth_token");
          if (this.cache) {
            this.cache.clear();
          }
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }

        // Special handling for rate limit errors
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || '60';
          throw new Error(
            `Too Many Requests. Please try again in ${retryAfter} seconds.`
          );
        }
        
        // Create error with status info
        const error = new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      // Only log non-404 errors to keep console clean
      if (!error.message?.includes('404')) {
        console.error("API Request Error:", error);
      }
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: "GET", ...options });
  }

  /**
   * GET request với custom cache TTL
   */
  getCached(endpoint, ttl = CacheStrategies.MEDIUM) {
    return this.request(endpoint, { method: "GET", cacheTTL: ttl });
  }

  /**
   * GET request bỏ qua cache (force fresh)
   */
  getFresh(endpoint) {
    const cacheKey = this._createCacheKey(endpoint, { method: "GET" });
    if (this.cache) {
      this.cache.delete(cacheKey);
    }
    return this.request(endpoint, { method: "GET" });
  }

  post(endpoint, body) {
    // Invalidate related cache khi POST
    this._invalidateRelatedCache(endpoint);
    
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // POST with FormData (for file uploads)
  async postFormData(endpoint, formData) {
    // Invalidate related cache khi POST
    this._invalidateRelatedCache(endpoint);
    
    // Nếu sử dụng queue, wrap request trong queue
    if (this.useQueue && this.requestQueue) {
      return this.requestQueue.enqueue(() => this._executeFormDataRequest(endpoint, formData));
    }
    
    return this._executeFormDataRequest(endpoint, formData);
  }

  async _executeFormDataRequest(endpoint, formData, method = "POST") {
    let finalEndpoint = endpoint;
    if (
      endpoint.startsWith("/tasks") ||
      endpoint.startsWith("/rent-tasks") ||
      endpoint.startsWith("/order") ||
      endpoint.startsWith("/feedbacks")
    ) {
      finalEndpoint = `/socbay${endpoint}`;
    }
    const url = `${this.baseURL}${finalEndpoint}`;
    const headers = {};

    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers,
        body: formData,
      });

      if (!response.ok) {
        // Special handling for unauthorized errors
        if (response.status === 401) {
          localStorage.removeItem("user_info");
          localStorage.removeItem("auth_token");
          if (this.cache) {
            this.cache.clear();
          }
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }

        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || `Request failed with status ${response.status}`;
        
        // Nếu có chi tiết lỗi (thường là từ Laravel validation)
        if (errorData.errors) {
            const errorDetails = Object.values(errorData.errors).flat().join(", ");
            errorMessage = `${errorMessage}: ${errorDetails}`;
        } else if (errorData.messenger) {
            errorMessage = errorData.messenger;
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // Upload single image file
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    return this.postFormData("/order/upload-image", formData);
  }

  // Upload multiple images and return array of URLs
  // Queue tự động xử lý concurrency limit
  async uploadMultipleImages(files) {
    const uploadPromises = Array.from(files).map((file) =>
      this.uploadImage(file),
    );
    const results = await Promise.all(uploadPromises);
    // Extract image_link from responses
    return results.map(
      (result) => result.data?.image_link || result.image_link,
    );
  }

  /**
   * Lấy trạng thái queue (nếu đang dùng queue)
   */
  getQueueStatus() {
    if (this.useQueue && this.requestQueue) {
      return this.requestQueue.getStatus();
    }
    return null;
  }

  /**
   * Thay đổi giới hạn concurrency
   */
  setMaxConcurrent(max) {
    if (this.useQueue && this.requestQueue) {
      this.requestQueue.setMaxConcurrent(max);
    }
  }

  put(endpoint, body) {
    // Invalidate related cache khi PUT
    this._invalidateRelatedCache(endpoint);
    
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  // PUT with FormData (for file uploads)
  async putFormData(endpoint, formData) {
    // Invalidate related cache khi PUT
    this._invalidateRelatedCache(endpoint);
    
    // Nếu sử dụng queue, wrap request trong queue
    if (this.useQueue && this.requestQueue) {
      return this.requestQueue.enqueue(() => this._executeFormDataRequest(endpoint, formData, "PUT"));
    }
    
    return this._executeFormDataRequest(endpoint, formData, "PUT");
  }

  delete(endpoint) {
    // Invalidate related cache khi DELETE
    this._invalidateRelatedCache(endpoint);
    
    return this.request(endpoint, { method: "DELETE" });
  }

  /**
   * Tạo cache key từ endpoint và options
   */
  _createCacheKey(endpoint, options = {}) {
    const params = {
      endpoint,
      body: options.body,
      headers: options.headers,
    };
    return JSON.stringify(params);
  }

  /**
   * Invalidate cache liên quan khi có mutation
   */
  _invalidateRelatedCache(endpoint) {
    if (!this.cache) return;

    // Lấy base endpoint (bỏ query params và ID)
    const baseEndpoint = endpoint.split("?")[0].replace(/\/\d+$/, "");
    
    // Xóa tất cả cache có liên quan
    this.cache.clearPattern(baseEndpoint);
      }

  /**
   * Clear toàn bộ cache
   */
  clearCache() {
    if (this.cache) {
      this.cache.clear();
          }
  }

  /**
   * Lấy cache stats
   */
  getCacheStats() {
    return this.cache ? this.cache.getStats() : null;
  }
}

const API_BASE_URL = import.meta.env.DEV 
  ? "/api" 
  : "https://api.iongeyser.com/api/v1.0";

export const api = new ApiClient(API_BASE_URL);
export const geyserecoApi = new ApiClient("https://geysereco.com/api");
