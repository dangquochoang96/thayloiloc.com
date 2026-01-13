import { api } from "./api.js";

export const historyService = {
  // Get booking history for a specific customer
  getBookingHistory(userId) {
    return api.get(`/tasks/customer/${userId}`);
  },

  // Get booking detail by ID
  getBookingDetail(bookingId) {
    return api.get(`/tasks/${bookingId}`);
  },

  // Get filter history for a customer (products with filter cores)
  getFilterHistory(userId) {
    return api.get(`/user/listProduct/${userId}`);
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
