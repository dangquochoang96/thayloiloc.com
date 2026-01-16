import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { authService } from '../services/auth.service.js';
import { historyService } from '../services/history.service.js';
import '../styles/history/filter-history.css';

export function FilterHistoryPage() {
  const container = document.createElement('div');
  
  // Add Header
  container.appendChild(Header());

  let allProducts = [];
  let loading = true;

  const loadProducts = async () => {
    try {
      const currentUser = authService.getUser();
      console.log('Current user data:', currentUser);
      
      if (!currentUser) {
        throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      }
      
      if (!currentUser.id) {
        throw new Error('Không tìm thấy ID người dùng');
      }
      
      if (!currentUser.phone) {
        throw new Error('Không tìm thấy số điện thoại người dùng. Vui lòng cập nhật thông tin tài khoản.');
      }

      console.log('Fetching products list for user:', currentUser.id);

      // Step 1: Get list of products from /user/listProduct/{userId}
      const productsResult = await historyService.getFilterHistory(currentUser.id);
      
      console.log('Products list response:', productsResult);

      let products = [];
      if (productsResult.data && productsResult.data.listProducts) {
        products = productsResult.data.listProducts;
      } else if (productsResult.data && Array.isArray(productsResult.data)) {
        products = productsResult.data;
      } else if (Array.isArray(productsResult)) {
        products = productsResult;
      }

      console.log('Found products:', products.length);

      // Step 2: For each product, get its filter history count
      let productsWithHistory = [];
      
      for (const product of products) {
        if (product.id) {
          try {
            console.log(`Fetching history for product ${product.id}`);
            const historyResult = await historyService.getFilterCoreHistoryByPhone(product.id, currentUser.phone);
            
            console.log(`History for product ${product.id}:`, historyResult);

            let historyCount = 0;
            let historyItems = [];

            // Extract history data from response
            if (historyResult.data) {
              // Check if history array exists
              if (historyResult.data.history && Array.isArray(historyResult.data.history)) {
                historyItems = historyResult.data.history;
                historyCount = historyItems.length;
              }
              // Check if product has order_filter_cores
              else if (historyResult.data.product?.order_filter_cores) {
                historyItems = historyResult.data.product.order_filter_cores;
                historyCount = historyItems.length;
              }
            }

            productsWithHistory.push({
              ...product,
              historyCount: historyCount,
              hasHistory: historyCount > 0
            });
          } catch (error) {
            console.warn(`Failed to fetch history for product ${product.id}:`, error);
            // Add product without history
            productsWithHistory.push({
              ...product,
              historyCount: 0,
              hasHistory: false
            });
          }
        }
      }

      console.log('Products with history:', productsWithHistory);
      
      allProducts = productsWithHistory || [];
      loading = false;
      updateDisplay();
    } catch (error) {
      console.error('Error loading filter history:', error);
      loading = false;
      const loadingState = document.getElementById('productsLoading');
      if (loadingState) {
        loadingState.innerHTML = `
          <i class="fas fa-exclamation-triangle" style="color:#dc3545;"></i>
          <p>Không thể tải dữ liệu. Vui lòng thử lại.</p>
          <p style="font-size: 0.85rem; color: #666; margin-top: 8px;">Lỗi: ${error.message}</p>
        `;
      }
    }
  };

  const filterByStatus = (status) => {
    if (status === 'all') {
      displayProducts(allProducts);
    } else {
      // Filter history items by status
      const filtered = allProducts.filter(item => item.status === status);

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

    const currentUser = authService.getUser();
    const userPhone = currentUser?.phone || 'N/A';

    container.style.display = 'block';
    container.innerHTML = products.map(product => {
      const productName = product.product?.name || product.name || 'Sản phẩm';
      const address = product.address || 'Chưa có địa chỉ';
      const purchaseDate = product.ngaymua || product.created_at;
      const filterLevel = product.filter_core_level || '?';
      const historyCount = product.historyCount || 0;

      // Lấy ảnh từ product_images array
      let productImage = '/images/default-service.svg';
      
      if (product.product?.product_images && product.product.product_images.length > 0) {
        const imgLink = product.product.product_images[0].link;
        // Thử nhiều domain khác nhau
        productImage = imgLink.startsWith('http') ? imgLink : `https://api.chothuetatca.com${imgLink}`;
      } else if (product.product?.image) {
        productImage = product.product.image.startsWith('http') ? product.product.image : `https://api.chothuetatca.com${product.product.image}`;
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