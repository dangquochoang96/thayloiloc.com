import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { authService } from '../services/auth.service.js';
import { historyService } from '../services/history.service.js';

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
      
      let result;
      try {
        // Use historyService to get booking history
        result = await historyService.getBookingHistory(currentUser.id);
      } catch (serviceError) {
        console.warn('BookingHistoryPage: historyService failed, falling back to direct fetch:', serviceError);
        // Fallback to direct fetch if service fails
        const response = await fetch(`https://api.chothuetatca.com/api/tasks/customer/${currentUser.id}`);
        result = await response.json();
      }
      
      console.log('BookingHistoryPage: Tasks by customer response:', result);

      let tasks = [];
      if (result.data && Array.isArray(result.data)) {
        tasks = result.data;
      } else if (Array.isArray(result)) {
        tasks = result;
      }

      console.log('BookingHistoryPage: Processed tasks:', tasks);
      allHistory = tasks;
      filteredHistory = tasks;
      loading = false;
      updateDisplay();
    } catch (error) {
      console.error('BookingHistoryPage: Error loading history:', error);
      loading = false;
      // Show error state
      const loadingState = document.getElementById('historyLoading');
      if (loadingState) {
        loadingState.innerHTML = `
          <i class="fas fa-exclamation-triangle" style="color:#dc3545;"></i>
          <p>Không thể tải lịch sử. Vui lòng thử lại sau.</p>
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
    window.location.hash = `#/booking-detail/${id}`;
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

      return `
        <div class="history-card" onclick="window.location.hash='#/booking-detail/${item.id}'" style="cursor: pointer;">
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
            <p><i class="fas fa-map-marker-alt"></i> ${customer.address || item.address || ''}</p>
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