import { api } from '../services/api.js';
import '../styles/hotline/technician-detail.css';

export function TechnicianDetailPage() {
  const container = document.createElement('div');
  container.className = 'technician-detail-wrapper';

  // Header with back button
  const header = document.createElement('header');
  header.className = 'tech-detail-header';
  header.innerHTML = `
    <button class="back-btn" onclick="history.back()">
      <i class="fas fa-arrow-left"></i>
    </button>
    <h1>Thông tin kỹ thuật viên</h1>
    <div class="header-spacer"></div>
  `;
  container.appendChild(header);

  const main = document.createElement('main');
  main.className = 'tech-detail-main';
  main.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải thông tin...</p>
    </div>
  `;
  container.appendChild(main);

  // Get technician ID from URL
  setTimeout(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const techId = urlParams.get('id');
    
    if (techId) {
      loadTechnicianDetail(techId, main);
    } else {
      main.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Không tìm thấy thông tin kỹ thuật viên</p>
          <a href="#/hotline" class="back-link">Quay lại danh sách</a>
        </div>
      `;
    }
  }, 100);

  return container;
}

function loadTechnicianDetail(techId, mainEl) {
  api.get('/user/support')
    .then(data => {
      const technicians = data.data || data || [];
      const tech = technicians.find(t => t.id == techId);
      
      if (tech) {
        renderTechnicianDetail(tech, mainEl);
      } else {
        mainEl.innerHTML = `
          <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Không tìm thấy kỹ thuật viên</p>
            <a href="#/hotline" class="back-link">Quay lại danh sách</a>
          </div>
        `;
      }
    })
    .catch(() => {
      mainEl.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Lỗi khi tải thông tin</p>
          <a href="#/hotline" class="back-link">Quay lại danh sách</a>
        </div>
      `;
    });
}

function renderTechnicianDetail(tech, mainEl) {
  const avatarUrl = tech.avartar 
    ? `https://api.chothuetatca.com${tech.avartar}` 
    : null;

  mainEl.innerHTML = `
    <!-- Profile Card -->
    <div class="tech-profile-card">
      <div class="profile-avatar">
        ${avatarUrl 
          ? `<img src="${avatarUrl}" alt="${tech.username}">` 
          : `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`
        }
      </div>
      <div class="profile-info">
        <h2 class="tech-name">${tech.username || 'Kỹ thuật viên'}</h2>
        <a href="tel:${tech.phone}" class="tech-phone">${tech.phone || ''}</a>
        <div class="tech-rating" id="techRating">
          <i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>
          <span class="rating-count">(0 đánh giá)</span>
        </div>
      </div>
    </div>

    <!-- Technical Info -->
    <div class="info-section">
      <h3 class="section-title">Thông tin kỹ thuật</h3>
      <div class="info-item ${tech.phone_verified ? 'verified' : 'not-verified'}">
        <i class="fas fa-${tech.phone_verified ? 'check-circle' : 'times-circle'}"></i>
        <span>Đã xác minh số điện thoại</span>
      </div>
      <div class="info-item ${tech.id_verified ? 'verified' : 'not-verified'}">
        <i class="fas fa-${tech.id_verified ? 'check-circle' : 'times-circle'}"></i>
        <span>Đã xác minh chứng minh thư</span>
      </div>
    </div>

    <!-- Services -->
    <div class="info-section">
      <h3 class="section-title">Dịch vụ cung cấp</h3>
      <div class="services-list">
        ${tech.services && tech.services.length > 0 
          ? tech.services.map(s => `<span class="service-tag">${s}</span>`).join('')
          : '<span class="empty-text">Trống!</span>'
        }
      </div>
    </div>

    <!-- Area -->
    <div class="info-section">
      <h3 class="section-title">Khu vực</h3>
      <div class="area-list">
        ${tech.areas && tech.areas.length > 0 
          ? tech.areas.map(a => `<span class="area-tag">${a}</span>`).join('')
          : '<span class="empty-text">Chưa cập nhật</span>'
        }
      </div>
    </div>

    <!-- Favorite -->
    <div class="favorite-section">
      <span>Lưu vào mục ưa thích</span>
      <button class="favorite-btn ${tech.is_favorite ? 'active' : ''}" data-tech-id="${tech.id}">
        <i class="fa${tech.is_favorite ? 's' : 'r'} fa-heart"></i>
      </button>
    </div>

    <!-- Reviews -->
    <div class="reviews-section">
      <h3 class="section-title">Các nhận xét đánh giá</h3>
      
      <div class="reviews-list" id="reviewsList">
        <div class="loading-reviews">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Đang tải đánh giá...</span>
        </div>
      </div>
    </div>
  `;

  // Add favorite button event
  const favoriteBtn = mainEl.querySelector('.favorite-btn');
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', () => {
      favoriteBtn.classList.toggle('active');
      const icon = favoriteBtn.querySelector('i');
      if (favoriteBtn.classList.contains('active')) {
        icon.className = 'fas fa-heart';
      } else {
        icon.className = 'far fa-heart';
      }
    });
  }

  // Load reviews from API
  loadReviews(tech.id, mainEl);
}

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  
  let html = '';
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  if (hasHalf) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star"></i>';
  }
  return html;
}

function renderReviewItem(review) {
  // Handle both API format and local format
  const avatarUrl = review.user_avatar || review.avartar || review.avatar
    ? `https://api.chothuetatca.com${review.user_avatar || review.avartar || review.avatar}` 
    : null;
  
  const userName = review.user_name || review.username || review.name || 'Người dùng';
  const rating = review.rating || review.star || 0;
  const comment = review.comment || review.content || review.note || '';
  
  return `
    <div class="review-item">
      <div class="review-avatar">
        ${avatarUrl 
          ? `<img src="${avatarUrl}" alt="${userName}">` 
          : `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`
        }
      </div>
      <div class="review-content">
        <div class="review-header">
          <span class="reviewer-name">${userName}</span>
          <div class="review-rating">
            ${renderStars(rating)}
          </div>
        </div>
        <p class="review-text">${comment}</p>
      </div>
    </div>
  `;
}

function loadReviews(techId, mainEl) {
  const reviewsList = mainEl.querySelector('#reviewsList');
  const techRating = mainEl.querySelector('#techRating');
  
  api.get(`/order/get-list-order-rating-by-staff?staff_id=${techId}`)
    .then(data => {
      const reviews = data.data || data || [];
      
      // Update rating display
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + (r.rating || r.star || 0), 0) / reviews.length;
        techRating.innerHTML = `
          ${renderStars(avgRating)}
          <span class="rating-count">(${reviews.length} đánh giá)</span>
        `;
        reviewsList.innerHTML = reviews.map(review => renderReviewItem(review)).join('');
      } else {
        reviewsList.innerHTML = '<p class="empty-text">Chưa có đánh giá nào</p>';
      }
    })
    .catch(error => {
      console.error('Error loading reviews:', error);
      reviewsList.innerHTML = '<p class="empty-text">Chưa có đánh giá nào</p>';
    });
}
