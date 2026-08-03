import { api } from './api.js';

// Cache for technicians data
let techniciansCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for ratings data
let ratingsCache = {};
let ratingsCacheTimestamp = {};
const RATINGS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes


export const SupportService = {
  /**
   * Lấy danh sách kỹ thuật viên hỗ trợ với phân trang và tìm kiếm
   * @param {number} page - Số trang (mặc định 1)
   * @param {Object} filters - Bộ lọc tìm kiếm {name, phone, address}
   * @returns {Promise<Object>} Danh sách kỹ thuật viên với thông tin phân trang
   */
  async getSupportTechnicians(page = 1, filters = {}) {
    try {
      // Build search query - combine all filters into one search string
      let searchQuery = '';
      if (filters.name || filters.phone || filters.address) {
        const searchTerms = [filters.name, filters.phone, filters.address]
          .filter(term => term && term.trim())
          .join(' ');
        searchQuery = searchTerms.trim();
      }
      
      // Build query params
      let queryParams = `page=${page}`;
      if (searchQuery) {
        queryParams += `&q=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await api.get(`/user/listAllKTV?${queryParams}`);
      const data = response.data || response;
      
      // Return data with pagination info
      return {
        data: data.data || [],
        current_page: data.current_page || page,
        last_page: data.last_page || 1,
        per_page: data.per_page || 9,
        total: data.total || (data.data ? data.data.length : 0)
      };
    } catch (error) {
      console.error('Error loading technicians:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả kỹ thuật viên (không phân trang) - dùng cho nearby mode
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise<Array>} Danh sách tất cả kỹ thuật viên
   */
  async getAllSupportTechnicians(forceRefresh = false) {
    try {
      const now = Date.now();
      if (!forceRefresh && techniciansCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
                return techniciansCache;
      }
      
            let allTechnicians = [];
      let currentPage = 1;
      let hasMoreData = true;
      
      while (hasMoreData) {
        try {
          // Use /user/listAllKTV endpoint for consistency
          const response = await api.get(`/user/listAllKTV?page=${currentPage}`);
          const data = response.data || response;
          
          if (data.data && Array.isArray(data.data)) {
            const pageData = data.data;
            
            if (pageData.length > 0) {
              allTechnicians = allTechnicians.concat(pageData);
                            
              if (data.current_page && data.last_page) {
                hasMoreData = data.current_page < data.last_page;
                              } else {
                hasMoreData = pageData.length > 0;
              }
              
              currentPage++;
            } else {
              hasMoreData = false;
            }
          } else if (Array.isArray(data)) {
            allTechnicians = data;
            hasMoreData = false;
          } else {
            hasMoreData = false;
          }
        } catch (pageError) {
          console.error('Error fetching page:', pageError);
          hasMoreData = false;
        }
        
        // Safety limit
        if (currentPage > 50) {
          console.warn('Reached page limit (50), stopping...');
          break;
        }
      }
      
            
      const result = { data: allTechnicians };
      techniciansCache = result;
      cacheTimestamp = now;
      
      return result;
    } catch (error) {
      console.error('Error loading all technicians:', error);
      
      // Return cached data if available on rate limit
      if (error.message && error.message.includes('429') && techniciansCache) {
                return techniciansCache;
      }
      
      throw error;
    }
  },

  async getListOrderRating(techId, useCache = true) {
    try {
      // Check cache first
      const now = Date.now();
      if (useCache && ratingsCache[techId] && ratingsCacheTimestamp[techId]) {
        if (now - ratingsCacheTimestamp[techId] < RATINGS_CACHE_DURATION) {
                    return ratingsCache[techId];
        }
      }

      const response = await api.get(`/order/get-list-order-rating-by-staff?user_id=${techId}`);
            const data = response.data;
            
      // Cache the result
      ratingsCache[techId] = data;
      ratingsCacheTimestamp[techId] = now;
      
      return data;
    } catch (error) {
      console.error('Error loading ratings:', error);
      
      // Return cached data if available on error
      if (ratingsCache[techId]) {
                return ratingsCache[techId];
      }
      
      throw error;
    }
  },

  // Clear ratings cache
  clearRatingsCache(techId = null) {
    if (techId) {
      delete ratingsCache[techId];
      delete ratingsCacheTimestamp[techId];
    } else {
      ratingsCache = {};
      ratingsCacheTimestamp = {};
    }
  },

  /**
   * Lấy danh sách số điện thoại kỹ thuật viên
   * @returns {Promise<Array>} Mảng các số điện thoại
   */
  async getTechnicianPhones() {
    try {
      const technicians = await this.getSupportTechnicians();
      return technicians
        .filter(tech => tech.phone && tech.phone.trim() !== '')
        .map(tech => ({
          id: tech.id,
          name: tech.name || tech.fullName || 'Kỹ thuật viên',
          phone: tech.phone,
          area: tech.area || tech.region || 'Toàn quốc',
          status: tech.status || 'active'
        }));
    } catch (error) {
      console.error('Lỗi khi lấy số điện thoại kỹ thuật viên:', error);
      throw error;
    }
  },

  /**
   * Lọc kỹ thuật viên theo khu vực
   * @param {string} area - Khu vực cần lọc
   * @returns {Promise<Array>} Danh sách kỹ thuật viên theo khu vực
   */
  async getTechniciansByArea(area) {
    try {
      const phones = await this.getTechnicianPhones();
      return phones.filter(tech => 
        tech.area.toLowerCase().includes(area.toLowerCase())
      );
    } catch (error) {
      console.error('Lỗi khi lọc kỹ thuật viên theo khu vực:', error);
      throw error;
    }
  },
}