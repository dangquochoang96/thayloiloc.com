import { api } from "./api.js";

export const historyService = {
  // Get booking history for a specific customer - try multiple endpoints
  async getBookingHistory(userId) {
    console.log(
      "historyService: Attempting to get booking history for user:",
      userId,
    );

    // Try primary endpoint first
    try {
      console.log(
        "historyService: Trying primary endpoint /tasks/customer/" + userId,
      );
      return await api.get(`/tasks/customer/${userId}`);
    } catch (primaryError) {
      console.warn(
        "historyService: Primary endpoint failed:",
        primaryError.message,
      );
    }
  },

  // Get list order by customer
  async getListOrderByCustomer(userId) {
    return api.get(`/order/list-order-by-customer/${userId}`);
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
  getFilterCoreHistoryByPhone(productId, phone) {
    return api.get(`/user/history/${productId}?phone=${phone}`);
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
  },

  // Submit rating and review for a history item
  async submitReview(historyId, rating, comment) {
    // Get user info from localStorage first to get user ID
    const localUserInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const userId = localUserInfo.id || localUserInfo.user_id;
    
    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }
    
    try {
      
      const payload = {
        rate: parseInt(rating),
        comment: comment
      };
      
      console.log(`Submitting review for user ${userId}, history ${historyId}:`, payload);
      const result = await api.post(`/user/rate/${userId}/${historyId}`, payload);
      console.log('Review submitted successfully:', result);
      return result;
    } catch (error) {
      console.log('API call failed, saving to localStorage as fallback:', error.message);
    }
  },

};
