import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { getImageUrl } from "../utils/helpers.js";
import { SupportService } from "../services/support.service.js";
import "../styles/hotline/hotline-page.css";

export function HotlinePage() {
  const container = document.createElement("div");
  container.appendChild(Header());

  const page = document.createElement("main");
  page.className = "hotline-page";

  const main = document.createElement("div");
  main.className = "hotline-main";

  const containerDiv = document.createElement("div");
  containerDiv.className = "container";

  // Page header
  const pageHeader = document.createElement("div");
  pageHeader.className = "page-header";
  pageHeader.innerHTML = `
    <h1><i class="fas fa-phone-volume"></i> Liên Hệ Hotline</h1>
    <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
    <div class="breadcrumb">
      <a href="#/">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <span>Hotline</span>
    </div>
  `;
  containerDiv.appendChild(pageHeader);

  // Hotline content
  const hotlineContent = document.createElement("div");
  hotlineContent.className = "hotline-content";
  hotlineContent.innerHTML = `
    <div class="technicians-section">
      <h2><i class="fas fa-users-cog"></i> Kỹ Thuật Viên Hỗ Trợ</h2>
      <div id="techniciansLoading" class="loading-spinner" style="display: none;">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải danh sách kỹ thuật viên...</p>
      </div>
      <div id="techniciansGrid" class="technicians-grid">
        <!-- Danh sách kỹ thuật viên sẽ được load -->
      </div>
    </div>

    <div class="working-hours">
      <h2><i class="fas fa-clock"></i> Giờ Làm Việc</h2>
      <div class="hours-grid">
        <div class="hours-item">
          <i class="fas fa-calendar-day"></i>
          <div>
            <strong>Thứ 2 - Thứ 6</strong>
            <p>8:00 - 18:00</p>
          </div>
        </div>
        <div class="hours-item">
          <i class="fas fa-calendar-week"></i>
          <div>
            <strong>Thứ 7 - Chủ Nhật</strong>
            <p>8:00 - 17:00</p>
          </div>
        </div>
        <div class="hours-item emergency">
          <i class="fas fa-exclamation-circle"></i>
          <div>
            <strong>Khẩn Cấp 24/7</strong>
            <p>Luôn sẵn sàng hỗ trợ</p>
          </div>
        </div>
      </div>
    </div>

    <div class="contact-info">
      <h2><i class="fas fa-map-marker-alt"></i> Địa Chỉ Văn Phòng</h2>
      <div class="info-grid">
        <div class="info-item">
          <i class="fas fa-building"></i>
          <div>
            <strong>Trụ sở chính</strong>
            <p>CTT1 - 03, Khu Biệt Thự Liền kề Kiến Hưng Luxury, P. Phúc La, Hà Đông, Hà Nội, Việt Nam</p>
          </div>
        </div>
        <div class="info-item">
          <i class="fas fa-map-marked-alt"></i>
          <div>
            <strong>Chi nhánh miền Nam</strong>
            <p>Số 178 đường Nguyễn Trãi, kp Thống Nhất 1, P Dĩ An, Tp Dĩ An, Bình Dương</p>
          </div>
        </div>
      </div>
    </div>
  `;
  containerDiv.appendChild(hotlineContent);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  // Initialize after DOM is ready
  setTimeout(() => {
    initializeTechnicians();
  }, 100);

  return container;
}

// Load rating data cho tất cả kỹ thuật viên (trả về data thay vì update UI)
async function loadAllTechniciansRatingData(technicians) {
  try {
    // Gọi tất cả API cùng lúc
    const ratingPromises = technicians.map(tech => 
      SupportService.getListOrderRating(tech.id)
        .then(data => ({
          techId: tech.id,
          reviews: data.data || data || []
        }))
        .catch(error => {
          console.error(`Error loading rating for tech ${tech.id}:`, error);
          return {
            techId: tech.id,
            reviews: []
          };
        })
    );
    
    // Đợi tất cả API hoàn thành
    const results = await Promise.all(ratingPromises);
    
    // Tạo object chứa rating info cho từng thợ
    const ratingsData = {};
    results.forEach(result => {
      if (result.reviews.length > 0) {
        const avgRating = result.reviews.reduce((sum, r) => sum + (parseInt(r.rate) || 0), 0) / result.reviews.length;
        const roundedRating = Math.round(avgRating * 10) / 10;
        
        ratingsData[result.techId] = {
          avgRating: roundedRating,
          count: result.reviews.length
        };
      } else {
        ratingsData[result.techId] = {
          avgRating: 0,
          count: 0
        };
      }
    });
    
    return ratingsData;
  } catch (error) {
    console.error('Error loading all ratings:', error);
    return {};
  }
}

// Load rating cho kỹ thuật viên (deprecated - dùng loadAllTechniciansRating thay thế)
function loadTechnicianRating(techId) {
  const ratingEl = document.querySelector(`.tech-rating-display[data-tech-id="${techId}"]`);
  if (!ratingEl) return;

  SupportService.getListOrderRating(techId)
    .then((data) => {
      const reviews = data.data || data || [];
      
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + (parseInt(r.rate) || 0), 0) / reviews.length;
        const roundedRating = Math.round(avgRating * 10) / 10;
        
        ratingEl.innerHTML = `
          <div class="tech-rating-stars">
            ${renderStars(avgRating)}
          </div>
          <span class="tech-rating-text">${roundedRating} (${reviews.length})</span>
        `;
      } else {
        ratingEl.innerHTML = `
          <div class="tech-rating-stars">
            ${renderStars(0)}
          </div>
          <span class="tech-rating-text">Chưa có đánh giá</span>
        `;
      }
    })
    .catch((error) => {
      console.error(`Error loading rating for tech ${techId}:`, error);
      ratingEl.innerHTML = `
        <div class="tech-rating-stars">
          ${renderStars(0)}
        </div>
        <span class="tech-rating-text">Chưa có đánh giá</span>
      `;
    });
}

// Render stars
function renderStars(rating) {
  const numRating = Number(rating) || 0;
  const fullStars = Math.floor(numRating);
  const hasHalf = (numRating % 1) >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  let html = "";
  
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

// Format phone number function
function formatPhoneNumber(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.$3");
  }
  return phone;
}

// Initialize technicians functionality
function initializeTechnicians() {
  const loadingEl = document.getElementById("techniciansLoading");
  const gridEl = document.getElementById("techniciansGrid");
  const areaFilter = document.getElementById("areaFilter");
  const refreshBtn = document.getElementById("refreshTechnicians");

  if (!loadingEl || !gridEl) return;

  // Load technicians function
  async function loadTechnicians() {
    loadingEl.style.display = "block";
    gridEl.innerHTML = "";

    try {
      // Gọi API qua api service
      const data = await SupportService.getSupportTechnicians();
      let technicians = data.data || data || [];

      if (technicians.length === 0) {
        loadingEl.style.display = "none";
        gridEl.innerHTML = `
          <div class="no-technicians">
            <i class="fas fa-user-slash"></i>
            <p>Không có kỹ thuật viên nào</p>
          </div>
        `;
        return;
      }

      // Load tất cả ratings trước khi render
      const ratingsData = await loadAllTechniciansRatingData(technicians);

      // Render với ratings đã có sẵn
      gridEl.innerHTML = technicians
        .map((tech) => {
          const ratingInfo = ratingsData[tech.id] || { avgRating: 0, count: 0 };
          const ratingHTML = ratingInfo.count > 0
            ? `
              <div class="tech-rating-stars">
                ${renderStars(ratingInfo.avgRating)}
              </div>
              <span class="tech-rating-text">${ratingInfo.avgRating} (${ratingInfo.count})</span>
            `
            : `
              <div class="tech-rating-stars">
                ${renderStars(0)}
              </div>
              <span class="tech-rating-text">Chưa có đánh giá</span>
            `;

          return `
          <div class="technician-card active" data-tech='${JSON.stringify(
            tech
          )}' data-tech-id="${tech.id}">
            <div class="tech-avatar">
              ${
                tech.avartar
                  ? `<img src="${getImageUrl(tech.avartar)}" alt="${
                      tech.username
                    }">`
                  : `<i class="fas fa-user-cog"></i>`
              }
            </div>
            <div class="tech-info">
              <h3>${tech.username}</h3>
              <div class="tech-rating-display" data-tech-id="${tech.id}">
                ${ratingHTML}
              </div>
              <div class="tech-phone-display">
                <i class="fas fa-phone"></i>
                <span>${formatPhoneNumber(tech.phone)}</span>
              </div>
            </div>
            <div class="tech-contact">
              <div class="tech-actions">
                <a href="tel:${
                  tech.phone
                }" class="action-btn call-btn" onclick="event.stopPropagation()">
                  <i class="fas fa-phone"></i>
                  Gọi ngay
                </a>
                <a href="sms:${
                  tech.phone
                }" class="action-btn sms-btn" onclick="event.stopPropagation()">
                  <i class="fas fa-sms"></i>
                  Nhắn tin
                </a>
              </div>
            </div>
          </div>
        `;
        })
        .join("");

      loadingEl.style.display = "none";

      // Add click event to show detail
      gridEl.querySelectorAll(".technician-card").forEach((card) => {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
          const tech = JSON.parse(card.dataset.tech);
          // Navigate to technician detail page
          window.location.hash = `/technician-detail?id=${tech.id}`;
        });
      });
    } catch (error) {
      console.error("Lỗi khi tải danh sách kỹ thuật viên:", error);
      loadingEl.style.display = "none";
      gridEl.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Không thể tải danh sách kỹ thuật viên</p>
          <button class="retry-btn">
            <i class="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      `;
    }
  }

  // Event delegation for retry button
  document.addEventListener("click", (e) => {
    if (e.target.closest(".retry-btn")) {
      loadTechnicians();
    }
  });

  // Load all technicians
  loadTechnicians();

  // Show technician detail modal
  function showTechnicianDetail(tech) {
    // Remove existing modal
    const existingModal = document.querySelector(".tech-modal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.className = "tech-modal";
    modal.innerHTML = `
      <div class="tech-modal-overlay"></div>
      <div class="tech-modal-content">
        <button class="tech-modal-close">
          <i class="fas fa-times"></i>
        </button>
        <div class="tech-modal-header">
          <div class="tech-modal-avatar">
            ${
              tech.avartar
                ? `<img src="${getImageUrl(tech.avartar)}" alt="${
                    tech.username
                  }">`
                : `<i class="fas fa-user-cog"></i>`
            }
          </div>
          <h2>${tech.username}</h2>
        </div>
        <div class="tech-modal-body">
          <div class="tech-detail-item">
            <i class="fas fa-id-badge"></i>
            <div>
              <span class="label">Mã nhân viên</span>
              <span class="value">#${tech.id}</span>
            </div>
          </div>
          <div class="tech-detail-item">
            <i class="fas fa-phone"></i>
            <div>
              <span class="label">Số điện thoại</span>
              <span class="value">${formatPhoneNumber(tech.phone)}</span>
            </div>
          </div>
          <div class="tech-detail-item">
            <i class="fas fa-circle" style="color: #22c55e; font-size: 0.8rem;"></i>
            <div>
              <span class="label">Trạng thái</span>
              <span class="value">Đang hoạt động</span>
            </div>
          </div>
        </div>
        <div class="tech-modal-actions">
          <a href="tel:${tech.phone}" class="modal-btn call-btn">
            <i class="fas fa-phone"></i>
            Gọi ngay
          </a>
          <a href="sms:${tech.phone}" class="modal-btn sms-btn">
            <i class="fas fa-sms"></i>
            Nhắn tin
          </a>
          <a href="https://zalo.me/${
            tech.phone
          }" target="_blank" class="modal-btn zalo-btn">
            <i class="fas fa-comment-dots"></i>
            Zalo
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal events
    modal
      .querySelector(".tech-modal-overlay")
      .addEventListener("click", () => modal.remove());
    modal
      .querySelector(".tech-modal-close")
      .addEventListener("click", () => modal.remove());
    document.addEventListener("keydown", function closeOnEsc(e) {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", closeOnEsc);
      }
    });
  }
}
