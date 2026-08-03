import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { historyService } from "../services/history.service.js";
import { getImageUrl } from "../utils/helpers.js";
import "../styles/history/product-filter-history.css";

export function ProductFilterHistoryPage() {
  const container = document.createElement("div");
  container.className = "page-container";

  container.appendChild(Header());

  const page = document.createElement("main");
  page.className = "product-history-page";

  const historyContainer = document.createElement("div");
  historyContainer.className = "history-container";

  // Back button
  const backButton = document.createElement("a");
  backButton.href = "#/booking-history?tab=filter-history";
  backButton.className = "back-button";
  backButton.innerHTML =
    '<i class="fas fa-arrow-left"></i> Quay lại danh sách sản phẩm';
  historyContainer.appendChild(backButton);

  // Loading state
  const loadingState = document.createElement("div");
  loadingState.className = "loading-state";
  loadingState.id = "loadingState";
  loadingState.innerHTML = `
    <i class="fas fa-spinner"></i>
    <p>Đang tải thông tin...</p>
  `;
  historyContainer.appendChild(loadingState);

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
  historyContainer.appendChild(errorState);

  // History content
  const historyContent = document.createElement("div");
  historyContent.id = "historyContent";
  historyContent.style.display = "none";
  historyContainer.appendChild(historyContent);

  page.appendChild(historyContainer);
  container.appendChild(page);
  container.appendChild(Footer());

  // Load data
  loadProductHistory(historyContent, loadingState, errorState);

  return container;
}

async function loadProductHistory(contentContainer, loadingState, errorState) {
  const user = authService.getCurrentUser();

  if (!user || !user.id || !user.phone) {
    window.location.hash = "/login";
    return;
  }

  // Get product ID from URL
  const hash = window.location.hash || "";
  const pathWithoutQuery = hash.split("?")[0];
  const pathParts = pathWithoutQuery.split("/");
  const urlParams = new URLSearchParams(hash.includes("?") ? hash.substring(hash.indexOf("?") + 1) : "");
  const productId = pathParts[2] || urlParams.get("id") || urlParams.get("productId");

  if (!productId) {
    showError(loadingState, errorState, "Không tìm thấy mã sản phẩm");
    return;
  }

  try {
    // Get product info
    let products = [];
    try {
      const productsResult = await historyService.getFilterHistory(user.id);
      if (productsResult.data && productsResult.data.listProducts) {
        products = productsResult.data.listProducts;
      } else if (productsResult.data && Array.isArray(productsResult.data)) {
        products = productsResult.data;
      } else if (Array.isArray(productsResult)) {
        products = productsResult;
      }
    } catch (e) {
      console.warn("Failed to fetch product list, using fallback product for ID:", productId);
    }

    let product = products.find((p) => String(p.id) === String(productId) || String(p.order_id) === String(productId));

    // Fallback product object if not found in list
    if (!product) {
      product = {
        id: productId,
        name: `Máy lọc nước #${productId}`,
        address: user.address || "Vị trí lắp đặt máy",
        filter_core_level: 5,
        order_type_label: "Thuê",
        created_at: new Date().toISOString()
      };
    }

    // Get order detail to fetch origin
    let productOriginFromOrder = null;
    if (product.order_id) {
      try {
        const orderDetail = await historyService.getFilterHistoryDetail(product.order_id);
        if (orderDetail.data && orderDetail.data.order && orderDetail.data.order.origin) {
          productOriginFromOrder = orderDetail.data.order.origin;
        }
      } catch (error) {
        console.warn('Failed to fetch order detail:', error);
      }
    }

    // Get detailed history using product.id to get order_rent info
    let detailData = null;
    try {
      const historyResult = await historyService.getFilterCoreHistoryByPhone(product.id || productId, user.phone);
      if (historyResult.data && historyResult.data.product) {
        detailData = historyResult.data;
      }
    } catch (e) {
      console.warn('Failed to fetch filter core history by phone:', e);
    }

    // Get filter history for this product
    let historyItems = [];
    let productOriginFromHistory = null;
    try {
      const historyResult = await historyService.getFilterCoreHistoryByPhone(
        productId,
        user.phone,
      );

      if (historyResult.data) {
        if (historyResult.data.order && historyResult.data.order.origin) {
          productOriginFromHistory = historyResult.data.order.origin;
        } else if (historyResult.data.product && historyResult.data.product.origin) {
          productOriginFromHistory = historyResult.data.product.origin;
        }

        if (
          historyResult.data.history &&
          Array.isArray(historyResult.data.history)
        ) {
          historyItems = historyResult.data.history;
        } else if (historyResult.data.product?.order_filter_cores) {
          historyItems = historyResult.data.product.order_filter_cores;
        }
      }
    } catch (e) {
      console.warn('Failed to load filter items history:', e);
    }

    renderProductHistory(
      contentContainer,
      product,
      historyItems,
      user,
      loadingState,
      detailData,
      productOriginFromHistory,
      productOriginFromOrder,
    );
  } catch (error) {
    console.error("Error loading product history:", error);
    showError(loadingState, errorState, error.message || "Có lỗi xảy ra");
  }
}

function showError(loadingState, errorState, message) {
  loadingState.style.display = "none";
  errorState.style.display = "block";
  const errorText = errorState.querySelector("p");
  if (errorText) errorText.textContent = message;
}

function renderProductHistory(
  container,
  product,
  historyItems,
  user,
  loadingState,
  detailData,
  productOriginFromHistory,
  productOriginFromOrder,
) {
  loadingState.style.display = "none";
  container.style.display = "block";

  const productName = detailData?.product?.name || product.product?.name || product.name || "Sản phẩm";
  const address = product.address || "Chưa có địa chỉ";
  const purchaseDate = product.ngaymua || product.created_at;
  const filterLevel = detailData?.product?.so_cap_loc || detailData?.filter_core_level || product.filter_core_level || "0";
  const userPhone = user?.phone || "N/A";

  // Check if this is a rental product
  const orderTypeLabel = product.order_type_label || "";
  const isRental = orderTypeLabel === "Thuê";

  // Try to get rental info from detailData
  let rentalInfo = null;
  let productOrigin = null;

  if (isRental && detailData) {
    if (detailData.product) {
      // Get origin from product level - try multiple possible locations
      productOrigin = detailData.product.origin || detailData.origin;

      // Get rental info from order_rent array
      if (Array.isArray(detailData.product.order_rent) && detailData.product.order_rent.length > 0) {
        rentalInfo = detailData.product.order_rent[0];
        // Try to get origin from rentalInfo if not found in product
        if (!productOrigin && rentalInfo.origin) {
          productOrigin = rentalInfo.origin;
        }
      }
    }
  }

  // Also try to get origin from the main product object passed to this function
  if (!productOrigin && product.origin) {
    productOrigin = product.origin;
  }

  // Try to get from productOriginFromHistory parameter
  if (!productOrigin && productOriginFromHistory) {
    productOrigin = productOriginFromHistory;
  }

  // Finally, try to get from productOriginFromOrder parameter (highest priority for rental)
  if (!productOrigin && productOriginFromOrder) {
    productOrigin = productOriginFromOrder;
  }

  const rentalOrderId = (rentalInfo && rentalInfo.order_id) || "";
  const rentalFeePerMonth = (rentalInfo && rentalInfo.monthly_rent !== null) ? parseInt(rentalInfo.monthly_rent) : 0;
  const rentalDuration = (rentalInfo && rentalInfo.rental_period !== null) ? parseInt(rentalInfo.rental_period) : 0;
  const rentalDeposit = (rentalInfo && rentalInfo.deposits !== null) ? parseInt(rentalInfo.deposits) : 0;
  const rentalPaid = (rentalInfo && rentalInfo.amount_paid !== null) ? parseInt(rentalInfo.amount_paid) : 0;
  const rentalDebt = (rentalInfo && rentalInfo.dept !== null) ? parseInt(rentalInfo.dept) : 0;
  const rentalStartDate = (rentalInfo && rentalInfo.rental_date) || "";
  const rentalEndDate = (rentalInfo && rentalInfo.rental_end_date) || "";

  // Determine rental status based on origin (convert to string for comparison)
  const originStr = String(productOrigin);
  const rentalStatus = (originStr === "2") ? "Kết thúc thuê" : "Đang thuê";
  const rentalStatusClass = (originStr === "2") ? "rental-ended" : "rental-active";

  // Lấy ảnh từ product_images array
  let productImage = "/images/default-service.svg";
  if (
    product.product?.product_images &&
    product.product.product_images.length > 0
  ) {
    const imgLink = product.product.product_images[0].link;
    productImage = imgLink.startsWith("http")
      ? imgLink
      : `${getImageUrl(imgLink)}`;
  } else if (product.product?.image) {
    productImage = product.product.image.startsWith("http")
      ? product.product.image
      : `${getImageUrl(product.product.image)}`;
  }

  // Product header
  const header = document.createElement("div");
  header.className = "product-header-card";
  header.innerHTML = `
    <div class="product-header-content">
      <div class="product-header-info">
        <h1>
          <i class="fas fa-tint"></i>
          ${productName}
          ${isRental ? '<span class="rental-tag">Máy thuê</span>' : ''}
        </h1>
        <div class="product-meta-grid">
          <div class="meta-item">
            <i class="fas fa-layer-group"></i>
            <span><strong>Số cấp lọc:</strong> ${filterLevel}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-calendar"></i>
            <span><strong>Ngày lắp máy:</strong> ${formatDate(purchaseDate)}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-map-marker-alt"></i>
            <span><strong>Vị trí lắp đặt:</strong> ${address}</span>
          </div>
          <div class="meta-item" style="grid-column: 1 / -1; margin-top: 5px;">
            <button type="button" class="btn-feedback-action" onclick="event.stopPropagation(); window.location.hash='#/booking-history?tab=feedback&order_id=${product.order_id || product.id}'">
              <i class="fas fa-comment-dots"></i> Góp ý / Khiếu nại
            </button>
          </div>
        </div>
      </div>
      <div class="product-header-image">
        <img src="${productImage}" alt="${productName}" onerror="this.src='/images/default-service.svg'" />
      </div>
    </div>
  `;
  container.appendChild(header);

  // Rental info card (only show if order type is "Thuê")
  if (isRental) {
    const rentalCard = document.createElement("div");
    rentalCard.className = "rental-info-card";
    rentalCard.innerHTML = `
      <h3 class="rental-title">Thông tin máy thuê</h3>
      <div class="rental-order-id">
        Mã đơn thuê ${rentalOrderId}
        <span class="rental-status-badge ${rentalStatusClass}">${rentalStatus}</span>
      </div>
      <div class="rental-info-grid">
        <div class="rental-info-item">
          <span class="rental-label">Tiền thuê/tháng:</span>
          <span class="rental-value">${formatPrice(rentalFeePerMonth)}</span>
        </div>
        <div class="rental-info-item">
          <span class="rental-label">Thời hạn thuê:</span>
          <span class="rental-value">${rentalDuration} tháng</span>
        </div>
        <div class="rental-info-item">
          <span class="rental-label">Tiền cọc:</span>
          <span class="rental-value">${formatPrice(rentalDeposit)}</span>
        </div>
        <div class="rental-info-item">
          <span class="rental-label">Đã thanh toán:</span>
          <span class="rental-value">${formatPrice(rentalPaid)}</span>
        </div>
        <div class="rental-info-item">
          <span class="rental-label">Công nợ:</span>
          <span class="rental-value">${formatPrice(rentalDebt)}</span>
        </div>
        <div class="rental-info-item">
          <span class="rental-label">Ngày thuê:</span>
          <span class="rental-value">${formatDate(rentalStartDate)}</span>
        </div>
        <div class="rental-info-item">
          <span class="rental-label">Ngày kết thúc thuê:</span>
          <span class="rental-value">${formatDate(rentalEndDate)}</span>
        </div>
      </div>
    `;
    container.appendChild(rentalCard);
  }

  // Extract product_filter_cores array directly from API
  let apiProductFilterCores = null;
  if (detailData && Array.isArray(detailData.product_filter_cores)) {
    apiProductFilterCores = detailData.product_filter_cores;
  } else if (detailData && detailData.product && Array.isArray(detailData.product.product_filter_cores)) {
    apiProductFilterCores = detailData.product.product_filter_cores;
  } else if (product && Array.isArray(product.product_filter_cores)) {
    apiProductFilterCores = product.product_filter_cores;
  }

  // Filter Cores Detail Breakdown Section
  const coresCard = document.createElement("div");
  coresCard.className = "filter-cores-card";
  coresCard.style.cssText = "background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; margin-bottom: 30px;";

  if (apiProductFilterCores && apiProductFilterCores.length > 0) {
    const coresHtml = apiProductFilterCores.map((core, idx) => {
      const coreName = core.name || core.filter_core_name || core.core_name || core.ten_loi || `Lõi số ${idx + 1}`;
      const lastDate = formatDate(core.replace_date || core.ngay_thay || core.created_at || core.last_replacement_date);
      const nextDate = formatDate(core.replace_date_promise || core.ngay_thay_dinh_ky || core.next_replacement_date);
      const period = core.period || core.thoi_han || core.replacement_period || "Theo định kỳ";
      const corePrice = core.price || core.gia ? formatPrice(core.price || core.gia) : "";

      return `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; transition: all 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 700; color: #ea580c; background: #fff7ed; border: 1px solid #ffedd5; font-size: 0.85rem; padding: 3px 10px; border-radius: 8px;">
              Lõi số ${idx + 1}
            </span>
            ${corePrice ? `<span style="font-size: 0.82rem; font-weight: 700; color: #15803d; background: #f0fdf4; padding: 2px 8px; border-radius: 8px;">${corePrice}</span>` : `<span style="font-size: 0.8rem; font-weight: 600; color: #166534; background: #dcfce7; border: 1px solid #bbf7d0; padding: 2px 10px; border-radius: 12px;">Hạn: ${period}</span>`}
          </div>
          <h4 style="font-weight: 700; color: #0f172a; font-size: 0.98rem; margin: 0 0 8px 0;">${coreName}</h4>
          <div style="font-size: 0.83rem; color: #475569; display: flex; flex-direction: column; gap: 4px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
            <div><i class="fas fa-history" style="color: #94a3b8; width: 16px;"></i> Lần thay gần nhất: <strong>${lastDate !== 'N/A' ? lastDate : 'Đang sử dụng'}</strong></div>
            <div><i class="fas fa-calendar-alt" style="color: #f97316; width: 16px;"></i> Thay tiếp theo: <strong style="color: #ea580c;">${nextDate !== 'N/A' ? nextDate : 'Chưa xếp lịch'}</strong></div>
          </div>
        </div>
      `;
    }).join("");

    coresCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
        <h3 style="font-size: 1.18rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-layer-group" style="color: #f97316;"></i> Chi Tiết Các Lõi Lọc Của Máy (${apiProductFilterCores.length} Lõi)
        </h3>
        <span style="font-size: 0.85rem; color: #ea580c; background: #fff7ed; border: 1px solid #ffedd5; padding: 4px 12px; border-radius: 20px; font-weight: 600;">
          <i class="fas fa-check-circle"></i> Từ API product_filter_cores
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
        ${coresHtml}
      </div>
    `;
  } else {
    coresCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-layer-group" style="color: #f97316;"></i> Chi Tiết Các Lõi Lọc (<code>product_filter_cores</code>)
        </h3>
        <span style="font-size: 0.85rem; color: #64748b; background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-weight: 600;">
          Số cấp lọc: ${filterLevel}
        </span>
      </div>

      <div style="padding: 30px 20px; text-align: center; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <i class="fas fa-inbox" style="font-size: 2.2rem; color: #cbd5e1; margin-bottom: 10px;"></i>
        <h4 style="color: #475569; margin: 0 0 4px 0; font-size: 1rem; font-weight: 600;">Chưa có dữ liệu lõi lọc đính kèm</h4>
      </div>
    `;
  }
  container.appendChild(coresCard);

  // History list section
  const section = document.createElement("div");
  section.className = "history-list-section";

  const sectionTitle = document.createElement("div");
  sectionTitle.className = "section-title";
  sectionTitle.innerHTML = `
    <i class="fas fa-history"></i>
    Lịch sử thay lõi
    <span class="count">${historyItems.length} lần</span>
  `;
  section.appendChild(sectionTitle);

  if (historyItems.length > 0) {
    const grid = document.createElement("div");
    grid.className = "history-items-grid";

    // Sort by date (newest first)
    const sortedItems = [...historyItems].sort((a, b) => {
      const dateA = new Date(
        a.replace_date || a.ngay_thay || a.created_at || 0,
      );
      const dateB = new Date(
        b.replace_date || b.ngay_thay || b.created_at || 0,
      );
      return dateB - dateA;
    });

    // Render each item
    sortedItems.forEach(async (item, index) => {
      const card = document.createElement("div");
      card.className = "history-item-card";
      card.onclick = () =>
        (window.location.hash = `#/filter-history-detail/${item.id}`);

      // Initial render with basic info
      const replaceDate = item.replace_date || item.ngay_thay || item.created_at;
      const status = item.status || "1";
      const price = item.price || item.gia;
      const itemNumber = historyItems.length - index;

      card.innerHTML = `
        <div class="history-item-header">
          <div class="item-number-badge">Lần ${itemNumber}</div>
          <div>
          <div class="filter-date">
          <i class="fas fa-clock"></i>
              ${formatDate(replaceDate)}
            </div>
            <div class="filter-name">Đang tải...</div>
              
          </div>
        </div>
        <div class="history-item-details">
          <div class="detail-row">
            <i class="fas fa-user-cog"></i>
            <span><strong>Kỹ thuật viên:</strong> Đang tải...</span>
          </div>
          ${price
          ? `
            <div class="detail-row">
              <i class="fas fa-tag"></i>
              <span><strong>Giá:</strong> ${formatPrice(price)}</span>
            </div>
          `
          : ""
        }
        </div>
      `;

      grid.appendChild(card);

      // Fetch detail data to get filter name and staff name
      try {
        const detailResult = await historyService.getFilterHistoryDetail(item.id);
        const detailData = detailResult.data || detailResult;
        const order = detailData.order || detailData;

        // Get filter core name list or single filter core
        const filterCoreList = Array.isArray(order.order_filter_core) && order.order_filter_core.length > 0
          ? order.order_filter_core
          : null;

        let filterNameDisplay = "";
        if (filterCoreList && filterCoreList.length > 0) {
          filterNameDisplay = filterCoreList.map(c => c.name || "Lõi lọc").join(", ");
        } else {
          filterNameDisplay = order.filter_core_name || order.name || "Lõi lọc";
        }

        // Get staff name
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
          "Chưa phân công";

        // Update card with real data
        card.innerHTML = `
          <div class="history-item-header">
            <div class="item-number-badge">Lần ${itemNumber}</div>
            <div>
              <div class="filter-date">
              <i class="fas fa-clock"></i>
                ${formatDate(replaceDate)}
              </div>
              <div class="filter-name">${filterNameDisplay}</div>
            </div>
          </div>
          <div class="history-item-details">
            <div class="detail-row">
              <i class="fas fa-user-cog"></i>
              <span><strong>Kỹ thuật viên:</strong> ${technicianName}</span>
            </div>
            ${price
            ? `
              <div class="detail-row">
                <i class="fas fa-tag"></i>
                <span><strong>Giá:</strong> ${formatPrice(price)}</span>
              </div>
            `
            : ""
          }
            <div class="detail-row" style="margin-top: 10px; justify-content: flex-end;">
              <button type="button" class="btn-feedback-action" onclick="event.stopPropagation(); window.location.hash='#/booking-history?tab=feedback&order_id=${order.id || item.id}'">
                <i class="fas fa-comment-dots"></i> Góp ý / Khiếu nại
              </button>
            </div>
          </div>
        `;
      } catch (error) {
        console.error("Error loading detail for item:", item.id, error);
      }
    });

    section.appendChild(grid);
  } else {
    const empty = document.createElement("div");
    empty.className = "empty-history";
    empty.innerHTML = `
      <i class="fas fa-inbox"></i>
      <p>Chưa có lịch sử thay lõi nào</p>
    `;
    section.appendChild(empty);
  }

  container.appendChild(section);
}

function getStatusClass(status) {
  const statusNum = parseInt(status);
  const map = { 1: "pending", 2: "confirmed", 3: "completed" };
  return map[statusNum] || "pending";
}

function getStatusText(status) {
  const statusNum = parseInt(status);
  const map = { 1: "Chờ xác nhận", 2: "Đã xác nhận", 3: "Hoàn thành" };
  return map[statusNum] || "Chờ xác nhận";
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
  if (!price) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}
