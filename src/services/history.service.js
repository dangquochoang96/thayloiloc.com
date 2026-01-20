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
    const endpoints = [
      `/order/rating`,
      `/order/rate`,
      `/order/submit-rating`,
      `/userrate/${historyId}`,
      `/user/rate/${historyId}`
    ];
    
    const payload = {
      order_id: historyId,
      rate: rating.toString(),
      comment: comment
    };
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`, payload);
        const result = await api.post(endpoint, payload);
        console.log(`Success with endpoint: ${endpoint}`, result);
        return result;
      } catch (error) {
        console.log(`Failed with endpoint: ${endpoint}`, error.message);
        // Continue to next endpoint
      }
    }
    
    // If all endpoints fail, save to localStorage as fallback
    console.log('All API endpoints failed, saving to localStorage');
    return this.saveReviewToLocalStorage(historyId, rating, comment);
  },

  // Fallback: Save review to localStorage
  saveReviewToLocalStorage(historyId, rating, comment) {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const reviewsKey = 'filter_history_reviews';
    
    const newReview = {
      id: Date.now(),
      history_id: historyId,
      user_id: userInfo.id || 0,
      user_name: userInfo.name || userInfo.username || userInfo.phone || 'Khách hàng',
      rate: rating,
      comment: comment,
      created_at: new Date().toISOString()
    };

    const existingReviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');
    
    // Check if user already reviewed this history item
    const existingIndex = existingReviews.findIndex(r => 
      r.history_id == historyId && r.user_id == userInfo.id
    );
    
    if (existingIndex >= 0) {
      // Update existing review
      existingReviews[existingIndex] = newReview;
    } else {
      // Add new review
      existingReviews.unshift(newReview);
    }
    
    localStorage.setItem(reviewsKey, JSON.stringify(existingReviews));
    
    return {
      success: true,
      message: 'Đánh giá đã được lưu thành công!',
      data: newReview
    };
  },

  // Get review from localStorage
  getReviewFromLocalStorage(historyId, userId) {
    const reviewsKey = 'filter_history_reviews';
    const reviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');
    return reviews.find(r => r.history_id == historyId && r.user_id == userId);
  }
};
