// Review Service - Lưu đánh giá vào localStorage
const REVIEWS_KEY = 'technician_reviews';

export const reviewService = {
  // Lấy tất cả reviews
  getAllReviews() {
    const reviews = localStorage.getItem(REVIEWS_KEY);
    return reviews ? JSON.parse(reviews) : [];
  },

  // Lấy reviews theo technician ID
  getReviewsByTechId(techId) {
    const allReviews = this.getAllReviews();
    return allReviews.filter(r => r.tech_id == techId);
  },

  // Thêm review mới
  addReview(techId, rating, comment) {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    
    const newReview = {
      id: Date.now(),
      tech_id: techId,
      user_id: userInfo.id || 0,
      user_name: userInfo.name || userInfo.username || userInfo.phone || 'Khách hàng',
      user_avatar: userInfo.avatar || userInfo.avartar || null,
      rating: rating,
      comment: comment,
      created_at: new Date().toISOString()
    };

    const allReviews = this.getAllReviews();
    allReviews.unshift(newReview); // Thêm vào đầu
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));
    
    return newReview;
  },

  // Tính rating trung bình
  getAverageRating(techId) {
    const reviews = this.getReviewsByTechId(techId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  },

  // Kiểm tra user đã review chưa
  hasUserReviewed(techId, userId) {
    const reviews = this.getReviewsByTechId(techId);
    return reviews.some(r => r.user_id == userId);
  },

  // Xóa review (nếu cần)
  deleteReview(reviewId) {
    const allReviews = this.getAllReviews();
    const filtered = allReviews.filter(r => r.id !== reviewId);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(filtered));
  }
};
