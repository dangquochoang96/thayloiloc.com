import { api } from './api.js';

export const SupportService = {
  /**
   * Lấy danh sách kỹ thuật viên hỗ trợ
   * @returns {Promise<Array>} Danh sách kỹ thuật viên với thông tin liên hệ
   */
  async getSupportTechnicians() {
    try {
      const response = await api.get('/user/support');
      return response.data || response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kỹ thuật viên:', error);
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