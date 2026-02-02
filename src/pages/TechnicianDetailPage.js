import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { SupportService } from "../services/support.service.js";
import { authService } from "../services/auth.service.js";
import { getImageUrl } from "../utils/helpers.js";
import { api } from "../services/api.js";
import { favoriteStore } from "../services/favorite.store.js";
import "../styles/hotline/technician-detail.css";

export function TechnicianDetailPage() {
  const container = document.createElement("div");

  // Use standard Header component
  const header = Header();
  container.appendChild(header);

  const main = document.createElement("main");
  main.className = "technician-detail-page";
  
  // Page Header with breadcrumb
  const pageHeader = document.createElement("div");
  pageHeader.className = "page-header";
  pageHeader.innerHTML = `
    <h1><i class="fas fa-user-cog"></i> Thông tin kỹ thuật viên</h1>
    <div class="breadcrumb">
      <a href="#/" onclick="event.preventDefault(); window.location.hash='/'">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <a href="#/hotline" onclick="event.preventDefault(); window.location.hash='/hotline'">Hotline</a>
      <i class="fas fa-chevron-right"></i>
      <span>Chi tiết</span>
    </div>
  `;
  main.appendChild(pageHeader);
  
  const contentSection = document.createElement("section");
  contentSection.className = "tech-detail-content";
  contentSection.innerHTML = `
    <div class="container">
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải thông tin...</p>
      </div>
    </div>
  `;
  main.appendChild(contentSection);
  
  container.appendChild(main);
  container.appendChild(Footer());

  // Get technician ID from URL
  setTimeout(() => {
    const urlParams = new URLSearchParams(
      window.location.hash.split("?")[1] || ""
    );
    const techId = urlParams.get("id");

    const contentContainer = contentSection.querySelector(".container");
    
    if (techId) {
      loadTechnicianDetail(techId, contentContainer);
    } else {
      contentContainer.innerHTML = `
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

// Hàm hiển thị thông báo
function showNotification(message, type = "success") {
  // Remove existing notification if any
  const existingNotification = document.querySelector(".tech-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `tech-notification tech-notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// function getUserById(id) {
//   return authService.getUserFromServer(id).then((data) => console.log(data));
// }

function loadTechnicianDetail(techId, mainEl) {
  authService
    .getUserFromServer(techId)
    .then((data) => {
      const tech = data.data || data || [];
      console.log("Technician data:", tech);

      if (tech) {
        // Initialize FavoriteStore nếu user đã đăng nhập
        if (authService.isAuthenticated()) {
          const user = authService.getUser();
          favoriteStore.init(user.id);
        }
        
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
    .catch((e) => {
      console.error("Error loading technician detail:", e);
      mainEl.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Lỗi khi tải thông tin</p>
          <a href="#/hotline" class="back-link">Quay lại danh sách</a>
        </div>
      `;
    });
}

// Hàm cập nhật UI favorite button từ store
function updateFavoriteButton(techId, mainEl) {
  const favoriteBtn = mainEl.querySelector(".favorite-btn");
  if (!favoriteBtn) return;
  
  const isFavorite = favoriteStore.isFavorite(techId);
  
  if (isFavorite) {
    favoriteBtn.classList.add("active");
    const icon = favoriteBtn.querySelector("i");
    if (icon) icon.className = "fas fa-heart";
  } else {
    favoriteBtn.classList.remove("active");
    const icon = favoriteBtn.querySelector("i");
    if (icon) icon.className = "far fa-heart";
  }
}

function renderTechnicianDetail(tech, mainEl) {
  const avatarUrl = tech.avartar ? getImageUrl(tech.avartar) : null;

  mainEl.innerHTML = `
    <!-- Profile Card -->
    <div class="tech-profile-card">
      <div class="profile-avatar">
        ${
          avatarUrl
            ? `<img src="${avatarUrl}" alt="${tech.username}">`
            : `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`
        }
      </div>
      <div class="profile-info">
        <h2 class="tech-name">${tech.username || "Kỹ thuật viên"}</h2>
        <a href="tel:${tech.phone}" class="tech-phone">${tech.phone || ""}</a>
        <div class="tech-rating" id="techRating">
          <i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>
          <span class="rating-count">(0 đánh giá)</span>
        </div>
      </div>
    </div>

    <!-- Technical Info -->
    <div class="info-section">
      <h3 class="section-title">Thông tin kỹ thuật</h3>
      <div class="info-item ${
        tech.phone != null ? "verified" : "not-verified"
      }">
        <i class="fas fa-${
          tech.phone != null ? "check-circle" : "times-circle"
        }"></i>
        <span>Đã xác minh số điện thoại</span>
      </div>
      <div class="info-item ${tech.cmt != null ? "verified" : "not-verified"}">
        <i class="fas fa-${
          tech.cmt != null ? "check-circle" : "times-circle"
        }"></i>
        <span>Đã xác minh chứng minh thư</span>
      </div>
    </div>

    <!-- Services -->
    <div class="info-section">
      <h3 class="section-title">Dịch vụ cung cấp</h3>
      <div class="services-list">
        ${
          tech.services && tech.services.length > 0
            ? tech.services
                .map((s) => `<span class="service-tag">${s}</span>`)
                .join("")
            : '<span class="empty-text">Trống!</span>'
        }
      </div>
    </div>

    <!-- Area -->
    <div class="info-section">
      <h3 class="section-title">Khu vực</h3>
      <div class="area-list">
        ${
          tech.location && tech.location.length > 0
            ? tech.location
                .map((a) => `<span class="area-tag">${a}</span>`)
                .join("")
            : '<span class="empty-text">Chưa cập nhật</span>'
        }
      </div>
    </div>

    <!-- Favorite -->
    <div class="favorite-section">
      <span>Lưu vào mục ưa thích</span>
      <button class="favorite-btn ${
        tech.is_favorite ? "active" : ""
      }" data-tech-id="${tech.id}">
        <i class="fa${tech.is_favorite ? "s" : "r"} fa-heart"></i>
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
  const favoriteBtn = mainEl.querySelector(".favorite-btn");
  if (favoriteBtn) {
    const techId = favoriteBtn.getAttribute("data-tech-id");
    
    // Subscribe to store để update UI khi có thay đổi
    const unsubscribe = favoriteStore.subscribe(() => {
      updateFavoriteButton(techId, mainEl);
    });
    
    // Cleanup khi rời trang
    window.addEventListener('hashchange', () => {
      unsubscribe();
    }, { once: true });
    
    // Handle click
    favoriteBtn.addEventListener("click", async () => {
      // Kiểm tra đăng nhập
      if (!authService.isAuthenticated()) {
        alert("Vui lòng đăng nhập để lưu thợ yêu thích!");
        window.location.hash = "#/login";
        return;
      }
      
      try {
        favoriteBtn.disabled = true;
        
        // Sử dụng FavoriteStore (single source of truth)
        const result = await favoriteStore.toggle(techId);
        
        // Show notification
        showNotification(
          result.action === 'added' 
            ? "Đã thêm vào danh sách yêu thích" 
            : "Đã xóa khỏi danh sách yêu thích",
          "success"
        );
        
      } catch (error) {
        console.error("❌ Error updating favorite:", error);
        showNotification("Có lỗi xảy ra. Vui lòng thử lại!", "error");
      } finally {
        favoriteBtn.disabled = false;
      }
    });
  }

  // Load reviews from API
  loadReviews(tech.id, mainEl);
}

function renderStars(rating) {
  // Đảm bảo rating là số
  const numRating = Number(rating) || 0;
  const fullStars = Math.floor(numRating);
  const hasHalf = (numRating % 1) >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  let html = "";
  
  // Sao đầy
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  
  // Sao nửa
  if (hasHalf) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Sao rỗng
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star"></i>';
  }
  
  return html;
}

function renderReviewItem(review) {
  // Handle both API format and local format
  const avatarUrl = review.user?.avartar
    ? getImageUrl(review.user.avartar)
    : null;

  const userName = review.user?.username || review.user?.name || "Người dùng";
  const rating = parseInt(review.rate) || 0; // Chuyển sang số nguyên
  const comment = review.comment || review.content || review.note || "";

  // Escape HTML để tránh XSS
  const safeComment = comment.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  console.log(`Rendering review: ${userName}, rate=${review.rate}, parsed=${rating}`);

  return `
    <div class="review-item">
      <div class="review-avatar">
        ${
          avatarUrl
            ? `<img src="${avatarUrl}" alt="${userName}" onerror="this.parentElement.innerHTML='<div class=\\'avatar-placeholder\\'><i class=\\'fas fa-user\\'></i></div>'">`
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
        <p class="review-text">${safeComment}</p>
      </div>
    </div>
  `;
}

function loadReviews(techId, mainEl) {
  const reviewsList = mainEl.querySelector("#reviewsList");
  const techRating = mainEl.querySelector("#techRating");

  SupportService.getListOrderRating(techId)
    .then((data) => {
      // Xử lý dữ liệu trả về từ API
      let reviews = [];
      if (data && data.data && Array.isArray(data.data)) {
        reviews = data.data;
      } else if (Array.isArray(data)) {
        reviews = data;
      }

      console.log("Reviews data:", reviews);
      
      // Log chi tiết từng review để debug
      reviews.forEach((r, index) => {
        console.log(`Review ${index}:`, {
          order_id: r.order_id || r.id,
          user_id: r.user?.id,
          username: r.user?.username,
          rate: r.rate,
          comment: r.comment || r.content || r.note
        });
      });

      // Lọc các đánh giá hợp lệ (có rate và comment)
      const validReviews = reviews.filter(r => 
        r && r.rate && r.user && (r.comment || r.content || r.note)
      );

      // Loại bỏ các đánh giá trùng lặp dựa trên id hoặc order_id
      const uniqueReviews = validReviews.reduce((acc, current) => {
        const currentId = current.id || current.order_id;
        const isDuplicate = acc.find(item => {
          const itemId = item.id || item.order_id;
          return itemId && currentId && itemId === currentId;
        });
        
        if (!isDuplicate) {
          acc.push(current);
        } else {
          console.log("Duplicate found:", current);
        }
        return acc;
      }, []);

      console.log("Unique reviews:", uniqueReviews);

      // Update rating display
      if (uniqueReviews.length > 0) {
        const avgRating =
          uniqueReviews.reduce((sum, r) => sum + (parseInt(r.rate) || 0), 0) /
          uniqueReviews.length;
        console.log("Average rating:", avgRating);
        techRating.innerHTML = `
          ${renderStars(avgRating)}
          <span class="rating-count">(${uniqueReviews.length} đánh giá)</span>
        `;
        reviewsList.innerHTML = uniqueReviews
          .map((review) => renderReviewItem(review))
          .join("");
      } else {
        reviewsList.innerHTML =
          '<p class="empty-text">Chưa có đánh giá nào</p>';
      }
    })
    .catch((error) => {
      console.error("Error loading reviews:", error);
      reviewsList.innerHTML = '<p class="empty-text">Lỗi khi tải đánh giá</p>';
    });
}
