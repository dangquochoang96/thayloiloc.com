import { api } from "./api.js";
import { authService } from "./auth.service.js";

export const bookingService = {
  // Lấy chi tiết booking theo ID
  async getBookingDetail(bookingId) {
    try {
      console.log(`Fetching booking detail for ID: ${bookingId}`);
      const response = await api.get(`/tasks/${bookingId}`);
      console.log('API Response:', response);
      
      // Handle different response formats
      if (response && response.code === 1 && response.data) {
        console.log('Using response.data:', response.data);
        return response.data;
      } else if (response && !response.code) {
        // Direct data response
        console.log('Using direct response:', response);
        return response;
      } else {
        console.warn('Unexpected response format:', response);
        throw new Error(response?.message || "Không thể lấy thông tin đặt lịch");
      }
    } catch (error) {
      console.error('Booking service error details:', {
        message: error.message,
        stack: error.stack,
        bookingId: bookingId
      });
      
      // Re-throw with more specific error message
      if (error.message.includes('fetch')) {
        throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else if (error.message.includes('404')) {
        throw new Error(`Không tìm thấy thông tin đặt lịch #${bookingId}`);
      } else {
        throw new Error(error.message || "Có lỗi xảy ra khi tải thông tin đặt lịch");
      }
    }
  },

  // Lấy danh sách booking của user
  async getUserBookings() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await api.get(`/tasks/customer/${user.id}`);
      if (response.code === 1) {
        return response.data || [];
      } else {
        throw new Error(response.message || "Không thể lấy danh sách đặt lịch");
      }
    } catch (error) {
      console.error('getUserBookings error:', error);
      throw error;
    }
  },

  // Hủy booking
  async cancelBooking(bookingId, reason = "") {
    try {
      const response = await api.put(`/tasks/${bookingId}/cancel`, {
        reason: reason
      });
      if (response.code === 1) {
        return response.data;
      } else {
        throw new Error(response.message || "Không thể hủy đặt lịch");
      }
    } catch (error) {
      console.error('cancelBooking error:', error);
      throw error;
    }
  },

  // Đánh giá dịch vụ
  async rateService(bookingId, rating, comment = "") {
    try {
      const response = await api.post(`/tasks/${bookingId}/rate`, {
        rating: rating,
        comment: comment
      });
      if (response.code === 1) {
        return response.data;
      } else {
        throw new Error(response.message || "Không thể gửi đánh giá");
      }
    } catch (error) {
      console.error('rateService error:', error);
      throw error;
    }
  },

  // Lấy trạng thái booking
  getStatusText(status) {
    const statusMap = {
      'pending': 'Đang chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'in_progress': 'Đang thực hiện',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'rejected': 'Bị từ chối'
    };
    return statusMap[status] || 'Không xác định';
  },

  // Lấy icon trạng thái
  getStatusIcon(status) {
    const iconMap = {
      'pending': 'fa-clock',
      'confirmed': 'fa-check-circle',
      'in_progress': 'fa-cog fa-spin',
      'completed': 'fa-check-double',
      'cancelled': 'fa-times-circle',
      'rejected': 'fa-ban'
    };
    return iconMap[status] || 'fa-question-circle';
  },

  // Lấy class CSS cho trạng thái
  getStatusClass(status) {
    const classMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'in_progress': 'status-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'rejected': 'status-rejected'
    };
    return classMap[status] || 'status-unknown';
  }
};