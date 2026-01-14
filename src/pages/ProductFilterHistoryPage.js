import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { authService } from '../services/auth.service.js';
import { historyService } from '../services/history.service.js';

export function ProductFilterHistoryPage() {
  const container = document.createElement('div');
  container.className = 'page-container';
  
  container.appendChild(Header());

  const page = document.createElement('main');
  page.className = 'product-history-page';

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .product-history-page {
      padding: 100px 0 60px;
      min-height: 80vh;
      background: #f8f9fa;
    }

    .history-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #F97316;
      text-decoration: none;
      font-weight: 500;
      margin-bottom: 20px;
      transition: all 0.3s;
    }

    .back-button:hover {
      gap: 12px;
      color: #ea580c;
    }

    .back-button i {
      font-size: 1.1rem;
    }

    .product-header-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 25px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .product-header-card h1 {
      color: #1a1a2e;
      font-size: 1.8rem;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .product-header-card h1 i {
      color: #F97316;
    }

    .product-meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #666;
    }

    .meta-item i {
      color: #F97316;
      width: 24px;
      text-align: center;
    }

    .meta-item strong {
      color: #333;
    }

    .history-list-section {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .section-title {
      font-size: 1.4rem;
      color: #1a1a2e;
      margin-bottom: 25px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-title i {
      color: #F97316;
    }

    .section-title .count {
      background: #F97316;
      color: white;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 0.9rem;
      margin-left: auto;
    }

    .history-items-grid {
      display: grid;
      gap: 15px;
    }

    .history-item-card {
      background: #f8f9fa;
      border-radius: 15px;
      padding: 20px;
      border-left: 4px solid #F97316;
      transition: all 0.3s;
      cursor: pointer;
    }

    .history-item-card:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(249, 115, 22, 0.15);
      background: white;
    }

    .history-item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }

    .filter-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 5px;
    }

    .filter-date {
      color: #666;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .filter-date i {
      color: #F97316;
    }

    .status-badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-badge.status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.status-confirmed {
      background: #cce5ff;
      color: #004085;
    }

    .status-badge.status-completed {
      background: #d4edda;
      color: #155724;
    }

    .history-item-details {
      display: grid;
      gap: 8px;
      padding-top: 15px;
      border-top: 1px dashed #ddd;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.95rem;
    }

    .detail-row i {
      color: #F97316;
      width: 20px;
    }

    .detail-row strong {
      color: #333;
      margin-right: 5px;
    }

    .loading-state,
    .error-state {
      text-align: center;
      padding: 80px 20px;
    }

    .loading-state i {
      font-size: 3rem;
      color: #F97316;
      margin-bottom: 20px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .error-state i {
      font-size: 3rem;
      color: #dc3545;
      margin-bottom: 20px;
    }

    .error-state h3 {
      color: #333;
      margin-bottom: 10px;
    }

    .error-state p {
      color: #666;
    }

    .empty-history {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-history i {
      font-size: 3rem;
      margin-bottom: 15px;
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .product-meta-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  page.appendChild(style);

  const historyContainer = document.createElement('div');
  historyContainer.className = 'history-container';

  // Back button
  const backButton = document.createElement('a');
  backButton.href = '#/filter-history';
  backButton.className = 'back-button';
  backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Quay lại danh sách sản phẩm';
  historyContainer.appendChild(backButton);

  // Loading state
  const loadingState = document.createElement('div');
  loadingState.className = 'loading-state';
  loadingState.id = 'loadingState';
  loadingState.innerHTML = `
    <i class="fas fa-spinner"></i>
    <p>Đang tải thông tin...</p>
  `;
  historyContainer.appendChild(loadingState);

  // Error state
  const errorState = document.createElement('div');
  errorState.className = 'error-state';
  errorState.id = 'errorState';
  errorState.style.display = 'none';
  errorState.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <h3>Không thể tải thông tin</h3>
    <p>Vui lòng thử lại sau</p>
  `;
  historyContainer.appendChild(errorState);

  // History content
  const historyContent = document.createElement('div');
  historyContent.id = 'historyContent';
  historyContent.style.display = 'none';
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
    window.location.hash = '/login';
    return;
  }

  // Get product ID from URL
  const hash = window.location.hash;
  const productId = hash.split('/')[2];

  if (!productId) {
    showError(loadingState, errorState, 'Không tìm thấy mã sản phẩm');
    return;
  }

  try {
    // Get product info
    const productsResult = await historyService.getFilterHistory(user.id);
    
    let products = [];
    if (productsResult.data && productsResult.data.listProducts) {
      products = productsResult.data.listProducts;
    } else if (productsResult.data && Array.isArray(productsResult.data)) {
      products = productsResult.data;
    } else if (Array.isArray(productsResult)) {
      products = productsResult;
    }

    const product = products.find(p => p.id == productId);

    if (!product) {
      showError(loadingState, errorState, 'Không tìm thấy thông tin sản phẩm');
      return;
    }

    // Get filter history for this product
    const historyResult = await historyService.getFilterCoreHistoryByPhone(productId, user.phone);
    
    let historyItems = [];
    if (historyResult.data) {
      if (historyResult.data.history && Array.isArray(historyResult.data.history)) {
        historyItems = historyResult.data.history;
      } else if (historyResult.data.product?.order_filter_cores) {
        historyItems = historyResult.data.product.order_filter_cores;
      }
    }

    renderProductHistory(contentContainer, product, historyItems, user, loadingState);

  } catch (error) {
    console.error('Error loading product history:', error);
    showError(loadingState, errorState, error.message || 'Có lỗi xảy ra');
  }
}

function showError(loadingState, errorState, message) {
  loadingState.style.display = 'none';
  errorState.style.display = 'block';
  const errorText = errorState.querySelector('p');
  if (errorText) errorText.textContent = message;
}

function renderProductHistory(container, product, historyItems, user, loadingState) {
  loadingState.style.display = 'none';
  container.style.display = 'block';

  const productName = product.product?.name || product.name || 'Sản phẩm';
  const address = product.address || 'Chưa có địa chỉ';
  const purchaseDate = product.ngaymua || product.created_at;
  const filterLevel = product.filter_core_level || '?';
  const userPhone = user?.phone || 'N/A';

  // Product header
  const header = document.createElement('div');
  header.className = 'product-header-card';
  header.innerHTML = `
    <h1>
      <i class="fas fa-tint"></i>
      ${productName}
    </h1>
    <div class="product-meta-grid">
      <div class="meta-item">
        <i class="fas fa-map-marker-alt"></i>
        <span><strong>Địa chỉ:</strong> ${address}</span>
      </div>
      <div class="meta-item">
        <i class="fas fa-calendar"></i>
        <span><strong>Ngày mua:</strong> ${formatDate(purchaseDate)}</span>
      </div>
      <div class="meta-item">
        <i class="fas fa-phone"></i>
        <span><strong>SĐT:</strong> ${userPhone}</span>
      </div>
      <div class="meta-item">
        <i class="fas fa-layer-group"></i>
        <span><strong>Cấp lõi:</strong> ${filterLevel}</span>
      </div>
    </div>
  `;
  container.appendChild(header);

  // History list section
  const section = document.createElement('div');
  section.className = 'history-list-section';
  
  const sectionTitle = document.createElement('div');
  sectionTitle.className = 'section-title';
  sectionTitle.innerHTML = `
    <i class="fas fa-history"></i>
    Lịch sử thay lõi
    <span class="count">${historyItems.length} lần</span>
  `;
  section.appendChild(sectionTitle);

  if (historyItems.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'history-items-grid';
    
    // Sort by date (newest first)
    const sortedItems = [...historyItems].sort((a, b) => {
      const dateA = new Date(a.replace_date || a.ngay_thay || a.created_at || 0);
      const dateB = new Date(b.replace_date || b.ngay_thay || b.created_at || 0);
      return dateB - dateA;
    });

    // Render each item
    sortedItems.forEach((item) => {
      console.log('Item data:', item);
      console.log('Item staff:', item.staff);
      
      const card = document.createElement('div');
      card.className = 'history-item-card';
      card.onclick = () => window.location.hash = `#/filter-history-detail/${item.id}`;
      
      // Get filter core name from order_filter_core array
      const filterCore = Array.isArray(item.order_filter_core) && item.order_filter_core.length > 0 
        ? item.order_filter_core[0] 
        : null;
      const filterName = filterCore?.name || item.filter_core_name || item.name || item.ten_loi || 'Lõi lọc';
      const replaceDate = item.replace_date || item.ngay_thay || item.created_at;
      const status = item.status || '1';
      
      // Get technician from staff array
      const staff = Array.isArray(item.staff) && item.staff.length > 0 
        ? item.staff[0] 
        : null;
      const technicianName = staff?.staff_info?.username || staff?.staff_info?.name || item.technician_name || item.technician?.name || 'Chưa phân công';
      
      console.log('Staff data:', staff);
      console.log('Technician name:', technicianName);
      
      const price = item.price || item.gia;
      
      card.innerHTML = `
        <div class="history-item-header">
          <div>
            <div class="filter-name">${filterName}</div>
            <div class="filter-date">
              <i class="fas fa-clock"></i>
              ${formatDate(replaceDate)}
            </div>
          </div>
        </div>
        <div class="history-item-details">
          <div class="detail-row">
          </div>
          ${price ? `
            <div class="detail-row">
              <i class="fas fa-tag"></i>
              <span><strong>Giá:</strong> ${formatPrice(price)}</span>
            </div>
          ` : ''}
        </div>
      `;
      
      grid.appendChild(card);
    });

    section.appendChild(grid);
  } else {
    const empty = document.createElement('div');
    empty.className = 'empty-history';
    empty.innerHTML = `
      <i class="fas fa-inbox"></i>
      <p>Chưa có lịch sử thay lõi nào</p>
    `;
    section.appendChild(empty);
  }

  container.appendChild(section);
}

function getStatusClass(status) {
  const map = { '1': 'pending', '2': 'confirmed', '3': 'completed' };
  return map[status] || 'pending';
}

function getStatusText(status) {
  const map = { '1': 'Chờ xác nhận', '2': 'Đã xác nhận', '3': 'Hoàn thành' };
  return map[status] || 'Không xác định';
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatPrice(price) {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}
