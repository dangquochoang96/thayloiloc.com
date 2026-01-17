import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { historyService } from "../services/history.service.js";
import { bookingService } from "../services/booking.service.js";
import { getImageUrl } from "../utils/helpers.js";
import "../styles/history/booking-history.css";
import "../styles/history/filter-history.css";
import "../styles/booking/booking.css";

export function BookingHistoryPage() {
  console.log("BookingHistoryPage: Starting to load");

  const container = document.createElement("div");

  // Add Header
  try {
    container.appendChild(Header());
    console.log("BookingHistoryPage: Header loaded successfully");
  } catch (error) {
    console.error("BookingHistoryPage: Error loading Header:", error);
  }

  let allHistory = [];
  let filteredHistory = [];
  let loading = true;

  // Filter history variables
  let allFilterProducts = [];
  let filterHistoryLoaded = false;

  const loadHistory = async () => {
    try {
      console.log("BookingHistoryPage: loadHistory started");
      const currentUser = authService.getUser();
      console.log("BookingHistoryPage: Current user:", currentUser);

      if (!currentUser || !currentUser.id) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      console.log(
        "BookingHistoryPage: Calling historyService.getBookingHistory with userId:",
        currentUser.id,
      );
      console.log(
        "BookingHistoryPage: API endpoint will be: /tasks/customer/" +
          currentUser.id,
      );

      // Use historyService to get booking history
      const result = await historyService.getBookingHistory(currentUser.id);

      console.log("BookingHistoryPage: Tasks by customer response:", result);
      console.log("BookingHistoryPage: Response type:", typeof result);
      console.log(
        "BookingHistoryPage: Response keys:",
        result ? Object.keys(result) : "null",
      );

      let tasks = [];
      if (result && result.data && Array.isArray(result.data)) {
        tasks = result.data;
        console.log(
          "BookingHistoryPage: Using result.data, length:",
          tasks.length,
        );
      } else if (result && Array.isArray(result)) {
        tasks = result;
        console.log(
          "BookingHistoryPage: Using direct result, length:",
          tasks.length,
        );
      } else {
        console.warn("BookingHistoryPage: Unexpected response format:", result);
        tasks = [];
      }

      console.log("BookingHistoryPage: Processed tasks:", tasks);
      allHistory = tasks;
      filteredHistory = tasks;
      loading = false;
      updateDisplay();
    } catch (error) {
      console.error("BookingHistoryPage: Error loading history:", error);
      console.error("BookingHistoryPage: Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      loading = false;
      // Show error state
      const loadingState = document.getElementById("historyLoading");
      if (loadingState) {
        loadingState.innerHTML = `
          <i class="fas fa-exclamation-triangle" style="color:#dc3545;"></i>
          <p>Không thể tải lịch sử: ${error.message}</p>
          <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">API endpoint: /tasks/customer/{userId}</p>
          <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #f97316; color: white; border: none; border-radius: 5px; cursor: pointer;">Thử lại</button>
        `;
      }
      updateDisplay();
    }
  };

  const filterByStatus = (status) => {
    if (status === "all") {
      filteredHistory = allHistory;
    } else {
      filteredHistory = allHistory.filter((item) => item.status === status);
    }
    updateDisplay();
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "0000-00-00 00:00:00") return "N/A";
    try {
      const parts = dateStr.split(" ");
      const datePart = parts[0].split("-");
      const timePart = parts[1] ? parts[1].substring(0, 5) : "";
      if (datePart.length === 3) {
        return `${datePart[2]}/${datePart[1]}/${datePart[0]}${timePart ? " " + timePart : ""}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusClass = (status) => {
    const map = {
      1: "pending",
      2: "confirmed",
      3: "completed",
      4: "cancelled",
    };
    return map[status] || "pending";
  };

  const getStatusText = (status) => {
    const map = {
      1: "Chờ xác nhận",
      2: "Đã xác nhận",
      3: "Hoàn thành",
      4: "Đã hủy",
    };
    return map[status] || "Chờ xử lý";
  };

  const handleCardClick = (id) => {
    showBookingDetailModal(id);
  };

  const showBookingDetailModal = async (bookingId) => {
    // Create modal overlay
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.innerHTML = `
      <div class="modal-content booking-detail-modal">
        <div class="modal-header">
          <h2><i class="fas fa-calendar-check"></i> Chi tiết đặt lịch #${bookingId}</h2>
          <button class="modal-close" onclick="closeBookingModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tải chi tiết...</p>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.appendChild(modalOverlay);

    // Add modal styles
    if (!document.getElementById("modal-styles")) {
      const modalStyles = document.createElement("style");
      modalStyles.id = "modal-styles";
      document.head.appendChild(modalStyles);
    }

    // Load booking detail data
    try {
      const booking = await bookingService.getBookingDetail(bookingId);

      // Prioritize product address
      const product = booking.product_info || {};
      const displayAddress =
        product.address ||
        booking.address ||
        booking.customer?.address ||
        "Chưa cập nhật";

      // Update modal content
      const modalBody = modalOverlay.querySelector(".modal-body");
      modalBody.innerHTML = `
        <div class="detail-row">
          <span class="detail-label">Thời gian:</span>
          <span class="detail-value highlight">${formatDate(booking.appointment_date || booking.time_star)} - ${booking.appointment_time || "14:00"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Công việc:</span>
          <span class="detail-value">${booking.service?.name || booking.name || "Dịch vụ bảo dưỡng"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Nội dung:</span>
          <span class="detail-value">${booking.service?.description || booking.des || booking.description || "Không có mô tả"}</span>
        </div>
        <div class="detail-row border-top">
          <span class="detail-label">Vị trí:</span>
          <span class="detail-value highlight">${displayAddress}</span>
        </div>
        <div class="detail-row border-top">
          <span class="detail-label">Trạng thái:</span>
          <span class="detail-value">
            <span class="status-badge ${getStatusClass(booking.status)}">${getStatusText(booking.status)}</span>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Kỹ thuật viên:</span>
          <span class="detail-value">${booking.technician?.name || booking.staff_name || "Chưa phân công"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">SĐT KTV:</span>
          <span class="detail-value">${booking.technician?.phone || booking.staff_phone || "N/A"}</span>
        </div>
      `;
    } catch (error) {
      console.error("Error loading booking detail:", error);
      const modalBody = modalOverlay.querySelector(".modal-body");
      modalBody.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Không thể tải thông tin</h3>
          <p>${error.message || "Vui lòng thử lại sau"}</p>
        </div>
      `;
    }

    // Close modal when clicking overlay
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeBookingModal();
      }
    });

    // Close modal with Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeBookingModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  };

  // Global function to close modal
  window.closeBookingModal = () => {
    const modal = document.querySelector(".modal-overlay");
    if (modal) {
      modal.style.animation = "fadeOut 0.3s ease forwards";
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    }
  };

  const renderHistory = (history) => {
    const historyList = document.getElementById("historyList");
    const emptyState = document.getElementById("emptyState");

    if (history.length === 0) {
      historyList.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    historyList.style.display = "block";
    emptyState.style.display = "none";

    historyList.innerHTML = history
      .map((item) => {
        const customer = item.customer || {};
        const product = item.product_info || {};

        let displayDate = "N/A";
        if (item.time_star) {
          displayDate = formatDate(item.time_star);
        } else if (item.created_at) {
          displayDate = formatDate(item.created_at);
        }

        // Prioritize product address over customer address
        const displayAddress =
          product.address ||
          item.address ||
          customer.address ||
          "Chưa cập nhật";

        return `
        <div class="history-card" onclick="handleCardClick(${item.id})" style="cursor: pointer;">
          <div class="history-header">
            <span class="history-date">
              <i class="fas fa-calendar"></i> ${displayDate}
            </span>
            <span class="history-status status-${getStatusClass(item.status)}">
              ${getStatusText(item.status)}
            </span>
          </div>
          <div class="history-body">
            <h3>${item.name || "Dịch vụ bảo dưỡng"}</h3>
            <p><i class="fas fa-user"></i> ${customer.username || customer.name || "Khách hàng"}</p>
            <p><i class="fas fa-phone"></i> ${customer.phone || item.phone || ""}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${displayAddress}</p>
            ${product.order_id ? `<p><i class="fas fa-box"></i> Đơn hàng #${product.order_id}</p>` : ""}
            ${item.des ? `<p><i class="fas fa-sticky-note"></i> ${item.des}</p>` : ""}
          </div>
          <div class="history-footer">
            <span class="view-detail">
              <i class="fas fa-eye"></i> Xem chi tiết
            </span>
          </div>
        </div>
      `;
      })
      .join("");
  };

  const updateDisplay = () => {
    const loadingState = document.getElementById("historyLoading");
    const historyList = document.getElementById("historyList");

    if (loadingState) {
      loadingState.style.display = loading ? "block" : "none";
    }
    if (historyList) {
      historyList.style.display = loading ? "none" : "block";
    }

    if (!loading) {
      renderHistory(filteredHistory);
    }
  };

  // Load filter history products
  const loadFilterHistory = async () => {
    filterHistoryLoaded = true;
    const loadingState = document.getElementById("filterProductsLoading");
    const productsList = document.getElementById("filterProductsList");
    const emptyState = document.getElementById("filterEmptyState");

    try {
      if (loadingState) loadingState.style.display = "block";
      if (productsList) productsList.style.display = "none";
      if (emptyState) emptyState.style.display = "none";

      const currentUser = authService.getUser();
      if (!currentUser || !currentUser.id || !currentUser.phone) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      // Get list of products
      const productsResult = await historyService.getFilterHistory(
        currentUser.id,
      );
      let products = [];
      if (productsResult.data && productsResult.data.listProducts) {
        products = productsResult.data.listProducts;
      } else if (productsResult.data && Array.isArray(productsResult.data)) {
        products = productsResult.data;
      } else if (Array.isArray(productsResult)) {
        products = productsResult;
      }

      // Get history count for each product - PARALLEL LOADING for better performance
      const historyPromises = products.map(async (product) => {
        if (!product.id) {
          return {
            ...product,
            historyCount: 0,
            hasHistory: false,
          };
        }

        try {
          const historyResult =
            await historyService.getFilterCoreHistoryByPhone(
              product.id,
              currentUser.phone,
            );

          let historyCount = 0;
          if (historyResult.data) {
            if (
              historyResult.data.history &&
              Array.isArray(historyResult.data.history)
            ) {
              historyCount = historyResult.data.history.length;
            } else if (historyResult.data.product?.order_filter_cores) {
              historyCount =
                historyResult.data.product.order_filter_cores.length;
            }
          }

          return {
            ...product,
            historyCount: historyCount,
            hasHistory: historyCount > 0,
          };
        } catch (error) {
          console.warn(
            `Failed to load history for product ${product.id}:`,
            error,
          );
          return {
            ...product,
            historyCount: 0,
            hasHistory: false,
          };
        }
      });

      // Wait for all history requests to complete in parallel
      const productsWithHistory = await Promise.all(historyPromises);

      allFilterProducts = productsWithHistory;

      if (loadingState) loadingState.style.display = "none";

      if (allFilterProducts.length > 0) {
        displayFilterProducts(allFilterProducts);
        if (productsList) productsList.style.display = "block";
        if (emptyState) emptyState.style.display = "none";
      } else {
        if (emptyState) emptyState.style.display = "block";
        if (productsList) productsList.style.display = "none";
      }
    } catch (error) {
      console.error("Error loading filter history:", error);
      if (loadingState) {
        loadingState.innerHTML = `
          <i class="fas fa-exclamation-triangle" style="color:#dc3545;"></i>
          <p>Không thể tải dữ liệu. Vui lòng thử lại.</p>
          <p style="font-size: 0.85rem; color: #666; margin-top: 8px;">Lỗi: ${error.message}</p>
        `;
      }
    }
  };

  // Display filter products
  const displayFilterProducts = (products) => {
    const container = document.getElementById("filterProductsList");
    if (!container) return;

    const currentUser = authService.getUser();
    const userPhone = currentUser?.phone || "N/A";

    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    };

    container.innerHTML = products
      .map((product) => {
        const productName = product.product?.name || product.name || "Sản phẩm";
        const address = product.address || "Chưa có địa chỉ";
        const purchaseDate = product.ngaymua || product.created_at;
        const filterLevel = product.filter_core_level || "?";
        const historyCount = product.historyCount || 0;

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

        return `
        <div class="product-filter-card" onclick="window.location.hash='#/product-filter-history/${product.id}'" style="cursor:pointer;">
          <div class="product-card-content">
            <div class="product-card-left">
              <div class="product-header">
                <div class="product-info">
                  <h3><i class="fas fa-tint"></i> ${productName}</h3>
                  <p class="product-address"><i class="fas fa-map-marker-alt"></i> ${address}</p>
                  <p class="product-date"><i class="fas fa-calendar"></i> Ngày mua: ${formatDate(purchaseDate)}</p>
                  <p class="product-date"><i class="fas fa-phone"></i> SĐT: ${userPhone}</p>
                  <span class="filter-level">${filterLevel} Cấp lọc</span>
                </div>
              </div>
              <div class="filter-details">
                <div class="history-count-badge">
                  <i class="fas fa-history"></i>
                  <span><strong>${historyCount}</strong> lần thay lõi</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="view-detail">
                  <i class="fas fa-eye"></i> Xem lịch sử thay lõi
                </span>
              </div>
            </div>
            <div class="product-card-right">
              <div class="product-image-wrapper">
                <img src="${productImage}" alt="${productName}" onerror="this.src='/images/default-service.svg'" />
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  };

  const page = document.createElement("main");
  page.className = "booking-history-page";

  // Main content
  const main = document.createElement("main");
  main.className = "history-main";

  const containerDiv = document.createElement("div");
  containerDiv.className = "container";

  // Page header
  const pageHeader = document.createElement("div");
  pageHeader.className = "page-header";
  pageHeader.innerHTML = `
    <h1><i class="fas fa-calendar-check"></i> Lịch Sử Đặt Lịch</h1>
    <p>Xem lại các lịch hẹn bảo dưỡng, sửa chữa của bạn</p>
  `;
  containerDiv.appendChild(pageHeader);

  // History tabs with state management
  let activeTab = "booking-history";

  const historyTabs = document.createElement("div");
  historyTabs.className = "history-tabs";
  historyTabs.innerHTML = `
    <button class="tab active" data-tab="booking-history">
      <i class="fas fa-calendar-check"></i> Lịch Sử Đặt Lịch
    </button>
    <button class="tab" data-tab="filter-history">
      <i class="fas fa-filter"></i> Nhật Ký Thay Lõi
    </button>
    <button class="tab" data-tab="feedback">
      <i class="fas fa-comment-dots"></i> Góp ý, Khiếu nại
    </button>
  `;
  containerDiv.appendChild(historyTabs);

  // Tab Content Container for Booking History
  const bookingHistoryTab = document.createElement("div");
  bookingHistoryTab.className = "tab-content active";
  bookingHistoryTab.id = "booking-history-content";

  // Filter toolbar
  const filterToolbar = document.createElement("div");
  filterToolbar.className = "filter-toolbar";

  const filterLabel = document.createElement("label");
  filterLabel.innerHTML = '<i class="fas fa-filter"></i> Lọc theo trạng thái:';

  const statusSelect = document.createElement("select");
  statusSelect.className = "status-filter";
  statusSelect.id = "statusFilter";
  statusSelect.innerHTML = `
    <option value="all">Tất cả</option>
    <option value="1">Chờ xác nhận</option>
    <option value="2">Đã xác nhận</option>
    <option value="3">Hoàn thành</option>
  `;
  statusSelect.onchange = (e) => filterByStatus(e.target.value);

  filterToolbar.appendChild(filterLabel);
  filterToolbar.appendChild(statusSelect);
  bookingHistoryTab.appendChild(filterToolbar);

  // Loading state
  const loadingState = document.createElement("div");
  loadingState.className = "loading-state";
  loadingState.id = "historyLoading";
  loadingState.style.display = loading ? "block" : "none";
  loadingState.innerHTML = `
    <i class="fas fa-spinner fa-spin"></i>
    <p>Đang tải lịch sử...</p>
  `;
  bookingHistoryTab.appendChild(loadingState);

  // History list
  const historyList = document.createElement("div");
  historyList.className = "history-list";
  historyList.id = "historyList";
  historyList.style.display = loading ? "none" : "block";
  bookingHistoryTab.appendChild(historyList);

  // Empty state
  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";
  emptyState.id = "emptyState";
  emptyState.style.display = "none";
  emptyState.innerHTML = `
    <i class="fas fa-calendar-times"></i>
    <h3>Chưa có lịch hẹn nào</h3>
    <p>Bạn chưa đặt lịch hẹn nào. Hãy đặt lịch ngay!</p>
    <a href="#/booking" class="btn btn-primary">Đặt Lịch Ngay</a>
  `;
  bookingHistoryTab.appendChild(emptyState);

  containerDiv.appendChild(bookingHistoryTab);

  // Tab Content for Filter History
  const filterHistoryTab = document.createElement("div");
  filterHistoryTab.className = "tab-content";
  filterHistoryTab.id = "filter-history-content";

  // Loading state for filter history
  const filterLoadingState = document.createElement("div");
  filterLoadingState.className = "loading-state";
  filterLoadingState.id = "filterProductsLoading";
  filterLoadingState.innerHTML = `
    <i class="fas fa-spinner fa-spin"></i>
    <p>Đang tải sản phẩm...</p>
  `;
  filterHistoryTab.appendChild(filterLoadingState);

  // Products list for filter history
  const filterProductsList = document.createElement("div");
  filterProductsList.className = "products-filter-list";
  filterProductsList.id = "filterProductsList";
  filterProductsList.style.display = "none";
  filterHistoryTab.appendChild(filterProductsList);

  // Empty state for filter history
  const filterEmptyState = document.createElement("div");
  filterEmptyState.className = "empty-state";
  filterEmptyState.id = "filterEmptyState";
  filterEmptyState.style.display = "none";
  filterEmptyState.innerHTML = `
    <i class="fas fa-box-open"></i>
    <h3>Chưa có sản phẩm nào</h3>
    <p>Bạn chưa có sản phẩm nào được đăng ký.</p>
  `;
  filterHistoryTab.appendChild(filterEmptyState);

  containerDiv.appendChild(filterHistoryTab);

  // Tab Content for Feedback
  const feedbackTab = document.createElement("div");
  feedbackTab.className = "tab-content";
  feedbackTab.id = "feedback-content";

  // Store selected files for feedback
  let selectedFeedbackFiles = [];

  feedbackTab.innerHTML = `
    <div class="feedback-container">
      <div class="feedback-content">
        <form id="feedback-form" class="feedback-form">
          <div class="form-group">
            <label for="order_id"><i class="fas fa-receipt"></i> Chọn đơn hàng</label>
            <select id="order_id" name="order_id" required>
              <option value="">-- Đang tải đơn hàng... --</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description"><i class="fas fa-comment-alt"></i> Nội dung phản hồi</label>
            <textarea id="description" name="description" rows="6" placeholder="Nhập nội dung phản hồi của bạn..." required></textarea>
          </div>

          <div class="form-group">
            <label for="images"><i class="fas fa-images"></i> Hình ảnh đính kèm</label>
            <div class="image-upload-container">
              <input type="file" id="images" name="images" accept="image/*" multiple>
              <div class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Chọn hoặc kéo thả hình ảnh vào đây</span>
              </div>
            </div>
            <div class="image-preview" id="image-preview"></div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit">
              <i class="fas fa-paper-plane"></i> Gửi Phản Hồi
            </button>
          </div>
        </form>

        <div class="feedback-info">
          <div class="info-card">
            <i class="fas fa-clock"></i>
            <h3>Thời gian phản hồi</h3>
            <p>Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc</p>
          </div>
          <div class="info-card">
            <i class="fas fa-shield-alt"></i>
            <h3>Bảo mật thông tin</h3>
            <p>Thông tin của bạn được bảo mật tuyệt đối</p>
          </div>
          <div class="info-card">
            <i class="fas fa-headset"></i>
            <h3>Hỗ trợ 24/7</h3>
            <p>Hotline: 0963456911</p>
          </div>
        </div>
      </div>
    </div>
  `;
  containerDiv.appendChild(feedbackTab);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);

  // Check authentication and load data
  setTimeout(() => {
    try {
      console.log("BookingHistoryPage: Checking authentication");
      if (!authService.isAuthenticated()) {
        console.log("BookingHistoryPage: User not authenticated");
        alert("Vui lòng đăng nhập để xem lịch sử!");
        window.location.hash = "#/login";
        return;
      }
      console.log("BookingHistoryPage: User authenticated, loading history");

      // Load both booking history and filter history in parallel for better UX
      loadHistory();
      loadFilterHistory(); // Preload filter history data in background

      // Setup feedback form after authentication check
      setupFeedbackForm();

      // Check URL parameters for tab switching
      const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
      const tabParam = urlParams.get("tab");

      if (tabParam) {
        // Find and click the corresponding tab
        const targetTab = historyTabs.querySelector(`[data-tab="${tabParam}"]`);
        if (targetTab) {
          // Simulate click to switch tab
          targetTab.click();
        }
      }
    } catch (error) {
      console.error(
        "BookingHistoryPage: Error in authentication check:",
        error,
      );
    }
  }, 100);

  // Tab switching functionality
  const tabs = historyTabs.querySelectorAll(".tab");
  const tabContents = containerDiv.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Update active content
      tabContents.forEach((content) => {
        content.classList.remove("active");
      });

      const activeContent = containerDiv.querySelector(`#${tabName}-content`);
      if (activeContent) {
        activeContent.classList.add("active");
      }

      activeTab = tabName;
    });
  });

  // Feedback form functionality
  const setupFeedbackForm = async () => {
    const feedbackForm = feedbackTab.querySelector("#feedback-form");
    const imageInput = feedbackTab.querySelector("#images");
    const imagePreview = feedbackTab.querySelector("#image-preview");
    const orderSelect = feedbackTab.querySelector("#order_id");

    // Load user orders
    try {
      const user = authService.getUser();
      const userId = user.id || user.user_id || user.userId;
      const result = await historyService.getListOrderByCustomer(userId);

      const orders = result.data || [];

      if (orders.length === 0) {
        orderSelect.innerHTML = `<option value="">-- Không có đơn hàng nào --</option>`;
      } else {
        orderSelect.innerHTML = `<option value="">-- Chọn đơn hàng --</option>`;
        orders.forEach((order) => {
          const orderId = order.id;
          const productName = order.product || "";
          const orderDate = order.created_at
            ? new Date(order.created_at).toLocaleDateString("vi-VN")
            : "";
          orderSelect.innerHTML += `<option value="${orderId}">${productName} ${orderDate ? `(${orderDate})` : ""} ID: ${orderId}</option>`;
        });
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      orderSelect.innerHTML = `<option value="">-- Không thể tải đơn hàng --</option>`;
    }

    // Image preview functionality
    const renderImagePreviews = () => {
      imagePreview.innerHTML = "";

      Array.from(selectedFeedbackFiles).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewItem = document.createElement("div");
          previewItem.className = "preview-item";
          previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview ${index + 1}">
            <button type="button" class="remove-image" data-index="${index}">
              <i class="fas fa-times"></i>
            </button>
          `;

          const removeButton = previewItem.querySelector(".remove-image");
          removeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedFeedbackFiles.splice(index, 1);

            const dt = new DataTransfer();
            selectedFeedbackFiles.forEach((file) => dt.items.add(file));
            imageInput.files = dt.files;

            renderImagePreviews();
          });

          imagePreview.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
      });

      const dt = new DataTransfer();
      selectedFeedbackFiles.forEach((file) => dt.items.add(file));
      imageInput.files = dt.files;
    };

    if (imageInput) {
      imageInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);

        files.forEach((file) => {
          if (
            file.type.startsWith("image/") &&
            selectedFeedbackFiles.length < 4
          ) {
            selectedFeedbackFiles.push(file);
          }
        });

        renderImagePreviews();
      });

      const uploadContainer = feedbackTab.querySelector(
        ".image-upload-container",
      );
      uploadContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadContainer.classList.add("drag-over");
      });

      uploadContainer.addEventListener("dragleave", () => {
        uploadContainer.classList.remove("drag-over");
      });

      uploadContainer.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadContainer.classList.remove("drag-over");

        const files = Array.from(e.dataTransfer.files).filter((file) =>
          file.type.startsWith("image/"),
        );

        files.forEach((file) => {
          if (selectedFeedbackFiles.length < 4) {
            selectedFeedbackFiles.push(file);
          }
        });

        renderImagePreviews();
      });
    }

    // Form submission
    if (feedbackForm) {
      feedbackForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = feedbackForm.querySelector(".btn-submit");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        submitBtn.disabled = true;

        try {
          const orderId = orderSelect.value;
          const description = feedbackForm.querySelector("#description").value;
          const user = authService.getUser();
          const customerId = user.id || user.user_id || user.userId;

          if (!orderId) {
            showFeedbackMessage(feedbackTab, "Vui lòng chọn đơn hàng", "error");
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
          }

          // Upload images first
          const imageFiles = imageInput.files;
          let imageUrls = [];

          if (imageFiles.length > 0) {
            submitBtn.innerHTML =
              '<i class="fas fa-spinner fa-spin"></i> Đang tải ảnh...';
            try {
              const { api } = await import("../services/api.js");
              imageUrls = await api.uploadMultipleImages(imageFiles);
            } catch (uploadError) {
              console.error("Error uploading images:", uploadError);
              showFeedbackMessage(
                feedbackTab,
                "Không thể tải ảnh lên. Vui lòng thử lại.",
                "error",
              );
              submitBtn.innerHTML = originalText;
              submitBtn.disabled = false;
              return;
            }
            submitBtn.innerHTML =
              '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
          }

          // Send feedback
          const formData = new FormData();
          formData.append("order_id", orderId);
          formData.append("description", description);
          formData.append("customer_id", customerId);

          if (imageUrls.length > 0) {
            imageUrls.forEach((url) => {
              formData.append("images[]", url);
            });
          }

          const { api } = await import("../services/api.js");
          const res = await api.postFormData("/feedbacks", formData);
          console.log(res);

          showFeedbackMessage(
            feedbackTab,
            "Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ liên hệ lại sớm nhất.",
            "success",
          );
          feedbackForm.reset();
          imagePreview.innerHTML = "";
          imageInput.value = "";
          selectedFeedbackFiles = [];

          // Reload orders
          const result =
            await historyService.getListOrderByCustomer(customerId);
          const orders = result.data || [];
          if (orders.length === 0) {
            orderSelect.innerHTML = `<option value="">-- Không có đơn hàng nào --</option>`;
          } else {
            orderSelect.innerHTML = `<option value="">-- Chọn đơn hàng --</option>`;
            orders.forEach((order) => {
              const orderId = order.id;
              const productName = order.product || "";
              const orderDate = order.created_at
                ? new Date(order.created_at).toLocaleDateString("vi-VN")
                : "";
              orderSelect.innerHTML += `<option value="${orderId}">${productName} ${orderDate ? `(${orderDate})` : ""} ID: ${orderId}</option>`;
            });
          }
        } catch (error) {
          console.error("Error submitting feedback:", error);
          showFeedbackMessage(
            feedbackTab,
            error.message || "Có lỗi xảy ra khi gửi phản hồi",
            "error",
          );
        } finally {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      });
    }
  };

  // Helper function to show feedback messages
  const showFeedbackMessage = (container, message, type) => {
    const existingMsg = container.querySelector(".feedback-message");
    if (existingMsg) existingMsg.remove();

    const msg = document.createElement("div");
    msg.className = `feedback-message ${type}`;
    msg.innerHTML = `
      <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
      <span>${message}</span>
    `;

    const form = container.querySelector(".feedback-form");
    form.insertBefore(msg, form.firstChild);

    setTimeout(() => msg.remove(), 5000);
  };

  // Make functions available globally
  window.handleCardClick = handleCardClick;

  // Add Footer
  try {
    container.appendChild(Footer());
    console.log("BookingHistoryPage: Footer loaded successfully");
  } catch (error) {
    console.error("BookingHistoryPage: Error loading Footer:", error);
  }

  console.log("BookingHistoryPage: Returning container");
  return container;
}
