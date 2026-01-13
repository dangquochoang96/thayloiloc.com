import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { authService } from '../services/auth.service.js';
import { historyService } from '../services/history.service.js';

export function FilterHistoryPage() {
  const container = document.createElement('div');
  
  // Add Header
  container.appendChild(Header());

  let allProducts = [];
  let loading = true;

  const loadProducts = async () => {
    try {
      const currentUser = authService.getUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Use historyService to get filter history (products with filter cores)
      const result = await historyService.getFilterHistory(currentUser.id);
      
      console.log('Filter history response:', result);

      let products = [];
      if (result.data && result.data.listProducts) {
        products = result.data.listProducts;
      } else if (result.data && Array.isArray(result.data)) {
        products = result.data;
      } else if (Array.isArray(result)) {
        products = result;
      }
      
      allProducts = products || [];
      loading = false;
      updateDisplay();
    } catch (error) {
      console.error('Error loading products:', error);
      loading = false;
      const loadingState = document.getElementById('productsLoading');
      if (loadingState) {
        loadingState.innerHTML = `
          <i class="fas fa-exclamation-triangle" style="color:#dc3545;"></i>
          <p>Không thể tải dữ liệu. Vui lòng thử lại.</p>
        `;
      }
    }
  };

  const filterByStatus = (status) => {
    if (status === 'all') {
      displayProducts(allProducts);
    } else {
      // Filter products that have order_filter_cores with matching status
      const filtered = allProducts.map(item => {
        const filterCores = item.order_filter_cores || [];
        const filteredCores = filterCores.filter(core => core.status === status);
        return {
          ...item,
          order_filter_cores: filteredCores
        };
      }).filter(item => item.order_filter_cores.length > 0);

      if (filtered.length > 0) {
        displayProducts(filtered);
      } else {
        const productsList = document.getElementById('productsList');
        if (productsList) {
          productsList.innerHTML = `
            <div class="empty-filter-result">
              <i class="fas fa-search"></i>
              <p>Không có lịch sử thay lõi với trạng thái "${getStatusText(status)}"</p>
            </div>
          `;
        }
      }
    }
  };

  const getStatusText = (status) => {
    const map = { '1': 'Chờ xác nhận', '2': 'Đã xác nhận', '3': 'Hoàn thành' };
    return map[status] || 'Không xác định';
  };

  const getStatusClass = (status) => {
    const map = { '1': 'pending', '2': 'confirmed', '3': 'completed' };
    return map[status] || 'pending';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const displayProducts = (products) => {
    const container = document.getElementById('productsList');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = products.map(item => {
      const product = item.product || {};
      const filterCores = item.order_filter_cores || [];

      return `
        <div class="product-filter-card" onclick="window.location.hash='#/product-detail/${item.id}'" style="cursor:pointer;">
          <div class="product-header">
            <div class="product-info">
              <h3><i class="fas fa-tint"></i> ${product.name || 'Sản phẩm'}</h3>
              <p class="product-address"><i class="fas fa-map-marker-alt"></i> ${item.address || 'Chưa có địa chỉ'}</p>
              <p class="product-date"><i class="fas fa-calendar"></i> Ngày mua: ${formatDate(item.ngaymua)}</p>
            </div>
            <span class="filter-level">Cấp ${item.filter_core_level || '?'}</span>
          </div>
          <div class="filter-cores">
            <h4><i class="fas fa-filter"></i> Lịch sử thay lõi (${filterCores.length} lần)</h4>
            ${filterCores.length > 0 ? `
              <div class="filter-list">
                ${filterCores.slice(0, 3).map(core => `
                  <div class="filter-item">
                    <div class="filter-info">
                      <span class="filter-name">${core.name || core.filter_core_name || core.ten_loi || 'Lõi lọc'}</span>
                      <span class="filter-date">${formatDate(core.replace_date || core.ngay_thay || core.created_at)}</span>
                    </div>
                    <span class="filter-status status-${getStatusClass(core.status)}">${getStatusText(core.status)}</span>
                  </div>
                `).join('')}
                ${filterCores.length > 3 ? `<p class="more-items">+ ${filterCores.length - 3} lần thay khác - Click để xem chi tiết</p>` : ''}
              </div>
            ` : '<p class="no-filter">Chưa có lịch sử thay lõi</p>'}
          </div>
          <div class="card-footer">
            <span class="view-detail">
              <i class="fas fa-eye"></i> Xem chi tiết sản phẩm
            </span>
          </div>
        </div>
      `;
    }).join('');
  };

  const updateDisplay = () => {
    const loadingState = document.getElementById('productsLoading');
    const productsList = document.getElementById('productsList');
    const emptyState = document.getElementById('emptyState');
    
    if (loadingState) {
      loadingState.style.display = loading ? 'block' : 'none';
    }
    if (productsList) {
      productsList.style.display = loading ? 'none' : 'block';
    }
    
    if (!loading) {
      if (allProducts.length > 0) {
        displayProducts(allProducts);
        if (emptyState) emptyState.style.display = 'none';
      } else {
        if (emptyState) emptyState.style.display = 'block';
        if (productsList) productsList.style.display = 'none';
      }
    }
  };

  const page = document.createElement('main');
  page.className = 'filter-history-page';

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .history-main {
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
    }

    .products-filter-list {
      display: grid;
      gap: 25px;
    }

    .product-filter-card {
      background: white;
      border-radius: 20px;
      padding: 25px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s;
      cursor: pointer;
    }

    .product-filter-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .product-info h3 {
      color: #1a1a2e;
      font-size: 1.2rem;
      margin-bottom: 8px;
    }

    .product-info h3 i {
      color: #F97316;
      margin-right: 8px;
    }

    .product-address,
    .product-date {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 5px;
    }

    .product-address i,
    .product-date i {
      width: 20px;
      color: #F97316;
    }

    .filter-level {
      background: linear-gradient(135deg, #F97316, #34ce57);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .filter-cores h4 {
      color: #333;
      font-size: 1rem;
      margin-bottom: 15px;
    }

    .filter-cores h4 i {
      color: #F97316;
      margin-right: 8px;
    }

    .filter-list {
      display: grid;
      gap: 10px;
    }

    .filter-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 3px solid #F97316;
    }

    .filter-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-name {
      color: #333;
      font-weight: 500;
    }

    .filter-date {
      color: #666;
      font-size: 0.85rem;
    }

    .filter-status {
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .filter-status.status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .filter-status.status-confirmed {
      background: #cce5ff;
      color: #004085;
    }

    .filter-status.status-completed {
      background: #d4edda;
      color: #155724;
    }

    .no-filter {
      color: #999;
      font-style: italic;
      padding: 15px;
      text-align: center;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .more-items {
      color: #F97316;
      font-size: 0.9rem;
      text-align: center;
      margin-top: 10px;
      font-weight: 500;
    }

    .card-footer {
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
    <h1><i class="fas fa-filter"></i> Nhật Ký Thay Lõi</h1>
    <p>Theo dõi lịch sử thay lõi lọc của các sản phẩm</p>
  `;
  containerDiv.appendChild(pageHeader);

  // History tabs
  const historyTabs = document.createElement('div');
  historyTabs.className = 'history-tabs';
  historyTabs.innerHTML = `
    <a href="#/booking-history" class="tab">Lịch sử đặt lịch</a>
    <a href="#/filter-history" class="tab active">Nhật ký thay lõi</a>
  `;
  containerDiv.appendChild(historyTabs);

  // Filter toolbar (optional - can be added later if needed)
  const filterToolbar = document.createElement('div');
  filterToolbar.className = 'filter-toolbar';
  filterToolbar.style.display = 'none'; // Hidden for now
  
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
  loadingState.id = 'productsLoading';
  loadingState.style.display = loading ? 'block' : 'none';
  loadingState.innerHTML = `
    <i class="fas fa-spinner fa-spin"></i>
    <p>Đang tải sản phẩm...</p>
  `;
  containerDiv.appendChild(loadingState);

  // Products list
  const productsList = document.createElement('div');
  productsList.className = 'products-filter-list';
  productsList.id = 'productsList';
  productsList.style.display = loading ? 'none' : 'block';
  containerDiv.appendChild(productsList);

  // Empty state
  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state';
  emptyState.id = 'emptyState';
  emptyState.style.display = 'none';
  emptyState.innerHTML = `
    <i class="fas fa-box-open"></i>
    <h3>Chưa có sản phẩm nào</h3>
    <p>Bạn chưa có sản phẩm nào được đăng ký.</p>
  `;
  containerDiv.appendChild(emptyState);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);

  // Check authentication and load data
  setTimeout(() => {
    if (!authService.isAuthenticated()) {
      alert('Vui lòng đăng nhập để xem nhật ký!');
      window.location.hash = '#/login';
      return;
    }
    loadProducts();
  }, 100);

  // Add Footer
  container.appendChild(Footer());

  return container;
}