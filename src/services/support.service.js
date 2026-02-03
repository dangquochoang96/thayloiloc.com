import { api } from './api.js';

// Cache for technicians data
let techniciansCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const SupportService = {
  /**
   * Lấy danh sách kỹ thuật viên hỗ trợ
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise<Array>} Danh sách kỹ thuật viên với thông tin liên hệ
   */
  async getSupportTechnicians(forceRefresh = false) {
    try {
      // Check cache first
      const now = Date.now();
      if (!forceRefresh && techniciansCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
        console.log('📦 Using cached technicians data');
        return techniciansCache;
      }

      console.log('🔄 Fetching fresh technicians data');
      const response = await api.get('/user/support');
      const data = response.data || response;
      
      // Update cache
      techniciansCache = data;
      cacheTimestamp = now;
      
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kỹ thuật viên:', error);
      
      // If rate limited and we have cache, return cache
      if (error.message && error.message.includes('429') && techniciansCache) {
        console.log('⚠️ Rate limited, using cached data');
        return techniciansCache;
      }
      
      throw error;
    }
  },

  async getListOrderRating(techId) {
    try {
      const response = await api.get(`/order/get-list-order-rating-by-staff?user_id=${techId}`);
      console.log('List of order ratings:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng đánh giá:', error);
      throw error;
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