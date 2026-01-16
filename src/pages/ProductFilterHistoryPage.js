import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { authService } from '../services/auth.service.js';
import { historyService } from '../services/history.service.js';
import '../styles/history/product-filter-history.css';

export function ProductFilterHistoryPage() {
  const container = document.createElement('div');
  container.className = 'page-container';
  
  container.appendChild(Header());

  const page = document.createElement('main');
  page.className = 'product-history-page';

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

  // Lấy ảnh từ product_images array
  let productImage = '/images/default-service.svg';
  if (product.product?.product_images && product.product.product_images.length > 0) {
    const imgLink = product.product.product_images[0].link;
    productImage = imgLink.startsWith('http') ? imgLink : `${getImgLink(imgLink)}`;
  } else if (product.product?.image) {
    productImage = product.product.image.startsWith('http') ? product.product.image : `${getImgLink(product.product.image)}`;
  }

  // Product header
  const header = document.createElement('div');
  header.className = 'product-header-card';
  header.innerHTML = `
    <div class="product-header-content">
      <div class="product-header-info">
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
      </div>
      <div class="product-header-image">
        <img src="${productImage}" alt="${productName}" onerror="this.src='/images/default-service.svg'" />
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
