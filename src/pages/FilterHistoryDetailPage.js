import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { authService } from '../services/auth.service.js';
import { historyService } from '../services/history.service.js';

export function FilterHistoryDetailPage() {
  const container = document.createElement('div');
  container.className = 'page-container';
  
  container.appendChild(Header());

  const page = document.createElement('main');
  page.className = 'filter-detail-page';

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .filter-detail-page {
      padding: 100px 0 60px;
      min-height: 80vh;
      background: #f8f9fa;
    }

    .detail-container {
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

    .detail-header {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 25px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .detail-header h1 {
      color: #1a1a2e;
      font-size: 1.8rem;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .detail-header h1 i {
      color: #F97316;
    }

    .product-meta {
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

    .filter-level-badge {
      display: inline-block;
      background: linear-gradient(135deg, #F97316, #34ce57);
      color: white;
      padding: 8px 20px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 1rem;
    }

    .filter-cores-section {
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

    .filter-timeline {
      position: relative;
      padding-left: 40px;
    }

    .filter-timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(to bottom, #F97316, #34ce57);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 30px;
      background: #f8f9fa;
      border-radius: 15px;
      padding: 20px;
      border-left: 4px solid #F97316;
      transition: all 0.3s;
    }

    .timeline-item:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(249, 115, 22, 0.15);
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: -44px;
      top: 25px;
      width: 16px;
      height: 16px;
      background: white;
      border: 4px solid #F97316;
      border-radius: 50%;
      box-shadow: 0 0 0 4px #fff;
    }

    .timeline-item.status-completed::before {
      background: #34ce57;
      border-color: #34ce57;
    }

    .timeline-item.status-confirmed::before {
      background: #3b82f6;
      border-color: #3b82f6;
    }

    .timeline-header {
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

    .timeline-details {
      display: grid;
      gap: 10px;
      margin-top: 15px;
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

    .empty-timeline {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-timeline i {
      font-size: 3rem;
      margin-bottom: 15px;
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .product-meta {
        grid-template-columns: 1fr;
      }

      .filter-timeline {
        padding-left: 30px;
      }

      .timeline-item::before {
        left: -34px;
      }
    }
  `;
  page.appendChild(style);

  const detailContainer = document.createElement('div');
  detailContainer.className = 'detail-container';

  // Back button
  const backButton = document.createElement('a');
  backButton.href = '#/filter-history';
  backButton.className = 'back-button';
  backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Quay lại danh sách';
  detailContainer.appendChild(backButton);

  // Loading state
  const loadingState = document.createElement('div');
  loadingState.className = 'loading-state';
  loadingState.id = 'loadingState';
  loadingState.innerHTML = `
    <i class="fas fa-spinner"></i>
    <p>Đang tải thông tin...</p>
  `;
  detailContainer.appendChild(loadingState);

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
  detailContainer.appendChild(errorState);

  // Detail content
  const detailContent = document.createElement('div');
  detailContent.id = 'detailContent';
  detailContent.style.display = 'none';
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
    // Get all products with filter history
    const result = await historyService.getFilterHistory(user.id);
    
    let products = [];
    if (result.data && result.data.listProducts) {
      products = result.data.listProducts;
    } else if (result.data && Array.isArray(result.data)) {
      products = result.data;
    } else if (Array.isArray(result)) {
      products = result;
    }

    // Find the specific product
    const productData = products.find(p => p.id == productId);

    if (!productData) {
      showError(loadingState, errorState, 'Không tìm thấy thông tin sản phẩm');
      return;
    }

    renderFilterDetail(contentContainer, productData, loadingState);

  } catch (error) {
    console.error('Error loading filter detail:', error);
    showError(loadingState, errorState, error.message || 'Có lỗi xảy ra');
  }
}

function showError(loadingState, errorState, message) {
  loadingState.style.display = 'none';
  errorState.style.display = 'block';
  const errorText = errorState.querySelector('p');
  if (errorText) errorText.textContent = message;
}

function renderFilterDetail(container, productData, loadingState) {
  loadingState.style.display = 'none';
  container.style.display = 'block';

  const product = productData.product || {};
  const filterCores = productData.order_filter_cores || [];

  // Detail header
  const header = document.createElement('div');
  header.className = 'detail-header';
  header.innerHTML = `
    <h1>
      <i class="fas fa-tint"></i>
      ${product.name || 'Sản phẩm'}
    </h1>
    <div class="product-meta">
      <div class="meta-item">
        <i class="fas fa-map-marker-alt"></i>
        <span><strong>Địa chỉ:</strong> ${productData.address || 'Chưa có địa chỉ'}</span>
      </div>
      <div class="meta-item">
        <i class="fas fa-calendar"></i>
        <span><strong>Ngày mua:</strong> ${formatDate(productData.ngaymua)}</span>
      </div>
      <div class="meta-item">
        <i class="fas fa-layer-group"></i>
        <span class="filter-level-badge">Cấp ${productData.filter_core_level || '?'}</span>
      </div>
    </div>
  `;
  container.appendChild(header);

  // Filter cores section
  const section = document.createElement('div');
  section.className = 'filter-cores-section';
  
  const sectionTitle = document.createElement('div');
  sectionTitle.className = 'section-title';
  sectionTitle.innerHTML = `
    <i class="fas fa-history"></i>
    Lịch sử thay lõi
    <span class="count">${filterCores.length} lần</span>
  `;
  section.appendChild(sectionTitle);

  if (filterCores.length > 0) {
    const timeline = document.createElement('div');
    timeline.className = 'filter-timeline';
    
    // Sort by date (newest first)
    const sortedCores = [...filterCores].sort((a, b) => {
      const dateA = new Date(a.replace_date || a.ngay_thay || a.created_at || 0);
      const dateB = new Date(b.replace_date || b.ngay_thay || b.created_at || 0);
      return dateB - dateA;
    });

    sortedCores.forEach(core => {
      const item = document.createElement('div');
      const statusClass = getStatusClass(core.status);
      item.className = `timeline-item status-${statusClass}`;
      
      item.innerHTML = `
        <div class="timeline-header">
          <div>
            <div class="filter-name">${core.name || core.filter_core_name || core.ten_loi || 'Lõi lọc'}</div>
            <div class="filter-date">
              <i class="fas fa-clock"></i>
              ${formatDate(core.replace_date || core.ngay_thay || core.created_at)}
            </div>
          </div>
          <span class="status-badge status-${statusClass}">${getStatusText(core.status)}</span>
        </div>
        <div class="timeline-details">
          ${core.technician_name ? `
            <div class="detail-row">
              <i class="fas fa-user-cog"></i>
              <span><strong>Kỹ thuật viên:</strong> ${core.technician_name}</span>
            </div>
          ` : ''}
          ${core.price ? `
            <div class="detail-row">
              <i class="fas fa-tag"></i>
              <span><strong>Giá:</strong> ${formatPrice(core.price)}</span>
            </div>
          ` : ''}
          ${core.notes || core.description ? `
            <div class="detail-row">
              <i class="fas fa-comment"></i>
              <span><strong>Ghi chú:</strong> ${core.notes || core.description}</span>
            </div>
          ` : ''}
        </div>
      `;
      
      timeline.appendChild(item);
    });

    section.appendChild(timeline);
  } else {
    const empty = document.createElement('div');
    empty.className = 'empty-timeline';
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
