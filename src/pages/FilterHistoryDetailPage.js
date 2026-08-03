import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { historyService } from "../services/history.service.js";
import "../styles/history/filter-history-detail.css";
import { getImageUrl } from "../utils/helpers.js";

export function FilterHistoryDetailPage() {
  const container = document.createElement("div");
  container.className = "page-container";

  container.appendChild(Header());

  const page = document.createElement("main");
  page.className = "filter-detail-page";

  const detailContainer = document.createElement("div");
  detailContainer.className = "detail-container";

  // Back button
  const backButton = document.createElement("a");
  backButton.href = "javascript:history.back()";
  backButton.className = "back-button";
  backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Quay lại';
  detailContainer.appendChild(backButton);

  // Loading state
  const loadingState = document.createElement("div");
  loadingState.className = "loading-state";
  loadingState.id = "loadingState";
  loadingState.innerHTML = `
    <i class="fas fa-spinner"></i>
    <p>Đang tải thông tin...</p>
  `;
  detailContainer.appendChild(loadingState);

  // Error state
  const errorState = document.createElement("div");
  errorState.className = "error-state";
  errorState.id = "errorState";
  errorState.style.display = "none";
  errorState.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <h3>Không thể tải thông tin</h3>
    <p>Vui lòng thử lại sau</p>
  `;
  detailContainer.appendChild(errorState);

  // Detail content
  const detailContent = document.createElement("div");
  detailContent.id = "detailContent";
  detailContent.style.display = "none";
  detailContainer.appendChild(detailContent);

  page.appendChild(detailContainer);
  container.appendChild(page);
  container.appendChild(Footer());

  // Load data
  loadFilterDetail(detailContent, loadingState, errorState);

  return container;
}

async function loadFilterDetail(contentContainer, loadingState, errorState) {
  const user = authService.getCurrentUser();

  if (!user) {
    window.location.hash = "/login";
    return;
  }

  // Get history item ID from URL
  const hash = window.location.hash;
  const historyId = hash.split("/")[2];

  if (!historyId) {
    showError(loadingState, errorState, "Không tìm thấy mã lịch sử");
    return;
  }

  try {
    // Get detail from /user/detailHistory/{id}
    const result = await historyService.getFilterHistoryDetail(historyId);

    
    let historyItem = null;

    // Handle response structure
    if (result.data) {
      historyItem = result.data;
    } else if (result) {
      historyItem = result;
    }

    if (!historyItem) {
      showError(loadingState, errorState, "Không tìm thấy thông tin lịch sử");
      return;
    }

    renderFilterDetail(contentContainer, historyItem, user, loadingState, historyId);
  } catch (error) {
    console.error("Error loading filter detail:", error);
    showError(loadingState, errorState, error.message || "Có lỗi xảy ra");
  }
}

function showError(loadingState, errorState, message) {
  loadingState.style.display = "none";
  errorState.style.display = "block";
  const errorText = errorState.querySelector("p");
  if (errorText) errorText.textContent = message;
}

function renderFilterDetail(container, historyItem, user, loadingState, historyId) {
  loadingState.style.display = "none";
  container.style.display = "block";

  
  // Extract order data if exists
  const order = historyItem.order || historyItem;

      
  // Extract data with multiple possible field names
  // order_filter_core is an array
  // First item (index 0) is current replacement
  // Second item (index 1) is next replacement schedule
  const filterCore =
    Array.isArray(order.order_filter_core) && order.order_filter_core.length > 0
      ? order.order_filter_core[0]
      : null;
  const nextFilterCore =
    Array.isArray(order.order_filter_core) && order.order_filter_core.length > 1
      ? order.order_filter_core[1]
      : null;

    
  const filterCoreName =
    filterCore?.name ||
    filterCore?.filter_core_name ||
    order.filter_core_name ||
    order.name ||
    order.ten_loi ||
    historyItem.filter_core_name ||
    historyItem.name ||
    "Lõi lọc";
  
    
  const replaceDate =
    order.created_at ||
    order.ngay_thay ||
    order.ngay_thuc_hien ||
    historyItem.created_at;

  // Next replacement info from second item in array
  const nextFilterCoreName = nextFilterCore?.name || filterCoreName;
  const nextReplaceDate =
    nextFilterCore?.replace_date_promise ||
    nextFilterCore?.replace_date ||
    nextFilterCore?.ngay_thay_tiep_theo ||
    order.next_replace_date ||
    order.ngay_thay_tiep_theo ||
    historyItem.next_replace_date;

  // Get technician info from staff array or direct staff object
  let staff = null;
  if (Array.isArray(order.staff) && order.staff.length > 0) {
    staff = order.staff[0];
  } else if (order.staff && typeof order.staff === 'object') {
    staff = order.staff;
  }
  
    
  const technicianName =
    staff?.username ||
    staff?.staff_info?.username ||
    staff?.staff_info?.name ||
    order.sale_id?.username ||
    order.sale_id?.name ||
    order.technician_name ||
    order.ten_ky_thuat_vien ||
    "Chưa phân công";

  
  const technicianId =
    staff?.staff_info?.id ||
    staff?.id ||
    order.sale_id?.id ||
    order.technician_id ||
    order.ky_thuat_vien_id;

  // Rating info from API response
  let rating = parseInt(order.rate) || parseInt(order.rating) || parseInt(order.danh_gia) || 0;
  let comment = order.comment || order.nhan_xet || order.binh_luan || "";
  
  // Check localStorage for rating if not in API response
  const ratingKey = `order_rating_${historyId}`;
  const savedRating = localStorage.getItem(ratingKey);
  if (savedRating && !comment) {
    try {
      const ratingData = JSON.parse(savedRating);
      rating = ratingData.rate || rating;
      comment = ratingData.comment || comment;
          } catch (e) {
      console.error('Error parsing saved rating:', e);
    }
  }
  
                      

  // Financial info from order
  const price =
    parseInt(order.price) ||
    parseInt(order.thanh_tien) ||
    parseInt(order.gia) ||
    0;
  const totalAmount = price; // tong_tien = price in this case
  const discount =
    parseInt(order.chiet_khau) ||
    parseInt(order.discount) ||
    parseInt(order.giam_gia) ||
    0;
  const previousPointsRaw =
    parseInt(order.tru_tich_diem) ||
    parseInt(order.previous_points) ||
    parseInt(order.diem_tru) ||
    0;
  const previousPoints = previousPointsRaw * 1000;

  // Calculate final amount: price - discount - previousPoints
  const finalAmount = price - discount - previousPoints;

  const earnedPointsRaw =
    parseInt(order.tich_diem) ||
    parseInt(order.earned_points) ||
    parseInt(order.diem_tich) ||
    0;
  const earnedPoints = earnedPointsRaw * 1000;

  // Images - check in order object
  let images = [];
  if (Array.isArray(order.images) && order.images.length > 0) {
    // Map images array to get image_link from each item
    images = order.images
      .map((img) => img.image_link || img.url || img.hinh_anh || img)
      .filter(Boolean);
  } else if (order.hinh_anh && Array.isArray(order.hinh_anh)) {
    images = order.hinh_anh;
  } else if (order.image_urls && Array.isArray(order.image_urls)) {
    images = order.image_urls;
  } else if (order.image_url) {
    images = [order.image_url];
  } else if (order.hinh_anh) {
    images = [order.hinh_anh];
  }

  // Header
  const header = document.createElement("div");
  header.className = "detail-header";
  header.innerHTML = `<h1><i class="fas fa-filter"></i> Chi tiết lần thay lõi</h1>`;
  container.appendChild(header);

  // Extract product_filter_cores or order_filter_core array if returned from GET /user/detailHistory/{order_id}
  const productFilterCoresList =
    (Array.isArray(historyItem.product_filter_cores) && historyItem.product_filter_cores.length > 0 && historyItem.product_filter_cores) ||
    (Array.isArray(order.product_filter_cores) && order.product_filter_cores.length > 0 && order.product_filter_cores) ||
    (Array.isArray(historyItem.product?.product_filter_cores) && historyItem.product.product_filter_cores.length > 0 && historyItem.product.product_filter_cores) ||
    (Array.isArray(order.order_filter_core) && order.order_filter_core.length > 0 && order.order_filter_core) ||
    [];

  // Main card
  const mainCard = document.createElement("div");
  mainCard.className = "info-card";
  mainCard.innerHTML = `
    <div class="info-table">
      <div class="table-header">
        <div class="header-cell">Tên lõi lọc</div>
        <div class="header-cell">Thành tiền</div>
      </div>
      ${productFilterCoresList.length > 0 ? productFilterCoresList.map(c => `
        <div class="table-row">
          <div class="cell">
            <strong style="color: #0f172a;">${c.name || c.filter_core_name || c.core_name || c.ten_loi || filterCoreName}</strong>
            ${(c.replace_date_promise || c.ngay_thay_tiep_theo) ? `<div style="font-size: 0.8rem; color: #ea580c; margin-top: 3px;"><i class="fas fa-calendar-alt"></i> Ngày thay tiếp theo: ${formatDate(c.replace_date_promise || c.ngay_thay_tiep_theo)}</div>` : ''}
          </div>
          <div class="cell price-cell">${c.price || c.gia ? formatPrice(c.price || c.gia) : formatPrice(price)}</div>
        </div>
      `).join("") : `
        <div class="table-row">
          <div class="cell">${filterCoreName}</div>
          <div class="cell price-cell">${formatPrice(price)}</div>
        </div>
      `}
    </div>
    
    <div class="info-list">
      <div class="info-row">
        <span class="label">Ngày thực hiện:</span>
        <span class="value">${formatDate(replaceDate)}</span>
      </div>
      <div class="info-row">
        <span class="label">Tổng tiền:</span>
        <span class="value">${formatPrice(totalAmount)}</span>
      </div>
      <div class="info-row">
        <span class="label">Chiết khấu:</span>
        <span class="value">${formatPrice(discount)}</span>
      </div>
      <div class="info-row">
        <span class="label">Trừ tích điểm:</span>
        <span class="value">${formatPrice(previousPoints)}</span>
      </div>
      <div class="info-row highlight">
        <span class="label">Tổng tiền thanh toán:</span>
        <span class="value price-highlight">${formatPrice(finalAmount)}</span>
      </div>
      <div class="info-row">
        <span class="label">Tích điểm:</span>
        <span class="value">${formatPoints(earnedPoints)}</span>
      </div>
    </div>

    <div class="technician-info">
      <div class="info-row">
        <span class="label">Thông tin kỹ thuật viên:</span>
        <span class="value tech-name" id="technicianName">${technicianName}</span>
      </div>
    </div>

    <div class="rating-section">
      <div class="rating-label">Đánh giá và nhận xét dịch vụ</div>
      ${comment ? `<div class="already-rated-notice"><i class="fas fa-check-circle"></i> Bạn đã đánh giá dịch vụ này</div>` : ''}
      <div class="stars" id="ratingStars">
        ${comment ? generateNonInteractiveStars(rating) : generateInteractiveStars(rating)}
      </div>
      <div class="comment-input-section">
        <textarea id="commentInput" placeholder="Viết nhận xét của bạn..." class="comment-input" ${comment ? `readonly` : ''}>${comment || ''}</textarea>
        ${!comment ? `<button id="submitReview" class="submit-review-btn">Gửi đánh giá</button>` : ''}
      </div>
    </div>

    <div class="feedback-section" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; display: flex; justify-content: flex-end;">
      <button type="button" class="btn-feedback-action" onclick="window.location.hash='#/booking-history?tab=feedback&order_id=${order.id || historyId}'">
        <i class="fas fa-comment-dots"></i> Góp ý / Khiếu nại đơn hàng này
      </button>
    </div>
  `;
  container.appendChild(mainCard);

  // Add click event for technician name after DOM is created
  if (technicianId) {
    const techNameElement = mainCard.querySelector('#technicianName');
    if (techNameElement) {
      techNameElement.classList.add('clickable');
      techNameElement.style.cursor = 'pointer';
      techNameElement.addEventListener('click', () => {
        window.location.hash = `/technician-detail?id=${technicianId}`;
      });
    }
  }

  // Add rating interaction if not already rated
  if (!comment) {
    setupRatingInteraction(mainCard, historyId, rating);
  }

  // Next replacement card
  const nextCard = document.createElement("div");
  nextCard.className = "info-card";
  nextCard.innerHTML = `
    <div class="info-table">
      <div class="table-header">
        <div class="header-cell">Tên lõi</div>
        <div class="header-cell">Ngày thay tiếp theo</div>
      </div>
      <div class="table-row">
        <div class="cell">${nextFilterCoreName}</div>
        <div class="cell">${
          nextReplaceDate ? formatDate(nextReplaceDate) : "Chưa xác định"
        }</div>
      </div>
    </div>

    ${
      images.length > 0
        ? `
      <div class="images-section">
        <div class="images-label">Hình ảnh đơn hàng:</div>
        <div class="images-grid">
          ${images
            .map((imgPath) => {
              const imgUrl = getImageUrl(imgPath);
              return `<img src="${imgUrl}" alt="Hình ảnh đơn hàng" class="order-image" onclick="openImageModal('${imgUrl}')" onerror="this.style.display='none'">`;
            })
            .join("")}
        </div>
      </div>
    `
        : ""
    }
  `;
  container.appendChild(nextCard);
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(price) {
  if (!price) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function formatPoints(points) {
  if (!points && points !== 0) return "0";
  return new Intl.NumberFormat("vi-VN").format(points);
}

function generateInteractiveStars(currentRating) {
  const maxStars = 5;
  let starsHtml = '';
  
  for (let i = 1; i <= maxStars; i++) {
    const filled = i <= currentRating ? 'filled' : 'empty';
    starsHtml += `<i class="fas fa-star ${filled} interactive" data-rating="${i}"></i>`;
  }
  
  return starsHtml;
}

function generateNonInteractiveStars(currentRating) {
  const maxStars = 5;
  let starsHtml = '';
  
  for (let i = 1; i <= maxStars; i++) {
    const filled = i <= currentRating ? 'filled' : 'empty';
    starsHtml += `<i class="fas fa-star ${filled}" style="cursor: default;"></i>`;
  }
  
  return starsHtml;
}

function setupRatingInteraction(container, orderId, currentRating) {
  const stars = container.querySelectorAll('.stars .interactive');
  const submitBtn = container.querySelector('#submitReview');
  const commentInput = container.querySelector('#commentInput');
  let selectedRating = currentRating;

  // Star hover and click events
  stars.forEach((star, index) => {
    const rating = index + 1;
    
    // Hover effect
    star.addEventListener('mouseenter', () => {
      updateStarsDisplay(stars, rating);
    });
    
    // Click to select
    star.addEventListener('click', () => {
      selectedRating = rating;
      updateStarsDisplay(stars, rating);
    });
  });

  // Reset on mouse leave
  container.querySelector('.stars').addEventListener('mouseleave', () => {
    updateStarsDisplay(stars, selectedRating);
  });

  // Submit review
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const comment = commentInput.value.trim();
      
                              
      if (selectedRating === 0) {
        alert('Vui lòng chọn số sao đánh giá');
        return;
      }

      if (!comment) {
        alert('Vui lòng viết nhận xét');
        return;
      }
      
      if (!orderId) {
        alert('Không tìm thấy thông tin đơn hàng. Không thể gửi đánh giá.');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';

                const result = await historyService.submitReview(orderId, selectedRating, comment);
                
        // Save rating to localStorage for persistence
        const ratingKey = `order_rating_${orderId}`;
        localStorage.setItem(ratingKey, JSON.stringify({
          rate: selectedRating,
          comment: comment,
          timestamp: Date.now()
        }));
                
        // Show success message
        alert('Đánh giá của bạn đã được gửi thành công!');
        
        // Update UI directly instead of reloading
        // Disable stars
        stars.forEach(star => {
          star.classList.remove('interactive');
          star.style.cursor = 'default';
        });
        
        // Make textarea readonly
        commentInput.readOnly = true;
        commentInput.style.background = '#f8f9fa';
        commentInput.style.cursor = 'not-allowed';
        
        // Hide submit button
        submitBtn.style.display = 'none';
        
        // Add success notice
        const ratingSection = container.querySelector('.rating-section');
        const ratingLabel = ratingSection.querySelector('.rating-label');
        const notice = document.createElement('div');
        notice.className = 'already-rated-notice';
        notice.innerHTML = '<i class="fas fa-check-circle"></i> Bạn đã đánh giá dịch vụ này';
        ratingLabel.insertAdjacentElement('afterend', notice);
        
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gửi đánh giá';
      }
    });
  }
}

function updateStarsDisplay(stars, rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.remove('empty');
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
      star.classList.add('empty');
    }
  });
}

// Global function to open image modal
window.openImageModal = (url) => {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: pointer;
  `;

  const img = document.createElement("img");
  img.src = url;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 12px;
  `;

  modal.appendChild(img);
  document.body.appendChild(modal);

  modal.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
};