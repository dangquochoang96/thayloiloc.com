import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { authService } from '../services/auth.service.js';
import { historyService } from '../services/history.service.js';
import { bookingService } from '../services/booking.service.js';

export function BookingHistoryPage() {
  console.log('BookingHistoryPage: Starting to load');
  
  const container = document.createElement('div');
  
  // Add Header
  try {
    container.appendChild(Header());
    console.log('BookingHistoryPage: Header loaded successfully');
  } catch (error) {
    console.error('BookingHistoryPage: Error loading Header:', error);
  }

  let allHistory = [];
  let filteredHistory = [];
  let loading = true;

  const loadHistory = async () => {
    try {
      console.log('BookingHistoryPage: loadHistory started');
      const currentUser = authService.getUser();
      console.log('BookingHistoryPage: Current user:', currentUser);
      
      if (!currentUser || !currentUser.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      console.log('BookingHistoryPage: Calling historyService.getBookingHistory with userId:', currentUser.id);
      console.log('BookingHistoryPage: API endpoint will be: /tasks/customer/' + currentUser.id);
      
      // Use historyService to get booking history
      const result = await historyService.getBookingHistory(currentUser.id);
      
      console.log('BookingHistoryPage: Tasks by customer response:', result);
      console.log('BookingHistoryPage: Response type:', typeof result);
      console.log('BookingHistoryPage: Response keys:', result ? Object.keys(result) : 'null');

      let tasks = [];
      if (result && result.data && Array.isArray(result.data)) {
        tasks = result.data;
        console.log('BookingHistoryPage: Using result.data, length:', tasks.length);
      } else if (result && Array.isArray(result)) {
        tasks = result;
        console.log('BookingHistoryPage: Using direct result, length:', tasks.length);
      } else {
        console.warn('BookingHistoryPage: Unexpected response format:', result);
        tasks = [];
      }

      console.log('BookingHistoryPage: Processed tasks:', tasks);
      allHistory = tasks;
      filteredHistory = tasks;
      loading = false;
      updateDisplay();
    } catch (error) {
      console.error('BookingHistoryPage: Error loading history:', error);
      console.error('BookingHistoryPage: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      loading = false;
      // Show error state
      const loadingState = document.getElementById('historyLoading');
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
    if (status === 'all') {
      filteredHistory = allHistory;
    } else {
      filteredHistory = allHistory.filter(item => item.status === status);
    }
    updateDisplay();
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00 00:00:00') return 'N/A';
    try {
      const parts = dateStr.split(' ');
      const datePart = parts[0].split('-');
      const timePart = parts[1] ? parts[1].substring(0, 5) : '';
      if (datePart.length === 3) {
        return `${datePart[2]}/${datePart[1]}/${datePart[0]}${timePart ? ' ' + timePart : ''}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusClass = (status) => {
    const map = { '1': 'pending', '2': 'confirmed', '3': 'completed', '4': 'cancelled' };
    return map[status] || 'pending';
  };

  const getStatusText = (status) => {
    const map = { '1': 'Chờ xác nhận', '2': 'Đã xác nhận', '3': 'Hoàn thành', '4': 'Đã hủy' };
    return map[status] || 'Chờ xử lý';
  };

  const handleCardClick = (id) => {
    showBookingDetailModal(id);
  };

  const showBookingDetailModal = async (bookingId) => {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
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
    if (!document.getElementById('modal-styles')) {
      const modalStyles = document.createElement('style');
      modalStyles.id = 'modal-styles';
      modalStyles.textContent = `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          opacity: 0;
          animation: fadeIn 0.3s ease forwards;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          to { opacity: 0; }
        }

        .booking-detail-modal {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          transform: scale(0.9);
          animation: scaleIn 0.3s ease forwards;
        }

        @keyframes scaleIn {
          to { transform: scale(1); }
        }

        .modal-header {
          background: linear-gradient(135deg, #f97316, #fb923c);
          color: white;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 2rem;
          max-height: 60vh;
          overflow-y: auto;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1rem 0;
          border-bottom: 1px solid #f1f3f4;
          gap: 1rem;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row.border-top {
          border-top: 2px solid #f1f3f4;
          margin-top: 1rem;
          padding-top: 1.5rem;
        }

        .detail-label {
          font-weight: 600;
          color: #64748b;
          min-width: 140px;
          flex-shrink: 0;
        }

        .detail-value {
          color: #1a1a2e;
          font-weight: 500;
          text-align: right;
          flex: 1;
        }

        .detail-value.highlight {
          color: #f97316;
          font-weight: 700;
        }

        .status-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 15px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-pending {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          color: #856404;
        }

        .status-confirmed {
          background: linear-gradient(135deg, #cce5ff, #b3d9ff);
          color: #004085;
        }

        .status-completed {
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          color: #155724;
        }

        .status-cancelled {
          background: linear-gradient(135deg, #f8d7da, #f5c6cb);
          color: #721c24;
        }

        .loading-state {
          text-align: center;
          padding: 3rem 2rem;
        }

        .loading-state i {
          font-size: 2.5rem;
          color: #f97316;
          margin-bottom: 1rem;
        }

        .error-state {
          text-align: center;
          padding: 3rem 2rem;
        }

        .error-state i {
          font-size: 3rem;
          color: #dc3545;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .booking-detail-modal {
            width: 95%;
            max-height: 90vh;
          }

          .modal-header {
            padding: 1rem 1.5rem;
          }

          .modal-header h2 {
            font-size: 1.1rem;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .detail-label {
            min-width: auto;
          }

          .detail-value {
            text-align: left;
          }
        }
      `;
      document.head.appendChild(modalStyles);
    }

    // Load booking detail data
    try {
      const booking = await bookingService.getBookingDetail(bookingId);

      // Prioritize product address
      const product = booking.product_info || {};
      const displayAddress = product.address || booking.address || booking.customer?.address || 'Chưa cập nhật';

      // Update modal content
      const modalBody = modalOverlay.querySelector('.modal-body');
      modalBody.innerHTML = `
        <div class="detail-row">
          <span class="detail-label">Thời gian:</span>
          <span class="detail-value highlight">${formatDate(booking.appointment_date || booking.time_star)} - ${booking.appointment_time || '14:00'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Công việc:</span>
          <span class="detail-value">${booking.service?.name || booking.name || 'Dịch vụ bảo dưỡng'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Nội dung:</span>
          <span class="detail-value">${booking.service?.description || booking.des || booking.description || 'Không có mô tả'}</span>
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
          <span class="detail-value">${booking.technician?.name || booking.staff_name || 'Chưa phân công'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">SĐT KTV:</span>
          <span class="detail-value">${booking.technician?.phone || booking.staff_phone || 'N/A'}</span>
        </div>
        <div class="detail-row border-top">
          <span class="detail-label">Thông báo:</span>
          <span class="detail-value">${booking.notification || booking.notes || 'Không có thông báo'}</span>
        </div>
      `;

    } catch (error) {
      console.error('Error loading booking detail:', error);
      const modalBody = modalOverlay.querySelector('.modal-body');
      modalBody.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Không thể tải thông tin</h3>
          <p>${error.message || 'Vui lòng thử lại sau'}</p>
        </div>
      `;
    }

    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeBookingModal();
      }
    });

    // Close modal with Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeBookingModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  };

  // Global function to close modal
  window.closeBookingModal = () => {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      modal.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    }
  };

  const renderHistory = (history) => {
    const historyList = document.getElementById('historyList');
    const emptyState = document.getElementById('emptyState');
    
    if (history.length === 0) {
      historyList.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    historyList.style.display = 'block';
    emptyState.style.display = 'none';

    historyList.innerHTML = history.map(item => {
      const customer = item.customer || {};
      const product = item.product_info || {};
      
      let displayDate = 'N/A';
      if (item.time_star) {
        displayDate = formatDate(item.time_star);
      } else if (item.created_at) {
        displayDate = formatDate(item.created_at);
      }

      // Prioritize product address over customer address
      const displayAddress = product.address || item.address || customer.address || 'Chưa cập nhật';

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
            <h3>${item.name || 'Dịch vụ bảo dưỡng'}</h3>
            <p><i class="fas fa-user"></i> ${customer.username || customer.name || 'Khách hàng'}</p>
            <p><i class="fas fa-phone"></i> ${customer.phone || item.phone || ''}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${displayAddress}</p>
            ${product.order_id ? `<p><i class="fas fa-box"></i> Đơn hàng #${product.order_id}</p>` : ''}
            ${item.des ? `<p><i class="fas fa-sticky-note"></i> ${item.des}</p>` : ''}
          </div>
          <div class="history-footer">
            <span class="view-detail">
              <i class="fas fa-eye"></i> Xem chi tiết
            </span>
          </div>
        </div>
      `;
    }).join('');
  };

  const updateDisplay = () => {
    const loadingState = document.getElementById('historyLoading');
    const historyList = document.getElementById('historyList');
    
    if (loadingState) {
      loadingState.style.display = loading ? 'block' : 'none';
    }
    if (historyList) {
      historyList.style.display = loading ? 'none' : 'block';
    }
    
    if (!loading) {
      renderHistory(filteredHistory);
    }
  };

  const page = document.createElement('main');
  page.className = 'booking-history-page';

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .booking-history-page {
      padding: 100px 0 60px;
      min-height: 70vh;
      background: #f8f9fa;
    }

    .page-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .page-header h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin-bottom: 10px;
    }

    .page-header h1 i {
      color: #F97316;
      margin-right: 10px;
    }

    .page-header p {
      color: #666;
    }

    .history-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      justify-content: center;
    }

    .history-tabs .tab {
      padding: 12px 24px;
      background: white;
      border-radius: 25px;
      text-decoration: none;
      color: #666;
      font-weight: 500;
      transition: all 0.3s;
      border: 2px solid #e0e0e0;
      cursor: pointer;
    }

    .history-tabs .tab.active,
    .history-tabs .tab:hover {
      background: #F97316;
      color: white;
      border-color: #F97316;
    }

    .filter-toolbar {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 25px;
      padding: 15px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .filter-toolbar label {
      font-weight: 500;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-toolbar label i {
      color: #F97316;
    }

    .status-filter {
      padding: 10px 20px;
      border: 2px solid #e0e0e0;
      border-radius: 25px;
      font-size: 0.95rem;
      cursor: pointer;
      background: white;
      min-width: 180px;
      transition: all 0.3s;
    }

    .status-filter:focus {
      outline: none;
      border-color: #F97316;
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-state i,
    .empty-state i {
      font-size: 3rem;
      color: #F97316;
      margin-bottom: 20px;
    }

    .empty-state i {
      color: #ccc;
    }

    .empty-state h3 {
      color: #333;
      margin-bottom: 10px;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 20px;
    }

    .history-list {
      display: grid;
      gap: 20px;
    }

    .history-card {
      background: white;
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      transition: all 0.3s;
      cursor: pointer;
    }

    .history-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .history-date {
      color: #666;
      font-size: 0.9rem;
    }

    .history-date i {
      margin-right: 5px;
      color: #F97316;
    }

    .history-status {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-confirmed {
      background: #cce5ff;
      color: #004085;
    }

    .status-completed {
      background: #d4edda;
      color: #155724;
    }

    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .history-body h3 {
      color: #1a1a2e;
      margin-bottom: 10px;
      font-size: 1.1rem;
    }

    .history-body p {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 5px;
    }

    .history-body p i {
      width: 20px;
      color: #F97316;
    }

    .history-footer {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #eee;
      text-align: right;
    }

    .view-detail {
      color: #F97316;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .view-detail i {
      margin-right: 5px;
    }

    .empty-filter-result {
      text-align: center;
      padding: 50px 20px;
      background: white;
      border-radius: 15px;
      color: #666;
    }

    .empty-filter-result i {
      font-size: 2.5rem;
      color: #ccc;
      margin-bottom: 15px;
      display: block;
    }
  `;
  page.appendChild(style);

  // Main content
  const main = document.createElement('main');
  main.className = 'history-main';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';

  // Page header
  const pageHeader = document.createElement('div');
  pageHeader.className = 'page-header';
  pageHeader.innerHTML = `
    <h1><i class="fas fa-calendar-check"></i> Lịch Sử Đặt Lịch</h1>
    <p>Xem lại các lịch hẹn bảo dưỡng, sửa chữa của bạn</p>
  `;
  containerDiv.appendChild(pageHeader);

  // History tabs
  const historyTabs = document.createElement('div');
  historyTabs.className = 'history-tabs';
  historyTabs.innerHTML = `
    <a href="#/booking-history" class="tab active">Lịch sử đặt lịch</a>
    <a href="#/filter-history" class="tab">Nhật ký thay lõi</a>
  `;
  containerDiv.appendChild(historyTabs);

  // Filter toolbar
  const filterToolbar = document.createElement('div');
  filterToolbar.className = 'filter-toolbar';
  
  const filterLabel = document.createElement('label');
  filterLabel.innerHTML = '<i class="fas fa-filter"></i> Lọc theo trạng thái:';
  
  const statusSelect = document.createElement('select');
  statusSelect.className = 'status-filter';
  statusSelect.id = 'statusFilter';
  statusSelect.innerHTML = `
    <option value="all">Tất cả</option>
    <option value="1">Chờ xác nhận</option>
    <option value="2">Đã xác nhận</option>
    <option value="3">Hoàn thành</option>
  `;
  statusSelect.onchange = (e) => filterByStatus(e.target.value);
  
  filterToolbar.appendChild(filterLabel);
  filterToolbar.appendChild(statusSelect);
  containerDiv.appendChild(filterToolbar);

  // Loading state
  const loadingState = document.createElement('div');
  loadingState.className = 'loading-state';
  loadingState.id = 'historyLoading';
  loadingState.style.display = loading ? 'block' : 'none';
  loadingState.innerHTML = `
    <i class="fas fa-spinner fa-spin"></i>
    <p>Đang tải lịch sử...</p>
  `;
  containerDiv.appendChild(loadingState);

  // History list
  const historyList = document.createElement('div');
  historyList.className = 'history-list';
  historyList.id = 'historyList';
  historyList.style.display = loading ? 'none' : 'block';
  containerDiv.appendChild(historyList);

  // Empty state
  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state';
  emptyState.id = 'emptyState';
  emptyState.style.display = 'none';
  emptyState.innerHTML = `
    <i class="fas fa-calendar-times"></i>
    <h3>Chưa có lịch hẹn nào</h3>
    <p>Bạn chưa đặt lịch hẹn nào. Hãy đặt lịch ngay!</p>
    <a href="#/booking" class="btn btn-primary">Đặt Lịch Ngay</a>
  `;
  containerDiv.appendChild(emptyState);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);

  // Check authentication and load data
  setTimeout(() => {
    try {
      console.log('BookingHistoryPage: Checking authentication');
      if (!authService.isAuthenticated()) {
        console.log('BookingHistoryPage: User not authenticated');
        alert('Vui lòng đăng nhập để xem lịch sử!');
        window.location.hash = '#/login';
        return;
      }
      console.log('BookingHistoryPage: User authenticated, loading history');
      loadHistory();
    } catch (error) {
      console.error('BookingHistoryPage: Error in authentication check:', error);
    }
  }, 100);

  // Make functions available globally
  window.handleCardClick = handleCardClick;

  // Add Footer
  try {
    container.appendChild(Footer());
    console.log('BookingHistoryPage: Footer loaded successfully');
  } catch (error) {
    console.error('BookingHistoryPage: Error loading Footer:', error);
  }

  console.log('BookingHistoryPage: Returning container');
  return container;
}