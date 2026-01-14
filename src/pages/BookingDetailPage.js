import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { bookingService } from "../services/booking.service.js";
import { historyService } from "../services/history.service.js";

// Import HTML template
import bookingDetailTemplate from "../templates/booking/booking-detail.html?raw";

// Import CSS styles
import "../styles/booking/booking-detail.css";

export function BookingDetailPage() {
  const container = document.createElement("div");
  container.className = "page-container";

  container.appendChild(Header());

  const bookingContainer = document.createElement("div");
  bookingContainer.innerHTML = bookingDetailTemplate;
  const bookingContent = bookingContainer.firstElementChild;

  // Load booking detail
  loadBookingDetail(bookingContent);

  container.appendChild(bookingContent);
  container.appendChild(Footer());

  return container;
}

async function loadBookingDetail(container) {
  const user = authService.getCurrentUser();
  
  if (!user) {
    console.warn('User not authenticated, redirecting to login');
    window.location.hash = "/login";
    return;
  }

  // Get booking ID from URL hash
  const hash = window.location.hash;
  console.log('Current hash:', hash);
  const bookingId = hash.split('/')[2]; // #/booking-detail/123

  if (!bookingId) {
    console.error('No booking ID found in URL:', hash);
    showError(container, 'Không tìm thấy mã đặt lịch trong URL');
    return;
  }

  console.log('Loading booking detail for ID:', bookingId);

  try {
    // Show loading state
    const loadingState = container.querySelector('#detailLoading');
    const detailContent = container.querySelector('#detailContent');
    const errorState = container.querySelector('#errorState');
    
    if (loadingState) loadingState.style.display = 'block';
    if (detailContent) detailContent.style.display = 'none';
    if (errorState) errorState.style.display = 'none';

    // Use historyService to get booking detail (same as BookingHistoryPage)
    console.log('Attempting to load booking detail using historyService...');
    const booking = await historyService.getBookingDetail(bookingId);
    console.log('Booking detail loaded successfully:', booking);
    
    // Handle different response formats
    let bookingData;
    if (booking && booking.data) {
      bookingData = booking.data;
    } else if (booking) {
      bookingData = booking;
    } else {
      throw new Error('Không có dữ liệu booking');
    }
    
    // Render booking detail
    renderBookingDetail(container, bookingData);

  } catch (error) {
    console.error('Error loading booking detail:', error);
    showError(container, error.message || 'Có lỗi xảy ra khi tải thông tin đặt lịch');
  }
}

function showError(container, message = 'Không tìm thấy thông tin') {
  const loadingState = container.querySelector('#detailLoading');
  const detailContent = container.querySelector('#detailContent');
  const errorState = container.querySelector('#errorState');
  
  if (loadingState) loadingState.style.display = 'none';
  if (detailContent) detailContent.style.display = 'none';
  if (errorState) {
    errorState.style.display = 'block';
    // Update error message if provided
    const errorTitle = errorState.querySelector('h3');
    if (errorTitle) errorTitle.textContent = message;
  }
}

// Status mapping functions - same as BookingHistoryPage
function getStatusClass(status) {
  const map = { '1': 'pending', '2': 'confirmed', '3': 'completed', '4': 'cancelled' };
  return map[status] || 'pending';
}

function getStatusText(status) {
  const map = { '1': 'Chờ xác nhận', '2': 'Đã xác nhận', '3': 'Hoàn thành', '4': 'Đã hủy' };
  return map[status] || 'Chờ xử lý';
}

function renderBookingDetail(container, booking) {
  console.log('Rendering booking detail:', booking);
  
  const loadingState = container.querySelector('#detailLoading');
  const detailContent = container.querySelector('#detailContent');
  const errorState = container.querySelector('#errorState');
  
  // Hide loading, show content
  if (loadingState) loadingState.style.display = 'none';
  if (detailContent) detailContent.style.display = 'block';
  if (errorState) errorState.style.display = 'none';

  // Fill in the data with null checks
  const bookingIdSpan = container.querySelector('#bookingId');
  const timeValue = container.querySelector('#timeValue');
  const taskName = container.querySelector('#taskName');
  const productName = container.querySelector('#productName');
  const description = container.querySelector('#description');
  const address = container.querySelector('#address');
  const status = container.querySelector('#status');
  const staffName = container.querySelector('#staffName');
  const staffPhone = container.querySelector('#staffPhone');
  const notification = container.querySelector('#notification');
  const mediaGallery = container.querySelector('#mediaGallery');

  // Set booking data with safe access - same as BookingHistoryPage logic
  if (bookingIdSpan) bookingIdSpan.textContent = `#${booking.id || 'N/A'}`;
  
  // Handle time display - same logic as BookingHistoryPage
  let displayDate = 'N/A';
  if (booking.time_star) {
    displayDate = formatDate(booking.time_star);
  } else if (booking.appointment_date) {
    displayDate = formatDate(booking.appointment_date);
  } else if (booking.created_at) {
    displayDate = formatDate(booking.created_at);
  }
  if (timeValue) timeValue.textContent = `${displayDate} - ${booking.appointment_time || '14:00'}`;
  
  // Task/Service name - same field priority as BookingHistoryPage
  if (taskName) taskName.textContent = booking.name || booking.service?.name || booking.task_name || 'Dịch vụ bảo dưỡng';
  
  // Product name - same logic
  const customer = booking.customer || {};
  const product = booking.product_info || {};
  if (productName) productName.textContent = product.name || booking.service?.product_name || booking.product_name || 'N/A';
  
  // Description - same field priority
  if (description) description.textContent = booking.des || booking.service?.description || booking.description || booking.notes || 'Không có mô tả';
  
  // Address - prioritize product address over customer address
  const displayAddress = product.address || booking.address || booking.installation_address || customer.address || 'Chưa cập nhật';
  if (address) address.textContent = displayAddress;
  
  // Set status with styling - using same status mapping as BookingHistoryPage
  if (status) {
    const statusText = getStatusText(booking.status);
    const statusClass = getStatusClass(booking.status);
    status.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
  }
  
  // Staff info - same field mapping
  if (staffName) staffName.textContent = booking.technician?.name || booking.staff_name || customer.username || customer.name || 'Chưa phân công';
  if (staffPhone) staffPhone.textContent = booking.technician?.phone || booking.staff_phone || customer.phone || booking.phone || 'N/A';
  
  // Notification - same field priority
  if (notification) notification.textContent = booking.notification || booking.notes || booking.des || 'Không có thông báo';

  // Handle media gallery
  if (mediaGallery) {
    if (booking.media && booking.media.length > 0) {
      mediaGallery.innerHTML = booking.media.map(media => {
        if (media.type === 'image') {
          return `<img src="${media.url}" alt="Hình ảnh" class="media-item" onclick="openMediaModal('${media.url}')">`;
        } else if (media.type === 'video') {
          return `<video src="${media.url}" class="media-item" controls></video>`;
        }
        return '';
      }).join('');
    } else {
      mediaGallery.innerHTML = '<p class="no-media">Chưa có hình ảnh hoặc video</p>';
    }
  }
  
  console.log('Booking detail rendered successfully');
}

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

// Helper functions
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

function showSuccessMessage(message) {
  // Implementation for success message
  alert(message);
}

function showErrorMessage(message) {
  // Implementation for error message
  alert(message);
}

// Global function for opening media modal
window.openMediaModal = (url) => {
  const modal = document.createElement('div');
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
  
  const img = document.createElement('img');
  img.src = url;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 12px;
  `;
  
  modal.appendChild(img);
  document.body.appendChild(modal);
  
  modal.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
};