import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { authService } from '../services/auth.service.js';
import { historyService } from '../services/history.service.js';
import { getImageUrl } from '../utils/helpers.js';
import { Pagination } from '../utils/pagination.js';
import '../styles/history/filter-history.css';
import '../styles/pagination.css';

export function FilterHistoryPage() {
  const container = document.createElement('div');
  
  // Add Header
  container.appendChild(Header());

  let allProducts = [];
  let loading = true;

  let rentalTasksCount = 0; // Store rental count globally
  let pagination = null; // Pagination instance

  const loadProducts = async () => {
    try {
      const currentUser = authService.getUser();
            
      if (!currentUser) {
        throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      }
      
      if (!currentUser.id) {
        throw new Error('Không tìm thấy ID người dùng');
      }
      
      if (!currentUser.phone) {
        throw new Error('Không tìm thấy số điện thoại người dùng. Vui lòng cập nhật thông tin tài khoản.');
      }

      
      // Step 1: Get list of products from /user/listProduct/{userId}
      const productsResult = await historyService.getFilterHistory(currentUser.id);
      
      
      let products = [];
      if (productsResult.data && productsResult.data.listProducts) {
        products = productsResult.data.listProducts;
      } else if (productsResult.data && Array.isArray(productsResult.data)) {
        products = productsResult.data;
      } else if (Array.isArray(productsResult)) {
        products = productsResult;
      }

      
      // Step 2: For each product, get its filter history with items
      let productsWithHistory = [];
      
      for (const product of products) {
        if (product.id) {
          try {
                        const historyResult = await historyService.getFilterCoreHistoryByPhone(product.id, currentUser.phone);
            
            
            let historyCount = 0;
            let historyItems = [];
            let rentalDebt = 0;
            let nextReplaceDate = null;
            let nextFilterCoreName = null;

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
              
              // Extract rental debt for rental products
              if (product.order_type_label === "Thuê" && historyResult.data.product?.order_rent) {
                const orderRent = Array.isArray(historyResult.data.product.order_rent) 
                  ? historyResult.data.product.order_rent[0] 
                  : historyResult.data.product.order_rent;
                if (orderRent && orderRent.dept !== null) {
                  rentalDebt = parseInt(orderRent.dept) || 0;
                }
              }
              
              // Get next replacement date from the most recent history item
              if (historyItems.length > 0) {
                                
                // Sort to get the most recent item
                const sortedItems = [...historyItems].sort((a, b) => {
                  const dateA = new Date(a.replace_date || a.ngay_thay || a.created_at || 0);
                  const dateB = new Date(b.replace_date || b.ngay_thay || b.created_at || 0);
                  return dateB - dateA;
                });
                const mostRecent = sortedItems[0];
                
                                
                // Try to get from item itself first
                nextReplaceDate = mostRecent.replace_date_promise || mostRecent.ngay_thay_tiep_theo || mostRecent.next_replace_date;
                
                                
                // If not available, try to get from detail API
                if (!nextReplaceDate && mostRecent.id) {
                  try {
                                        const detailResult = await historyService.getFilterHistoryDetail(mostRecent.id);
                    const detailData = detailResult.data || detailResult;
                    const order = detailData.order || detailData;
                    
                                                            
                    // Get from order_filter_core[1]
                    if (Array.isArray(order.order_filter_core) && order.order_filter_core.length > 1) {
                      const nextFilterCore = order.order_filter_core[1];
                                            nextReplaceDate = nextFilterCore?.replace_date_promise || nextFilterCore?.replace_date || nextFilterCore?.ngay_thay_tiep_theo;
                      nextFilterCoreName = nextFilterCore?.name;
                    }
                    
                    // Fallback to order level
                    if (!nextReplaceDate) {
                      nextReplaceDate = order.next_replace_date || order.ngay_thay_tiep_theo;
                    }
                    
                                                          } catch (detailError) {
                    console.warn(`Failed to fetch detail for history ${mostRecent.id}:`, detailError);
                  }
                }
              }
            }

            productsWithHistory.push({
              ...product,
              historyCount: historyCount,
              hasHistory: historyCount > 0,
              historyItems: historyItems, // Store history items for filtering
              rentalDebt: rentalDebt, // Store rental debt
              nextReplaceDate: nextReplaceDate, // Store next replace date
              nextFilterCoreName: nextFilterCoreName // Store next filter core name
            });
          } catch (error) {
            console.warn(`Failed to fetch history for product ${product.id}:`, error);
            // Add product without history
            productsWithHistory.push({
              ...product,
              historyCount: 0,
              hasHistory: false,
              historyItems: [],
              rentalDebt: 0,
              nextReplaceDate: null,
              nextFilterCoreName: null
            });
          }
        }
      }

            
      // Assign original machine numbers to each product
      productsWithHistory.forEach((product, index) => {
        product.machineNumber = index + 1;
      });
      
      allProducts = productsWithHistory || [];
      
      // Calculate rental machines count - only those with status "Đang thuê" (origin === "1")
      const rentalProducts = allProducts.filter(product => 
        product.order_type_label === "Thuê" && String(product.origin) === "1"
      );
      rentalTasksCount = rentalProducts.length;
      
      // Calculate total rental debt
      const totalRentalDebt = rentalProducts.reduce((sum, product) => sum + (product.rentalDebt || 0), 0);
      
                        
      // Store totalRentalDebt globally for display
      window.totalRentalDebt = totalRentalDebt;
      
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
    const searchInput = document.getElementById('addressSearchInput');
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const machineSearchInput = document.getElementById('machineNumberSearchInput');
    const machineSearchText = machineSearchInput ? machineSearchInput.value.trim() : '';
    
    let filtered = allProducts;
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(product => {
        if (!product.historyItems || product.historyItems.length === 0) {
          return false;
        }
        return product.historyItems.some(item => String(item.status) === String(status));
      });
    }
    
    // Apply address search filter
    if (searchText) {
      filtered = filtered.filter(product => {
        const address = (product.address || '').toLowerCase();
        return address.includes(searchText);
      });
    }
    
    // Apply machine number search filter
    if (machineSearchText) {
      const machineNumber = parseInt(machineSearchText);
      if (!isNaN(machineNumber) && machineNumber > 0) {
        filtered = filtered.filter(product => product.machineNumber === machineNumber);
      }
    }

    if (pagination) {
      pagination.reset();
    }

    if (filtered.length > 0) {
      displayProducts(filtered);
    } else {
      const productsList = document.getElementById('productsList');
      if (productsList) {
        productsList.innerHTML = `
          <div class="empty-filter-result">
            <i class="fas fa-search"></i>
            <p>Không có sản phẩm nào phù hợp với bộ lọc${status !== 'all' ? ` trạng thái "${getStatusText(status)}"` : ''}${searchText ? ` và địa chỉ "${searchText}"` : ''}${machineSearchText ? ` và số máy "${machineSearchText}"` : ''}.</p>
          </div>
        `;
      }
      const paginationContainer = document.getElementById('pagination');
      if (paginationContainer) {
        paginationContainer.style.display = 'none';
      }
    }
  };

  const filterByAddress = (searchText) => {
    const statusSelect = document.getElementById('statusFilter');
    const status = statusSelect ? statusSelect.value : 'all';
    const machineSearchInput = document.getElementById('machineNumberSearchInput');
    const machineSearchText = machineSearchInput ? machineSearchInput.value.trim() : '';
    
    searchText = searchText.toLowerCase().trim();
    
    let filtered = allProducts;
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(product => {
        if (!product.historyItems || product.historyItems.length === 0) {
          return false;
        }
        return product.historyItems.some(item => String(item.status) === String(status));
      });
    }
    
    // Apply address search filter
    if (searchText) {
      filtered = filtered.filter(product => {
        const address = (product.address || '').toLowerCase();
        return address.includes(searchText);
      });
    }
    
    // Apply machine number search filter
    if (machineSearchText) {
      const machineNumber = parseInt(machineSearchText);
      if (!isNaN(machineNumber) && machineNumber > 0) {
        const targetIndex = machineNumber - 1;
        filtered = filtered.filter((product, index) => index === targetIndex);
      }
    }

    if (pagination) {
      pagination.reset();
    }

    if (filtered.length > 0) {
      displayProducts(filtered);
    } else {
      const productsList = document.getElementById('productsList');
      if (productsList) {
        productsList.innerHTML = `
          <div class="empty-filter-result">
            <i class="fas fa-search"></i>
            <p>Không có sản phẩm nào phù hợp với${status !== 'all' ? ` trạng thái "${getStatusText(status)}"` : ''}${searchText ? ` địa chỉ "${searchText}"` : ''}${machineSearchText ? ` số máy "${machineSearchText}"` : ' bộ lọc'}.</p>
          </div>
        `;
      }
      const paginationContainer = document.getElementById('pagination');
      if (paginationContainer) {
        paginationContainer.style.display = 'none';
      }
    }
  };
  
  const filterByMachineNumber = (machineNumberText) => {
    const statusSelect = document.getElementById('statusFilter');
    const status = statusSelect ? statusSelect.value : 'all';
    const addressSearchInput = document.getElementById('addressSearchInput');
    const addressSearchText = addressSearchInput ? addressSearchInput.value.toLowerCase().trim() : '';
    
    machineNumberText = machineNumberText.trim();
    
    let filtered = allProducts;
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(product => {
        if (!product.historyItems || product.historyItems.length === 0) {
          return false;
        }
        return product.historyItems.some(item => String(item.status) === String(status));
      });
    }
    
    // Apply address search filter
    if (addressSearchText) {
      filtered = filtered.filter(product => {
        const address = (product.address || '').toLowerCase();
        return address.includes(addressSearchText);
      });
    }
    
    // Apply machine number search filter
    if (machineNumberText) {
      const machineNumber = parseInt(machineNumberText);
      if (!isNaN(machineNumber) && machineNumber > 0) {
        filtered = filtered.filter(product => product.machineNumber === machineNumber);
      }
    }

    if (pagination) {
      pagination.reset();
    }

    if (filtered.length > 0) {
      displayProducts(filtered);
    } else {
      const productsList = document.getElementById('productsList');
      if (productsList) {
        productsList.innerHTML = `
          <div class="empty-filter-result">
            <i class="fas fa-search"></i>
            <p>Không có sản phẩm nào phù hợp với${status !== 'all' ? ` trạng thái "${getStatusText(status)}"` : ''}${addressSearchText ? ` địa chỉ "${addressSearchText}"` : ''}${machineNumberText ? ` số máy "${machineNumberText}"` : ' bộ lọc'}.</p>
          </div>
        `;
      }
      const paginationContainer = document.getElementById('pagination');
      if (paginationContainer) {
        paginationContainer.style.display = 'none';
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

  const formatPrice = (price) => {
    if (!price || price === 0) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const displayProducts = (products) => {
    const container = document.getElementById('productsList');
    if (!container) return;

    const currentUser = authService.getUser();
    const userPhone = currentUser?.phone || 'N/A';

    // Initialize pagination if not exists
    if (!pagination) {
      pagination = new Pagination({
        itemsPerPage: 10,
        onPageChange: () => {
          displayProducts(products);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // Get paginated items
    const paginatedProducts = pagination.getPaginatedItems(products);

    // Count rental machines in the displayed products
    const displayedRentalCount = products.filter(product => 
      product.order_type_label === "Thuê" && String(product.origin) === "1"
    ).length;

    const totalDebt = window.totalRentalDebt || 0;

                
    // Update stats display - show total machines, rental machines, and total debt
    const rentalCountSection = document.getElementById('rentalCountSection');
    if (rentalCountSection) {
      rentalCountSection.style.display = 'block';
      rentalCountSection.innerHTML = `
        <div class="stats-container">
          <div class="stat-badge total-machines">
            <i class="fas fa-tint"></i>
            <span>Tổng số máy: <strong>${allProducts.length}</strong></span>
          </div>
          <div class="stat-badge rental-machines">
            <i class="fas fa-handshake"></i>
            <span>Số máy thuê: <strong>${rentalTasksCount}</strong></span>
          </div>
          <div class="stat-badge rental-debt">
            <i class="fas fa-money-bill-wave"></i>
            <span>Tổng công nợ: <strong>${formatPrice(totalDebt)}</strong></span>
          </div>
        </div>
      `;
    }

    container.style.display = 'block';
    container.innerHTML = paginatedProducts.map((product, index) => {
      const productName = product.product?.name || product.name || 'Sản phẩm';
      const address = product.address || 'Chưa có địa chỉ';
      const purchaseDate = product.ngaymua || product.created_at;
      const filterLevel = product.filter_core_level || '?';
      const historyCount = product.historyCount || 0;
      const machineNumber = product.machineNumber || (index + 1); // Use stored machine number

      // Count history items by status
      const historyItems = product.historyItems || [];
      const pendingCount = historyItems.filter(item => String(item.status) === '1').length;
      const confirmedCount = historyItems.filter(item => String(item.status) === '2').length;
      const completedCount = historyItems.filter(item => String(item.status) === '3').length;
      
      // Get next replace date info
      const nextReplaceDate = product.nextReplaceDate;
      const nextFilterCoreName = product.nextFilterCoreName;
      
      
      // Lấy ảnh từ product_images array
      let productImage = '/images/default-service.svg';
      
      if (product.product?.product_images && product.product.product_images.length > 0) {
        const imgLink = product.product.product_images[0].link;
        // Thử nhiều domain khác nhau
        productImage = imgLink.startsWith('http') ? imgLink : `${getImageUrl(imgLink)}`;
      } else if (product.product?.image) {
        productImage = product.product.image.startsWith('http') ? product.product.image : `${getImageUrl(product.product.image)}`;
      }

      return `
        <div class="product-filter-card" onclick="window.location.hash='#/product-filter-history/${product.id}'" style="cursor:pointer;">
          <div class="product-card-content">
            <div class="product-card-left">
              <div class="product-header">
                <div class="product-info">
                  <span class="machine-number-badge">Máy ${machineNumber}</span>
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
                ${nextReplaceDate ? `
                  <div class="next-replace-info">
                    <i class="fas fa-calendar-check"></i>
                    <span>Lần thay tiếp theo: <strong>${formatDate(nextReplaceDate)}</strong></span>
                    ${nextFilterCoreName ? `<span class="next-filter-name">${nextFilterCoreName}</span>` : ''}
                  </div>
                ` : historyCount > 0 ? `
                  <div class="next-replace-info" style="opacity: 0.6;">
                    <i class="fas fa-info-circle"></i>
                    <span style="font-size: 0.85rem; color: #999;">Chưa có thông tin lần thay tiếp theo</span>
                  </div>
                ` : ''}
                ${historyCount > 0 ? `
                  <div class="status-breakdown">
                    ${pendingCount > 0 ? `<span class="status-tag pending"><i class="fas fa-clock"></i> ${pendingCount} chờ xác nhận</span>` : ''}
                    ${confirmedCount > 0 ? `<span class="status-tag confirmed"><i class="fas fa-check"></i> ${confirmedCount} đã xác nhận</span>` : ''}
                    ${completedCount > 0 ? `<span class="status-tag completed"><i class="fas fa-check-double"></i> ${completedCount} hoàn thành</span>` : ''}
                  </div>
                ` : ''}
              </div>
              <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center;">
                <span class="view-detail">
                  <i class="fas fa-eye"></i> Xem lịch sử thay lõi
                </span>
                <button type="button" class="btn-feedback-action" onclick="event.stopPropagation(); window.location.hash='#/booking-history?tab=feedback&order_id=${product.order_id || product.id}'">
                  <i class="fas fa-comment-dots"></i> Góp ý / Khiếu nại
                </button>
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

    // Render pagination
    pagination.render(products.length, 'pagination');
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

  // Rental count section
  const rentalCountSection = document.createElement('div');
  rentalCountSection.className = 'rental-count-section';
  rentalCountSection.id = 'rentalCountSection';
  rentalCountSection.style.display = 'none';
  containerDiv.appendChild(rentalCountSection);

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
  
  // Add machine number search input
  const machineSearchLabel = document.createElement('label');
  machineSearchLabel.innerHTML = '<i class="fas fa-hashtag"></i> Số máy:';
  machineSearchLabel.style.marginLeft = '20px';
  
  const machineSearchInput = document.createElement('input');
  machineSearchInput.type = 'number';
  machineSearchInput.className = 'search-input';
  machineSearchInput.id = 'machineNumberSearchInput';
  machineSearchInput.placeholder = 'Nhập số máy...';
  machineSearchInput.min = '1';
  machineSearchInput.oninput = (e) => filterByMachineNumber(e.target.value);
  
  filterToolbar.appendChild(machineSearchLabel);
  filterToolbar.appendChild(machineSearchInput);
  
  // Add address search input to the same toolbar
  const searchLabel = document.createElement('label');
  searchLabel.innerHTML = '<i class="fas fa-search"></i> Địa chỉ:';
  searchLabel.style.marginLeft = '20px';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'search-input';
  searchInput.id = 'addressSearchInput';
  searchInput.placeholder = 'Nhập địa chỉ máy...';
  searchInput.oninput = (e) => filterByAddress(e.target.value);
  
  filterToolbar.appendChild(searchLabel);
  filterToolbar.appendChild(searchInput);
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

  // Pagination container
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-container';
  paginationContainer.id = 'pagination';
  paginationContainer.style.display = 'none';
  containerDiv.appendChild(paginationContainer);

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