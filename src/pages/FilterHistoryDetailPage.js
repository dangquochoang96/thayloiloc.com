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

    console.log("Filter history detail response:", result);

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

    renderFilterDetail(contentContainer, historyItem, user, loadingState);
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

function renderFilterDetail(container, historyItem, user, loadingState) {
  loadingState.style.display = "none";
  container.style.display = "block";

  console.log("Rendering history item:", historyItem);

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

  // Get technician info from staff array
  const staff =
    Array.isArray(order.staff) && order.staff.length > 0
      ? order.staff[0]
      : null;
  const technicianName =
    staff?.staff_info?.username ||
    staff?.staff_info?.name ||
    order.sale_id?.username ||
    order.sale_id?.name ||
    order.technician_name ||
    order.ten_ky_thuat_vien ||
    "Chưa phân công";

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

  // Main card
  const mainCard = document.createElement("div");
  mainCard.className = "info-card";
  mainCard.innerHTML = `
    <div class="info-table">
      <div class="table-header">
        <div class="header-cell">Tên lõi</div>
        <div class="header-cell">Thành tiền</div>
      </div>
      <div class="table-row">
        <div class="cell">${filterCoreName}</div>
        <div class="cell price-cell">${formatPrice(price)}</div>
      </div>
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
        <span class="value tech-name">${technicianName}</span>
      </div>
    </div>

    <div class="rating-section">
      <div class="rating-label">Đánh giá và nhận xét dịch vụ</div>
      <div class="stars">
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
      </div>
    </div>
  `;
  container.appendChild(mainCard);

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
