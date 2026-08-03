import { api } from "./api.js";

export const notificationService = {
  /**
   * Gửi thông báo sau khi đặt lịch thành công
   * @param {Object} bookingData - Dữ liệu đặt lịch
   * @param {string} bookingData.customerName - Tên khách hàng
   * @param {string} bookingData.serviceName - Tên dịch vụ
   * @param {string} bookingData.bookingTime - Thời gian đặt lịch
   * @param {string} bookingData.address - Địa chỉ
   * @param {string} bookingData.bookingId - ID đặt lịch
   * @returns {Promise<Object>} Response từ API
   */
  async sendBookingNotification(bookingData) {
    try {
      
      // Tạo query string từ bookingData
      const queryParams = new URLSearchParams();
      Object.keys(bookingData).forEach(key => {
        if (bookingData[key]) {
          queryParams.append(key, bookingData[key]);
        }
      });

      const endpoint = `/notify/sendTopic?${queryParams.toString()}`;
      const response = await api.get(endpoint);

      if (response && response.code === 1) {
                return response;
      } else {
        console.warn('⚠️ Notification response:', response);
        return response;
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      // Không throw error để không ảnh hưởng đến flow đặt lịch
      return { success: false, error: error.message };
    }
  },

  /**
   * Format dữ liệu để gửi thông báo
   * @param {Object} booking - Thông tin booking
   * @param {Object} user - Thông tin user
   * @param {string} serviceName - Tên dịch vụ
   * @returns {Object} Dữ liệu đã format
   */
  formatBookingNotificationData(booking, user, serviceName) {
    return {
      customerName: user.username || user.name || 'Khách hàng',
      serviceName: serviceName || 'Dịch vụ',
      bookingTime: booking.time_start || '',
      address: booking.address || '',
      bookingId: booking.id || ''
    };
  }
};
