import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { bookingService } from "../services/booking.service.js";

// Import HTML template
import bookingDetailTemplate from "../templates/booking/booking-detail.html?raw";

// Import CSS styles
import "../styles/booking/booking-detail.css";

export function BookingDetailPage() {
  const container = document.createElement("div");
  container.className = "page-container";

  container.appendChild(Header());

  const main = document.createElement("main");
  main.className = "booking-detail-main";

  const bookingContainer = document.createElement("div");
  bookingContainer.innerHTML = bookingDetailTemplate;
  const bookingContent = bookingContainer.firstElementChild;

  // Load booking detail
  loadBookingDetail(bookingContent);

  // Setup event listeners
  setupEventListeners(bookingContent);

  main.appendChild(bookingContent);
  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}

async function loadBookingDetail(container) {
  const user = authService.getCurrentUser();
  
  if (!user) {
    window.location.hash = "/login";
    return;
  }

  // Get booking ID from URL hash
  const hash = window.location.hash;
  const bookingId = hash.split('/')[2]; // #/booking-detail/123

  if (!bookingId) {
    showError(container, "Không tìm thấy thông tin đặt lịch");
    return;
  }

  try {
    // Show loading state
    showLoading(container);

    // Fetch booking detail from API
    const booking = await bookingService.getBookingDetail(bookingId);
    
    // Render booking detail
    renderBookingDetail(container, booking);

  } catch (error) {
    console.error('Error loading booking detail:', error);
    showError(container, error.message || "Có lỗi xảy ra khi tải thông tin đặt lịch");
  }
}

function showLoading(container) {
  const loadingHtml = `
    <div class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Đang tải thông tin đặt lịch...</p>
    </div>
  `;
  container.innerHTML = loadingHtml;
}

function showError(container, message) {
  const errorHtml = `
    <div class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3>Có lỗi xảy ra</h3>
      <p>${message}</p>
      <div class="error-actions">
        <button onclick="history.back()" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Quay lại
        </button>
        <button onclick="location.reload()" class="btn btn-primary">
          <i class="fas fa-redo"></i> Thử lại
        </button>
      </div>
    </div>
  `;
  container.innerHTML = errorHtml;
}

function renderBookingDetail(container, booking) {
  const statusText = bookingService.getStatusText(booking.status);
  const statusIcon = bookingService.getStatusIcon(booking.status);
  const statusClass = bookingService.getStatusClass(booking.status);

  const detailHtml = `
    <div class="booking-detail-container">
      <div class="container">
        <!-- Header -->
        <div class="detail-header">
          <button onclick="history.back()" class="back-btn">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="header-info">
            <h1>Chi tiết đặt lịch</h1>
            <p>Mã đặt lịch: <strong>#${booking.id}</strong></p>
          </div>
          <div class="booking-status ${statusClass}">
            <i class="fas ${statusIcon}"></i>
            <span>${statusText}</span>
          </div>
        </div>

        <!-- Main Content -->
        <div class="detail-content">
          <!-- Service Info -->
          <div class="detail-card service-info">
            <h3><i class="fas fa-cog"></i> Thông tin dịch vụ</h3>
            <div class="service-details">
              <div class="service-item">
                <img src="${booking.service?.image || '/public/images/default-service.svg'}" alt="${booking.service?.name}" class="service-image">
                <div class="service-content">
                  <h4>${booking.service?.name || 'Dịch vụ không xác định'}</h4>
                  <p class="service-description">${booking.service?.description || ''}</p>
                  <div class="service-price">
                    <span class="price">${formatPrice(booking.service?.price || 0)}</span>
                    <span class="duration">${booking.service?.duration || 60} phút</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Booking Info -->
          <div class="detail-card booking-info">
            <h3><i class="fas fa-calendar-alt"></i> Thông tin đặt lịch</h3>
            <div class="info-grid">
              <div class="info-item">
                <label><i class="fas fa-calendar"></i> Ngày hẹn</label>
                <span>${formatDate(booking.appointment_date)}</span>
              </div>
              <div class="info-item">
                <label><i class="fas fa-clock"></i> Giờ hẹn</label>
                <span>${booking.appointment_time}</span>
              </div>
              <div class="info-item">
                <label><i class="fas fa-map-marker-alt"></i> Địa chỉ</label>
                <span>${booking.address}</span>
              </div>
              <div class="info-item">
                <label><i class="fas fa-phone"></i> Số điện thoại</label>
                <span>${booking.phone}</span>
              </div>
              <div class="info-item">
                <label><i class="fas fa-sticky-note"></i> Ghi chú</label>
                <span>${booking.notes || 'Không có ghi chú'}</span>
              </div>
              <div class="info-item">
                <label><i class="fas fa-calendar-plus"></i> Ngày đặt</label>
                <span>${formatDateTime(booking.created_at)}</span>
              </div>
            </div>
          </div>

          <!-- Technician Info -->
          ${booking.technician ? `
            <div class="detail-card technician-info">
              <h3><i class="fas fa-user-cog"></i> Thông tin kỹ thuật viên</h3>
              <div class="technician-details">
                <div class="technician-avatar">
                  <img src="${booking.technician.avatar || '/public/images/default-avatar.svg'}" alt="${booking.technician.name}">
                </div>
                <div class="technician-content">
                  <h4>${booking.technician.name}</h4>
                  <p><i class="fas fa-phone"></i> ${booking.technician.phone}</p>
                  <p><i class="fas fa-star"></i> Đánh giá: ${booking.technician.rating || 'Chưa có'}/5</p>
                  <p><i class="fas fa-briefcase"></i> Kinh nghiệm: ${booking.technician.experience || 'N/A'} năm</p>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Payment Info -->
          <div class="detail-card payment-info">
            <h3><i class="fas fa-credit-card"></i> Thông tin thanh toán</h3>
            <div class="payment-details">
              <div class="payment-row">
                <span>Giá dịch vụ:</span>
                <span>${formatPrice(booking.service?.price || 0)}</span>
              </div>
              <div class="payment-row">
                <span>Phí di chuyển:</span>
                <span>${formatPrice(booking.travel_fee || 0)}</span>
              </div>
              <div class="payment-row">
                <span>Giảm giá:</span>
                <span class="discount">-${formatPrice(booking.discount || 0)}</span>
              </div>
              <div class="payment-row total">
                <span>Tổng cộng:</span>
                <span>${formatPrice(booking.total_amount || 0)}</span>
              </div>
              <div class="payment-method">
                <span>Phương thức thanh toán:</span>
                <span class="method">${getPaymentMethodText(booking.payment_method)}</span>
              </div>
              <div class="payment-status ${booking.payment_status}">
                <i class="fas ${getPaymentStatusIcon(booking.payment_status)}"></i>
                <span>${getPaymentStatusText(booking.payment_status)}</span>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          ${booking.timeline ? `
            <div class="detail-card timeline-info">
              <h3><i class="fas fa-history"></i> Lịch sử trạng thái</h3>
              <div class="timeline">
                ${booking.timeline.map(item => `
                  <div class="timeline-item">
                    <div class="timeline-icon">
                      <i class="fas ${bookingService.getStatusIcon(item.status)}"></i>
                    </div>
                    <div class="timeline-content">
                      <h5>${bookingService.getStatusText(item.status)}</h5>
                      <p>${item.note || ''}</p>
                      <span class="timeline-date">${formatDateTime(item.created_at)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Actions -->
          <div class="detail-actions">
            ${getActionButtons(booking)}
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = detailHtml;
}

function getActionButtons(booking) {
  const buttons = [];

  // Cancel button - only for pending/confirmed bookings
  if (['pending', 'confirmed'].includes(booking.status)) {
    buttons.push(`
      <button class="btn btn-danger" onclick="cancelBooking(${booking.id})">
        <i class="fas fa-times"></i> Hủy đặt lịch
      </button>
    `);
  }

  // Rate button - only for completed bookings without rating
  if (booking.status === 'completed' && !booking.rating) {
    buttons.push(`
      <button class="btn btn-primary" onclick="showRatingModal(${booking.id})">
        <i class="fas fa-star"></i> Đánh giá dịch vụ
      </button>
    `);
  }

  // Rebook button - for completed bookings
  if (booking.status === 'completed') {
    buttons.push(`
      <button class="btn btn-secondary" onclick="rebookService(${booking.service?.id})">
        <i class="fas fa-redo"></i> Đặt lại dịch vụ
      </button>
    `);
  }

  return buttons.join('');
}

function setupEventListeners(container) {
  // Global functions for button actions
  window.cancelBooking = async (bookingId) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đặt lịch này?')) return;

    try {
      await bookingService.cancelBooking(bookingId);
      showSuccessMessage('Hủy đặt lịch thành công!');
      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch (error) {
      showErrorMessage(error.message || 'Có lỗi xảy ra khi hủy đặt lịch');
    }
  };

  window.showRatingModal = (bookingId) => {
    // Implementation for rating modal
    console.log('Show rating modal for booking:', bookingId);
  };

  window.rebookService = (serviceId) => {
    window.location.hash = `/booking?service=${serviceId}`;
  };
}

// Helper functions
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
}

function getPaymentMethodText(method) {
  const methods = {
    'cash': 'Tiền mặt',
    'card': 'Thẻ tín dụng',
    'bank_transfer': 'Chuyển khoản',
    'e_wallet': 'Ví điện tử'
  };
  return methods[method] || 'Không xác định';
}

function getPaymentStatusText(status) {
  const statuses = {
    'pending': 'Chờ thanh toán',
    'paid': 'Đã thanh toán',
    'failed': 'Thanh toán thất bại',
    'refunded': 'Đã hoàn tiền'
  };
  return statuses[status] || 'Không xác định';
}

function getPaymentStatusIcon(status) {
  const icons = {
    'pending': 'fa-clock',
    'paid': 'fa-check-circle',
    'failed': 'fa-times-circle',
    'refunded': 'fa-undo'
  };
  return icons[status] || 'fa-question-circle';
}

function showSuccessMessage(message) {
  // Implementation for success message
  alert(message);
}

function showErrorMessage(message) {
  // Implementation for error message
  alert(message);
}