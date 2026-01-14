import { api } from "./api.js";

export const historyService = {
  // Get booking history for a specific customer - try multiple endpoints
  async getBookingHistory(userId) {
    console.log('historyService: Attempting to get booking history for user:', userId);
    
    // Try primary endpoint first
    try {
      console.log('historyService: Trying primary endpoint /tasks/customer/' + userId);
      return await api.get(`/tasks/customer/${userId}`);
    } catch (primaryError) {
      console.warn('historyService: Primary endpoint failed:', primaryError.message);
      
      // Try alternative endpoints
      try {
        console.log('historyService: Trying alternative endpoint /booking/user/' + userId);
        return await api.get(`/booking/user/${userId}`);
      } catch (altError) {
        console.warn('historyService: Alternative endpoint failed:', altError.message);
        
        // Re-throw the original error
        throw primaryError;
      }
    }
  },

  // Get booking detail by ID
  getBookingDetail(bookingId) {
    return api.get(`/tasks/${bookingId}`);
  },

  // Get filter history for a customer (products with filter cores)
  getFilterHistory(userId) {
    return api.get(`/user/listProduct/${userId}`);
  },

  // Get filter core replacement history by user ID and phone
  getFilterCoreHistoryByPhone(userId, phone) {
    return api.get(`/user/history/${userId}?phone=${phone}`);
  },

  // Get detail of a specific filter core replacement history
  getFilterHistoryDetail(historyId) {
    return api.get(`/user/detailHistory/${historyId}`);
  },

  // Update booking status (if needed)
  updateBookingStatus(bookingId, status) {
    return api.put(`/tasks/${bookingId}/status`, { status });
  },

  // Cancel booking (if needed)
  cancelBooking(bookingId, reason) {
    return api.put(`/tasks/${bookingId}/cancel`, { reason });
  }
};
