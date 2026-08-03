import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Toast } from '../utils/toast.js';
import { authService } from '../services/auth.service.js';
import { SupportService } from '../services/support.service.js';
import { getUserLocation, calculateDistance } from '../utils/geohash.js';
import { reverseGeocode, geocodeAddress } from '../utils/geocoding.js';
import { getImageUrl } from '../utils/helpers.js';
import { getSubcategorySVG } from '../utils/icons.js';
import { MissingServiceFeedback } from '../components/MissingServiceFeedback.js';
import { PROVINCES_DATA } from '../utils/provincesData.js';
import '../styles/services/service-quotation.css';

import assetImg1 from '../assets/1785293208301_5406973516832731724_5406973516832731724_bbecc7906d9f31087a1980079df842a4.jpg';
import assetImg2 from '../assets/1785293811278_5406973516832731724_5406973516832731724_33e4d3c972d7fb483b19270e86deb9f9.jpg';
import assetImg3 from '../assets/1785293811310_5406973516832731724_5406973516832731724_b4e0e0b812ce083385c6d0d85a604f2c.jpg';
import assetImg4 from '../assets/1785293811350_5406973516832731724_5406973516832731724_8bafd41ed065cbcbd29e7895030aa939.jpg';
import assetImg5 from '../assets/1785293811392_5406973516832731724_5406973516832731724_9ca556a0e27b928b630ca503c3c19eb9.jpg';
import assetImg6 from '../assets/1785293811434_5406973516832731724_5406973516832731724_31603d52d24d475402b13369dfbe2323.jpg';
import assetImg7 from '../assets/1785293811475_5406973516832731724_5406973516832731724_41d9b3f10b9dbf90832902ef58edfbdd.jpg';
import assetImg8 from '../assets/1785293811516_5406973516832731724_5406973516832731724_460d93f6bbe2e728734998c1398932b5.jpg';
import assetImg9 from '../assets/1785293811559_5406973516832731724_5406973516832731724_8f1905761b27c2bd949d5f15056142de.jpg';
import assetImg10 from '../assets/1785293811602_5406973516832731724_5406973516832731724_012b8162b7f6f7093b5b79e3400dc43f.jpg';

// Rich Sample Services Database
export const sampleServices = [
  // === THỢ LẮP ĐẶT ===
  {
    id: 101,
    name: "Lắp đặt Máy lọc nước RO",
    category: "installation",
    subcategory: "water_purifier",
    price: 190000,
    rating: 5.0,
    soldCount: 508,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Chuẩn hãng",
    ribbonRight: "Hoàn tất trong 60 phút",
    customImage: assetImg1
  },
  {
    id: 102,
    name: "Lắp đặt Giá đỡ máy lọc nước",
    category: "installation",
    subcategory: "water_purifier",
    price: 120000,
    rating: 5.0,
    soldCount: 14,
    warrantyText: "Không bảo hành",
    warrantyClass: "no-warranty",
    ribbonLeft: "Chuẩn hãng",
    ribbonRight: "Chỉ trong 20 phút",
    customImage: assetImg2
  },
  {
    id: 103,
    name: "Lắp đặt Máy lọc nước điện giải",
    category: "installation",
    subcategory: "water_purifier",
    price: 350000,
    rating: 5.0,
    soldCount: 92,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Chuẩn hãng",
    ribbonRight: "Hoàn tất trong 60 phút",
    customImage: assetImg3
  },
  {
    id: 104,
    name: "Tháo + Lắp Máy Lọc Nước RO/Nano",
    category: "installation",
    subcategory: "water_purifier",
    price: 250000,
    rating: 5.0,
    soldCount: 124,
    warrantyText: "Bảo hành 7 ngày",
    ribbonLeft: "Tay nghề cao",
    ribbonRight: "Trung bình 60 phút",
    customImage: assetImg4
  },
  {
    id: 105,
    name: "Lắp đặt Máy nước nóng trực tiếp",
    category: "installation",
    subcategory: "water_heater",
    price: 180000,
    rating: 4.8,
    soldCount: 45,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Chuẩn hãng",
    ribbonRight: "Chỉ trong 30 phút",
    customImage: assetImg5
  },
  {
    id: 106,
    name: "Lắp đặt Máy nước nóng gián tiếp",
    category: "installation",
    subcategory: "water_heater",
    price: 280000,
    rating: 4.9,
    soldCount: 67,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Tay nghề cao",
    ribbonRight: "Hoàn tất trong 45 phút",
    customImage: assetImg6
  },
  {
    id: 107,
    name: "Lắp đặt Camera Wifi trong nhà (Dome/Ezviz)",
    category: "installation",
    subcategory: "camera",
    price: 100000,
    rating: 5.0,
    soldCount: 340,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Cài nhanh",
    ribbonRight: "Chỉ trong 20 phút",
    customImage: assetImg7
  },
  {
    id: 108,
    name: "Lắp đặt Camera Wifi ngoài trời",
    category: "installation",
    subcategory: "camera",
    price: 150000,
    rating: 4.9,
    soldCount: 185,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Chuẩn hãng",
    ribbonRight: "Hoàn tất trong 40 phút",
    customImage: assetImg8
  },
  {
    id: 109,
    name: "Lắp đặt Đầu ghi & Hệ thống 4 Camera",
    category: "installation",
    subcategory: "camera",
    price: 650000,
    rating: 5.0,
    soldCount: 29,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Chuyên nghiệp",
    ribbonRight: "Hoàn tất trong 120 phút",
    customImage: assetImg9
  },

  // === THỢ BẢO DƯỠNG ===
  {
    id: 201,
    name: "Bảo dưỡng + Vệ sinh Máy lọc nước định kỳ",
    category: "maintenance",
    subcategory: "water_purifier",
    price: 150000,
    rating: 5.0,
    soldCount: 980,
    warrantyText: "Bảo hành 7 ngày",
    ribbonLeft: "Vệ sinh sâu",
    ribbonRight: "Chỉ trong 30 phút",
    customImage: assetImg1
  },
  {
    id: 202,
    name: "Sục rửa màng lọc RO chuyên nghiệp",
    category: "maintenance",
    subcategory: "water_purifier",
    price: 120000,
    rating: 4.8,
    soldCount: 115,
    warrantyText: "Bảo hành 7 ngày",
    ribbonLeft: "Tối ưu màng",
    ribbonRight: "Chỉ trong 20 phút",
    customImage: assetImg2
  },
  {
    id: 203,
    name: "Bảo dưỡng & Sục cặn Bình nước nóng",
    category: "maintenance",
    subcategory: "water_heater",
    price: 150000,
    rating: 4.9,
    soldCount: 233,
    warrantyText: "Bảo hành 7 ngày",
    ribbonLeft: "Tận tâm",
    ribbonRight: "Hoàn tất trong 45 phút",
    customImage: assetImg3
  },
  {
    id: 204,
    name: "Thay thanh Magie chống ăn mòn bình nóng lạnh",
    category: "maintenance",
    subcategory: "water_heater",
    price: 90000,
    rating: 4.9,
    soldCount: 88,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Linh kiện tốt",
    ribbonRight: "Chỉ trong 15 phút",
    customImage: assetImg4
  },
  {
    id: 205,
    name: "Vệ sinh & Căn chỉnh góc quay Camera",
    category: "maintenance",
    subcategory: "camera",
    price: 80000,
    rating: 4.7,
    soldCount: 56,
    warrantyText: "Không bảo hành",
    warrantyClass: "no-warranty",
    ribbonLeft: "Chính xác",
    ribbonRight: "Chỉ trong 15 phút",
    customImage: assetImg5
  },
  {
    id: 206,
    name: "Vệ sinh & Thay màng lọc Máy lọc không khí",
    category: "maintenance",
    subcategory: "air_purifier",
    price: 100000,
    rating: 5.0,
    soldCount: 128,
    warrantyText: "Không bảo hành",
    warrantyClass: "no-warranty",
    ribbonLeft: "Chuẩn hãng",
    ribbonRight: "Chỉ trong 15 phút",
    customImage: assetImg6
  },

  // === THỢ BẢO HÀNH ===
  {
    id: 301,
    name: "Sửa máy lọc nước rò rỉ nước",
    category: "warranty",
    subcategory: "water_purifier",
    price: 120000,
    rating: 5.0,
    soldCount: 305,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Tìm lỗi nhanh",
    ribbonRight: "Hoàn tất trong 30 phút",
    customImage: assetImg7
  },
  {
    id: 302,
    name: "Sửa máy lọc nước không ra nước / nước yếu",
    category: "warranty",
    subcategory: "water_purifier",
    price: 150000,
    rating: 4.9,
    soldCount: 412,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Tay nghề cao",
    ribbonRight: "Hoàn tất trong 45 phút",
    customImage: assetImg8
  },
  {
    id: 303,
    name: "Sửa bình nóng lạnh không nóng / nóng chậm",
    category: "warranty",
    subcategory: "water_heater",
    price: 200000,
    rating: 4.8,
    soldCount: 97,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Linh kiện chuẩn",
    ribbonRight: "Hoàn tất trong 40 phút",
    customImage: assetImg9
  },
  {
    id: 304,
    name: "Sửa bình nóng lạnh rò điện (Thay chống giật ELCB)",
    category: "warranty",
    subcategory: "water_heater",
    price: 250000,
    rating: 5.0,
    soldCount: 64,
    warrantyText: "Bảo hành 90 ngày",
    ribbonLeft: "An toàn cao",
    ribbonRight: "Hoàn tất trong 30 phút",
    customImage: assetImg1
  },
  {
    id: 305,
    name: "Khắc phục Camera mất kết nối / không ghi hình",
    category: "warranty",
    subcategory: "camera",
    price: 120000,
    rating: 4.9,
    soldCount: 145,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Cấu hình lại",
    ribbonRight: "Chỉ trong 20 phút",
    customImage: assetImg2
  },
  {
    id: 306,
    name: "Sửa máy lọc khí báo lỗi cảm biến / không lên nguồn",
    category: "warranty",
    subcategory: "air_purifier",
    price: 180000,
    rating: 4.9,
    soldCount: 39,
    warrantyText: "Bảo hành 30 ngày",
    ribbonLeft: "Tay nghề cao",
    ribbonRight: "Hoàn tất trong 50 phút",
    customImage: assetImg3
  }
];

const defaultMainCategories = [
  { id: 'installation', name: 'Thợ lắp đặt' },
  { id: 'maintenance', name: 'Thợ bảo dưỡng' },
  { id: 'warranty', name: 'Thợ bảo hành' }
];

const defaultSubcategories = [
  { id: 'water_purifier', name: 'Máy lọc nước' },
  { id: 'water_heater', name: 'Máy nước nóng' },
  { id: 'camera', name: 'Camera' },
  { id: 'air_purifier', name: 'Máy lọc khí' }
];

export function ServiceQuotationPage() {
  const container = document.createElement('div');
  container.className = 'services-quotation-page';

  // Inject standard application header (for desktop view compatibility)
  container.appendChild(Header());

  // Page local state
  let currentCategory = 'installation'; // Default: Thợ lắp đặt
  let currentSubcategory = 'all'; // Default: Tất cả thiết bị
  let selectedLocation = 'Hà Đông'; // Default district
  let searchQuery = ''; // Search keyword query
  const hashParts = window.location.hash.split('?');
  if (hashParts.length > 1) {
    const urlParams = new URLSearchParams(hashParts[1]);
    const urlQuery = urlParams.get('search') || urlParams.get('q') || urlParams.get('keyword');
    if (urlQuery) {
      searchQuery = decodeURIComponent(urlQuery);
    }
  }
  let cart = [];

  // Persistent Admin Data State
  let services = [];
  let mainCategories = [];
  let subCategories = [];

  // Admin Mode check (Only actual admin accounts have access)
  const currentUser = authService.getCurrentUser();
  const isAccountAdmin = !!(currentUser && (
    currentUser.username?.toLowerCase() === 'admin' ||
    currentUser.role?.toLowerCase() === 'admin' ||
    currentUser.is_admin === true ||
    currentUser.is_admin === 1 ||
    currentUser.user_type?.toLowerCase() === 'admin'
  ));
  let isAdminMode = isAccountAdmin && localStorage.getItem('services_admin_mode') !== 'false';

  // Data persistence helpers
  const loadServices = () => {
    try {
      const stored = localStorage.getItem('services_quotation_data');
      if (stored) {
        let storedServices = JSON.parse(stored);
        services = storedServices.map(s => {
          const sample = sampleServices.find(item => String(item.id) === String(s.id));
          return {
            ...s,
            customImage: sample ? sample.customImage : (s.customImage || null)
          };
        });
      } else {
        services = [...sampleServices];
      }
    } catch (e) {
      console.warn("Failed to load services data from localStorage", e);
      services = [...sampleServices];
    }
  };

  const saveServices = () => {
    localStorage.setItem('services_quotation_data', JSON.stringify(services));
    window.dispatchEvent(new Event('storage'));
  };

  const loadCategories = () => {
    try {
      const storedMain = localStorage.getItem('services_quotation_main_categories');
      mainCategories = storedMain ? JSON.parse(storedMain) : [...defaultMainCategories];

      const storedSub = localStorage.getItem('services_quotation_sub_categories');
      subCategories = storedSub ? JSON.parse(storedSub) : [...defaultSubcategories];
    } catch (e) {
      console.warn("Failed to load categories data from localStorage", e);
      mainCategories = [...defaultMainCategories];
      subCategories = [...defaultSubcategories];
    }
  };

  const saveCategories = () => {
    localStorage.setItem('services_quotation_main_categories', JSON.stringify(mainCategories));
    localStorage.setItem('services_quotation_sub_categories', JSON.stringify(subCategories));
  };

  // Load cart from localStorage
  const loadCart = () => {
    try {
      const stored = localStorage.getItem('services_cart');
      if (stored) {
        cart = JSON.parse(stored);
      }
    } catch (err) {
      console.warn("Failed to parse cart data from localStorage", err);
      cart = [];
    }
  };

  const saveCart = () => {
    localStorage.setItem('services_cart', JSON.stringify(cart));
    updateCartCountBadge();
    renderCartItems();
  };

  loadServices();
  loadCategories();
  loadCart();

  // Ensure current category is valid
  if (!mainCategories.some(c => c.id === currentCategory) && mainCategories.length > 0) {
    currentCategory = mainCategories[0].id;
  }

  // Create layout wrapper
  const main = document.createElement('main');
  main.className = 'services-main';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';

  // 1. ADMIN TOOLBAR (Displays ONLY when logged in as admin)
  let renderAdminToolbar = () => { };
  if (isAccountAdmin) {
    const adminToolbar = document.createElement('div');
    adminToolbar.className = 'quote-admin-toolbar';
    adminToolbar.id = 'adminToolbar';
    renderAdminToolbar = () => {
      adminToolbar.innerHTML = `
        <div class="admin-toolbar-info">
          <span class="admin-badge"><i class="fas fa-user-shield"></i> Admin Quản Trị</span>
          <span style="font-size: 0.9rem; font-weight: 500;">Bảng điều khiển danh mục & báo giá dịch vụ</span>
        </div>
        <div class="admin-toolbar-actions">
          <button class="admin-btn btn-primary-admin" id="addServiceBtn"><i class="fas fa-plus"></i> Thêm dịch vụ mới</button>
          <button class="admin-btn" id="manageCategoriesBtn"><i class="fas fa-folder-plus"></i> Quản lý danh mục</button>
          <button class="admin-btn btn-toggle-mode ${isAdminMode ? '' : 'off'}" id="toggleAdminModeBtn">
            <i class="fas ${isAdminMode ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
            ${isAdminMode ? 'Chế độ Admin: BẬT' : 'Chế độ Admin: TẮT'}
          </button>
        </div>
      `;
    };
    renderAdminToolbar();
    containerDiv.appendChild(adminToolbar);
  }

  // 2. PAGE HEADER CARD WITH SEARCH SECTION
  const pageHeader = document.createElement('div');
  pageHeader.className = 'page-header';
  pageHeader.innerHTML = `
    <h1><i class="fas fa-file-invoice-dollar"></i> Báo Giá Dịch Vụ</h1>
    <p style="text-align: center; margin: 0 auto; max-width: 600px;">Lên ý tưởng, tham khảo báo giá lắp đặt, bảo dưỡng và sửa chữa thiết bị của bạn</p>
    
    <!-- SEARCH SECTION -->
    <div class="quote-search-section">
      <div class="quote-search-wrapper">
        <i class="fas fa-search quote-search-icon"></i>
        <input type="text" id="quoteSearchInput" class="quote-search-input" placeholder="Tìm kiếm dịch vụ (Ví dụ: máy lọc nước RO, thay lõi, bình nóng lạnh, camera...)" value="${searchQuery}" />
        <button class="quote-search-clear-btn" id="quoteSearchClearBtn" style="display: ${searchQuery ? 'flex' : 'none'};" title="Xóa tìm kiếm">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="quote-search-tags">
        <span class="search-tag-label"><i class="fas fa-fire" style="color:#f97316;"></i> Gợi ý tìm kiếm:</span>
        <button class="search-tag-chip" data-keyword="Máy lọc nước RO">Máy lọc nước RO</button>
        <button class="search-tag-chip" data-keyword="Thay lõi">Thay lõi lọc</button>
        <button class="search-tag-chip" data-keyword="Bình nước nóng">Bình nước nóng</button>
        <button class="search-tag-chip" data-keyword="Camera">Camera Wifi</button>
        <button class="search-tag-chip" data-keyword="Bảo dưỡng">Bảo dưỡng</button>
      </div>
    </div>
  `;
  containerDiv.appendChild(pageHeader);

  // 3. CONTROL CARD (Combines district selection badge, category tabs, and shopping cart button)
  const controlCard = document.createElement('div');
  controlCard.className = 'quote-control-card';

  const renderControlCardHTML = () => {
    const tabsHTML = mainCategories.map(cat => `
      <button class="category-tab-btn ${cat.id === currentCategory ? 'active' : ''}" data-cat="${cat.id}">${cat.name}</button>
    `).join('');

    controlCard.innerHTML = `
      <div class="quote-control-left">
        <div class="location-selector" id="locationSelector" title="Thay đổi địa chỉ / khu vực">
          <i class="fas fa-map-marker-alt"></i>
          <span id="locationText" style="font-weight: 600; font-size: 0.9rem; color: #334155;">${selectedLocation}</span>
          <i class="fas fa-chevron-down" style="font-size: 0.75rem; color: #64748b; margin-left: 2px;"></i>
        </div>
      </div>
      
      <div class="quote-control-center">
        <div class="category-tabs" id="categoryTabs">
          ${tabsHTML}
        </div>
      </div>
      
      <div class="quote-control-right">
        <div class="cart-icon-wrapper" id="cartIconBtn" title="Xem giỏ hàng dịch vụ">
          <i class="fas fa-shopping-cart"></i>
          <span class="cart-badge" id="cartBadgeCount">0</span>
        </div>
      </div>
    `;
  };
  renderControlCardHTML();
  containerDiv.appendChild(controlCard);

  // 4. SUBCATEGORY HORIZONTAL SLIDER
  const subFilters = document.createElement('div');
  subFilters.className = 'sub-filters-container';

  const renderSubFiltersHTML = () => {
    const subButtons = subCategories.map(sub => `
      <button class="sub-filter-btn ${sub.id === currentSubcategory ? 'active' : ''}" data-sub="${sub.id}">
        <img src="${getSubcategorySVG(sub.id)}" alt="${sub.name}" />
        ${sub.name}
      </button>
    `).join('');

    subFilters.innerHTML = `
      <div class="sub-filters" id="subFilters">
        <button class="sub-filter-btn ${currentSubcategory === 'all' ? 'active' : ''}" data-sub="all">Tất cả</button>
        ${subButtons}
      </div>
    `;
  };
  renderSubFiltersHTML();
  containerDiv.appendChild(subFilters);

  // 4.5 NEARBY TECHNICIANS SLIDER SECTION
  const nearbyTechsSection = document.createElement('div');
  nearbyTechsSection.className = 'nearby-techs-section';
  nearbyTechsSection.id = 'nearbyTechsSection';
  containerDiv.appendChild(nearbyTechsSection);

  // 5. SERVICES GRID
  const gridContainer = document.createElement('div');
  gridContainer.className = 'services-grid-container';
  const grid = document.createElement('div');
  grid.className = 'services-grid';
  grid.id = 'servicesGrid';
  gridContainer.appendChild(grid);
  containerDiv.appendChild(gridContainer);

  main.appendChild(containerDiv);
  container.appendChild(main);

  // 6. SHOPPING CART DRAWER (Slide-out menu)
  const cartOverlay = document.createElement('div');
  cartOverlay.className = 'cart-drawer-overlay';
  cartOverlay.id = 'cartOverlay';
  container.appendChild(cartOverlay);

  const cartDrawer = document.createElement('div');
  cartDrawer.className = 'cart-drawer';
  cartDrawer.id = 'cartDrawer';
  cartDrawer.innerHTML = `
    <div class="cart-drawer-header">
      <h3><i class="fas fa-file-invoice-dollar" style="color:var(--primary-color);"></i> Dịch Vụ Đã Chọn</h3>
      <button class="close-cart-btn" id="closeCartBtn" aria-label="Đóng giỏ hàng">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="cart-items-list" id="cartItemsList">
      <!-- Dynamic cart items list here -->
    </div>
    <div class="cart-drawer-footer">
      <div class="cart-summary-row">
        <span class="cart-summary-label">Tổng tạm tính:</span>
        <span class="cart-total-value" id="cartTotalValue">0đ</span>
      </div>
      <button class="cart-checkout-btn" id="cartCheckoutBtn">
        <i class="fas fa-calendar-check"></i> Đặt Lịch Ngay
      </button>
    </div>
  `;
  container.appendChild(cartDrawer);



  // Inject Footer
  container.appendChild(Footer());

  // === INTERACTION LOGIC & EVENT LISTENERS ===

  // Helper to format currency
  const formatVND = (number) => {
    return new Intl.NumberFormat('vi-VN').format(number) + 'đ';
  };

  // Render service cards grid based on active filter state
  const renderServices = () => {
    const servicesGrid = container.querySelector('#servicesGrid');
    if (!servicesGrid) return;

    const query = searchQuery.trim().toLowerCase();

    // Filter logic
    const filtered = services.filter(s => {
      const matchName = s.name ? s.name.toLowerCase().includes(query) : false;
      const matchCatName = s.category ? s.category.toLowerCase().includes(query) : false;
      const matchSubName = s.subcategory ? s.subcategory.toLowerCase().includes(query) : false;
      const matchSearch = !query || matchName || matchCatName || matchSubName;

      if (query) {
        // When searching, match across all categories
        return matchSearch;
      }

      const matchCat = s.category === currentCategory;
      const matchSub = currentSubcategory === 'all' || s.subcategory === currentSubcategory;
      return matchCat && matchSub;
    });

    // Render search result count banner
    const searchBanner = container.querySelector('#quoteSearchBanner');
    if (query) {
      if (!searchBanner) {
        const bannerDiv = document.createElement('div');
        bannerDiv.id = 'quoteSearchBanner';
        bannerDiv.className = 'quote-search-banner';
        bannerDiv.style.cssText = 'background:#fff7ed; border:1px solid #ffedd5; padding:12px 18px; border-radius:10px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;';
        servicesGrid.parentNode.insertBefore(bannerDiv, servicesGrid);
      }
      const activeBanner = container.querySelector('#quoteSearchBanner');
      if (activeBanner) {
        activeBanner.style.display = 'flex';
        activeBanner.innerHTML = `
          <div style="font-size:0.92rem; color:#9a3412; font-weight:500;">
            <i class="fas fa-search" style="color:#f97316;"></i> Kết quả tìm kiếm cho từ khóa: <strong>"${searchQuery}"</strong> (Tìm thấy <strong>${filtered.length}</strong> dịch vụ)
          </div>
          <button id="resetSearchBannerBtn" style="background:#f97316; color:#fff; border:none; padding:6px 14px; border-radius:6px; font-size:0.82rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
            <i class="fas fa-rotate-left"></i> Xem tất cả dịch vụ
          </button>
        `;
        activeBanner.querySelector('#resetSearchBannerBtn')?.addEventListener('click', () => {
          searchQuery = '';
          const inputEl = container.querySelector('#quoteSearchInput');
          if (inputEl) inputEl.value = '';
          const clearBtn = container.querySelector('#quoteSearchClearBtn');
          if (clearBtn) clearBtn.style.display = 'none';
          renderServices();
        });
      }
    } else {
      if (searchBanner) searchBanner.style.display = 'none';
    }

    if (filtered.length === 0) {
      const activeSubObj = subCategories.find(s => s.id === currentSubcategory);
      const activeCatObj = mainCategories.find(c => c.id === currentCategory);
      const categoryName = query ? `từ khóa "${searchQuery}"` : (activeSubObj ? activeSubObj.name : (activeCatObj ? activeCatObj.name : ''));

      servicesGrid.innerHTML = '';
      servicesGrid.appendChild(MissingServiceFeedback({ categoryName }));
      return;
    }

    servicesGrid.innerHTML = filtered.map(service => {
      const isInCart = cart.some(item => item.id === service.id);
      const isNoWarranty = service.warrantyClass === 'no-warranty';
      const imgSrc = service.customImage || getSubcategorySVG(service.subcategory);

      const adminActionsHTML = (isAccountAdmin && isAdminMode) ? `
        <div class="card-admin-actions">
          <button class="card-admin-btn edit-btn" data-id="${service.id}" title="Chỉnh sửa dịch vụ">
            <i class="fas fa-pen"></i>
          </button>
          <button class="card-admin-btn delete-btn" data-id="${service.id}" title="Xóa dịch vụ">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      ` : '';

      return `
        <div class="service-card-new" data-id="${service.id}" style="cursor: pointer;">
          ${adminActionsHTML}
          <div class="card-img-wrapper">
            <img src="${imgSrc}" alt="${service.name}" loading="lazy"/>
            <div class="warranty-badge ${service.warrantyClass || ''}">
              <i class="${isNoWarranty ? 'fas fa-info-circle' : 'fas fa-shield-halved'}"></i>
              ${service.warrantyText}
            </div>
            <div class="ribbon-banner">
              <div class="ribbon-left">${service.ribbonLeft || 'Chuẩn hãng'}</div>
              <div class="ribbon-right">${service.ribbonRight || 'Nhanh chóng'}</div>
            </div>
          </div>
          <div class="card-info">
            <h3 class="card-title">${service.name}</h3>
            <div class="card-price">${formatVND(service.price)}</div>
            <div class="card-stats">
              <span class="star-rating">
                <i class="fas fa-star"></i> ${(service.rating || 5.0).toFixed(1)}
              </span>
              <span class="sold-count">Đã bán ${service.soldCount || 0}</span>
            </div>
            <div class="card-actions-row">
              <button class="add-to-cart-btn view-detail-btn" data-id="${service.id}" title="Xem chi tiết dịch vụ">
                <i class="fas fa-eye"></i> Chi tiết
              </button>
              <button class="add-to-cart-btn direct-book-btn" data-id="${service.id}" title="Đặt lịch ngay cho dịch vụ này">
                <i class="fas fa-calendar-check"></i> Đặt lịch
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to service card & "Chi tiết" / "Đặt lịch ngay" buttons
    servicesGrid.querySelectorAll('.service-card-new').forEach(card => {
      const id = parseInt(card.getAttribute('data-id')) || card.getAttribute('data-id');

      card.addEventListener('click', (e) => {
        // If clicking buttons or admin actions, don't trigger full card click
        if (e.target.closest('button') || e.target.closest('.card-admin-actions')) return;
        window.location.hash = `/services-quotation-detail?id=${id}`;
      });

      card.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.location.hash = `/services-quotation-detail?id=${id}`;
        });
      });

      card.querySelectorAll('.direct-book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const service = services.find(s => s.id == id);
          if (service) {
            handleDirectBooking(service);
          }
        });
      });
    });

    // Attach click listeners for Admin Edit & Delete buttons
    if (isAccountAdmin && isAdminMode) {
      servicesGrid.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id')) || btn.getAttribute('data-id');
          const service = services.find(s => s.id == id);
          if (service) {
            openServiceModal(service);
          }
        });
      });

      servicesGrid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-id')) || btn.getAttribute('data-id');
          const service = services.find(s => s.id == id);
          if (service && confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.name}"?`)) {
            services = services.filter(s => s.id != id);
            cart = cart.filter(i => i.id != id);
            saveServices();
            saveCart();
            renderServices();
            Toast.success(`Đã xóa dịch vụ: ${service.name}`, 2000);
          }
        });
      });
    }
  };

  // Direct booking redirect
  const handleDirectBooking = (service) => {
    const serviceString = `Dịch vụ: ${service.name} - Báo giá: ${formatVND(service.price)} (${service.warrantyText}, Khu vực: ${selectedLocation})`;
    Toast.info(`Đang chuyển tới trang đặt lịch dịch vụ: ${service.name}...`, 2000);
    setTimeout(() => {
      window.location.hash = `#/booking?service_id=6&service_name=${encodeURIComponent(serviceString)}`;
    }, 600);
  };

  // Add item to cart
  const handleAddToCart = (service) => {
    const existing = cart.find(item => item.id === service.id);
    if (existing) {
      existing.quantity += 1;
      Toast.success(`Đã tăng số lượng: ${service.name}`, 2000);
    } else {
      cart.push({
        id: service.id,
        name: service.name,
        price: service.price,
        subcategory: service.subcategory,
        quantity: 1,
        warrantyText: service.warrantyText
      });
      Toast.success(`Đã thêm vào giỏ hàng: ${service.name}`, 2000);
    }
    saveCart();
    renderServices();
  };

  // Update quantity in cart drawer
  const updateQuantity = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
      Toast.info("Đã xóa dịch vụ khỏi giỏ hàng", 2000);
    }
    saveCart();
    renderServices();
  };

  // Update cart badge indicator
  const updateCartCountBadge = () => {
    const badge = container.querySelector('#cartBadgeCount');
    if (!badge) return;
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? 'flex' : 'none';
  };

  // Render cart items inside Drawer
  const renderCartItems = () => {
    const list = container.querySelector('#cartItemsList');
    const totalVal = container.querySelector('#cartTotalValue');
    if (!list || !totalVal) return;

    if (cart.length === 0) {
      list.innerHTML = `
        <div class="cart-empty-state">
          <i class="fas fa-shopping-basket"></i>
          <p style="font-weight:600; margin:0 0 5px 0;">Giỏ hàng trống</p>
          <p style="font-size:0.85rem; margin:0; padding:0 20px;">Hãy chọn các dịch vụ kỹ thuật cần thiết từ danh sách.</p>
        </div>
      `;
      totalVal.textContent = '0đ';
      return;
    }

    list.innerHTML = cart.map(item => {
      const imgSrc = item.customImage || getSubcategorySVG(item.subcategory);
      return `
        <div class="cart-item-card" data-id="${item.id}">
          <img class="cart-item-img" src="${imgSrc}" alt="${item.name}" />
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-price-row">
              <span class="cart-item-price">${formatVND(item.price)}</span>
              <div class="cart-item-quantity-control">
                <button class="qty-btn minus-qty" data-id="${item.id}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn plus-qty" data-id="${item.id}">+</button>
                <button class="remove-cart-item-btn" data-id="${item.id}" title="Xóa" style="margin-left: 8px;">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    totalVal.textContent = formatVND(total);

    // Attach listeners
    list.querySelectorAll('.minus-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id')) || btn.getAttribute('data-id');
        updateQuantity(id, -1);
      });
    });

    list.querySelectorAll('.plus-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id')) || btn.getAttribute('data-id');
        updateQuantity(id, 1);
      });
    });

    list.querySelectorAll('.remove-cart-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id')) || btn.getAttribute('data-id');
        updateQuantity(id, -Infinity);
      });
    });
  };

  // Toggle Cart Drawer
  const toggleCartDrawer = (isOpen) => {
    const drawer = container.querySelector('#cartDrawer');
    const overlay = container.querySelector('#cartOverlay');
    if (!drawer || !overlay) return;

    if (isOpen) {
      drawer.classList.add('active');
      overlay.classList.add('active');
    } else {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
    }
  };

  // === ADMIN MODALS (Service Add/Edit & Categories Management) ===

  const openServiceModal = (serviceToEdit = null) => {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'sq-modal-overlay';

    const isEdit = !!serviceToEdit;
    const catOptions = mainCategories.map(c => `
      <option value="${c.id}" ${(serviceToEdit && serviceToEdit.category === c.id) ? 'selected' : ''}>${c.name}</option>
    `).join('');

    const subOptions = subCategories.map(s => `
      <option value="${s.id}" ${(serviceToEdit && serviceToEdit.subcategory === s.id) ? 'selected' : ''}>${s.name}</option>
    `).join('');

    let currentImgPreview = serviceToEdit ? (serviceToEdit.customImage || getSubcategorySVG(serviceToEdit.subcategory)) : getSubcategorySVG(subCategories[0]?.id || 'water_purifier');

    modalOverlay.innerHTML = `
      <div class="sq-modal-card">
        <div class="sq-modal-header">
          <h3><i class="fas ${isEdit ? 'fa-pen-to-square' : 'fa-plus-circle'}" style="color:var(--primary-color);"></i> ${isEdit ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="sq-modal-body">
          <div class="sq-form-group">
            <label>Tên dịch vụ <span style="color:red;">*</span></label>
            <input type="text" id="sqFormName" value="${serviceToEdit ? serviceToEdit.name : ''}" placeholder="Nhập tên dịch vụ kỹ thuật..." required />
          </div>

          <div class="sq-form-row">
            <div class="sq-form-group">
              <label>Danh mục chính <span style="color:red;">*</span></label>
              <select id="sqFormCategory">
                ${catOptions}
              </select>
            </div>
            <div class="sq-form-group">
              <label>Phân loại thiết bị <span style="color:red;">*</span></label>
              <select id="sqFormSubcategory">
                ${subOptions}
              </select>
            </div>
          </div>

          <div class="sq-form-row">
            <div class="sq-form-group">
              <label>Giá dịch vụ (VNĐ) <span style="color:red;">*</span></label>
              <input type="number" id="sqFormPrice" value="${serviceToEdit ? serviceToEdit.price : 150000}" step="5000" min="0" required />
            </div>
            <div class="sq-form-group">
              <label>Chế độ bảo hành</label>
              <input type="text" id="sqFormWarrantyText" value="${serviceToEdit ? serviceToEdit.warrantyText : 'Bảo hành 30 ngày'}" placeholder="Ví dụ: Bảo hành 30 ngày" />
            </div>
          </div>

          <div class="sq-form-row">
            <div class="sq-form-group">
              <label>Loại bảo hành</label>
              <select id="sqFormWarrantyClass">
                <option value="" ${serviceToEdit && serviceToEdit.warrantyClass !== 'no-warranty' ? 'selected' : ''}>Bảo hành tiêu chuẩn (Xanh lá)</option>
                <option value="no-warranty" ${serviceToEdit && serviceToEdit.warrantyClass === 'no-warranty' ? 'selected' : ''}>Cảnh báo / Không bảo hành (Đỏ)</option>
              </select>
            </div>
            <div class="sq-form-group">
              <label>Điểm đánh giá (Star rating)</label>
              <input type="number" id="sqFormRating" value="${serviceToEdit ? serviceToEdit.rating : 5.0}" step="0.1" min="1" max="5" />
            </div>
          </div>

          <div class="sq-form-row">
            <div class="sq-form-group">
              <label>Nhãn Ribbon Trái (Cam)</label>
              <input type="text" id="sqFormRibbonLeft" value="${serviceToEdit ? serviceToEdit.ribbonLeft : 'Chuẩn hãng'}" placeholder="Nổi bật trái..." />
            </div>
            <div class="sq-form-group">
              <label>Nhãn Ribbon Phải (Xanh)</label>
              <input type="text" id="sqFormRibbonRight" value="${serviceToEdit ? serviceToEdit.ribbonRight : 'Hoàn tất trong 60 phút'}" placeholder="Nổi bật phải..." />
            </div>
          </div>

          <div class="sq-form-group">
            <label>Hình ảnh minh họa dịch vụ</label>
            <div class="sq-image-preview-wrapper">
              <div class="sq-image-preview-box">
                <img id="sqImgPreview" src="${currentImgPreview}" alt="Preview" />
              </div>
              <div style="flex-grow:1; display:flex; flex-direction:column; gap:8px;">
                <input type="file" id="sqFormFileInput" accept="image/*" style="font-size:0.85rem;" />
                <input type="text" id="sqFormImgUrl" value="${serviceToEdit && serviceToEdit.customImage ? serviceToEdit.customImage : ''}" placeholder="Hoặc dán URL / Data Image tại đây..." style="font-size:0.85rem;" />
              </div>
            </div>
          </div>
        </div>

        <div class="sq-modal-footer">
          <button class="sq-btn-cancel" id="sqCancelBtn">Hủy</button>
          <button class="sq-btn-submit" id="sqSaveBtn">${isEdit ? 'Lưu Thay Đổi' : 'Thêm Dịch Vụ'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeBtn = modalOverlay.querySelector('.close-modal');
    const cancelBtn = modalOverlay.querySelector('#sqCancelBtn');
    const saveBtn = modalOverlay.querySelector('#sqSaveBtn');
    const fileInput = modalOverlay.querySelector('#sqFormFileInput');
    const imgUrlInput = modalOverlay.querySelector('#sqFormImgUrl');
    const imgPreview = modalOverlay.querySelector('#sqImgPreview');
    const subSelect = modalOverlay.querySelector('#sqFormSubcategory');

    let customImageData = serviceToEdit ? (serviceToEdit.customImage || null) : null;

    subSelect.addEventListener('change', () => {
      if (!customImageData && !imgUrlInput.value.trim()) {
        imgPreview.src = getSubcategorySVG(subSelect.value);
      }
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          customImageData = event.target.result;
          imgPreview.src = customImageData;
          imgUrlInput.value = '';
        };
        reader.readAsDataURL(file);
      }
    });

    imgUrlInput.addEventListener('input', () => {
      const val = imgUrlInput.value.trim();
      if (val) {
        customImageData = val;
        imgPreview.src = val;
      } else {
        customImageData = null;
        imgPreview.src = getSubcategorySVG(subSelect.value);
      }
    });

    const closeModal = () => modalOverlay.remove();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    saveBtn.addEventListener('click', () => {
      const name = modalOverlay.querySelector('#sqFormName').value.trim();
      const category = modalOverlay.querySelector('#sqFormCategory').value;
      const subcategory = modalOverlay.querySelector('#sqFormSubcategory').value;
      const price = parseFloat(modalOverlay.querySelector('#sqFormPrice').value) || 0;
      const warrantyText = modalOverlay.querySelector('#sqFormWarrantyText').value.trim() || 'Bảo hành 30 ngày';
      const warrantyClass = modalOverlay.querySelector('#sqFormWarrantyClass').value;
      const rating = parseFloat(modalOverlay.querySelector('#sqFormRating').value) || 5.0;
      const ribbonLeft = modalOverlay.querySelector('#sqFormRibbonLeft').value.trim() || 'Chuẩn hãng';
      const ribbonRight = modalOverlay.querySelector('#sqFormRibbonRight').value.trim() || 'Nhanh chóng';

      if (!name) {
        Toast.error("Vui lòng nhập tên dịch vụ!", 2500);
        return;
      }

      if (price <= 0) {
        Toast.error("Giá dịch vụ phải lớn hơn 0đ!", 2500);
        return;
      }

      const updatedServiceData = {
        id: serviceToEdit ? serviceToEdit.id : Date.now(),
        name,
        category,
        subcategory,
        price,
        rating,
        soldCount: serviceToEdit ? serviceToEdit.soldCount : 0,
        warrantyText,
        warrantyClass,
        ribbonLeft,
        ribbonRight,
        customImage: customImageData
      };

      if (serviceToEdit) {
        const idx = services.findIndex(s => s.id === serviceToEdit.id);
        if (idx !== -1) {
          services[idx] = updatedServiceData;
        }
        Toast.success(`Đã cập nhật dịch vụ: ${name}`, 2500);
      } else {
        services.push(updatedServiceData);
        Toast.success(`Đã thêm dịch vụ mới: ${name}`, 2500);
      }

      saveServices();
      renderServices();
      closeModal();
    });
  };

  const openCategoryManagementModal = () => {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'sq-modal-overlay';

    const renderCategoriesContent = () => {
      const mainCatList = mainCategories.map(cat => `
        <div class="cat-item-row" data-id="${cat.id}">
          <span><strong>${cat.name}</strong> (${cat.id})</span>
          <div class="cat-item-actions">
            <button class="cat-item-btn edit edit-main-cat-btn" data-id="${cat.id}"><i class="fas fa-edit"></i> Sửa</button>
            <button class="cat-item-btn delete delete-main-cat-btn" data-id="${cat.id}"><i class="fas fa-trash-alt"></i> Xóa</button>
          </div>
        </div>
      `).join('');

      const subCatList = subCategories.map(sub => `
        <div class="cat-item-row" data-id="${sub.id}">
          <span>
            <img src="${getSubcategorySVG(sub.id)}" style="width:20px; height:20px; vertical-align:middle; margin-right:6px;" />
            <strong>${sub.name}</strong> (${sub.id})
          </span>
          <div class="cat-item-actions">
            <button class="cat-item-btn edit edit-sub-cat-btn" data-id="${sub.id}"><i class="fas fa-edit"></i> Sửa</button>
            <button class="cat-item-btn delete delete-sub-cat-btn" data-id="${sub.id}"><i class="fas fa-trash-alt"></i> Xóa</button>
          </div>
        </div>
      `).join('');

      modalOverlay.innerHTML = `
        <div class="sq-modal-card">
          <div class="sq-modal-header">
            <h3><i class="fas fa-folder-tree" style="color:var(--primary-color);"></i> Quản Lý Danh Mục & Phân Loại</h3>
            <button class="close-modal">&times;</button>
          </div>
          <div class="sq-modal-body">
            <!-- Main Categories -->
            <div class="cat-mgmt-section">
              <h4>1. Danh mục chính (Thanh Tab ngang)</h4>
              <div id="mainCatListWrapper">
                ${mainCatList}
              </div>
              <div style="display:flex; gap:10px; margin-top:10px;">
                <input type="text" id="newMainCatName" placeholder="Tên danh mục mới (vd: Thợ sửa điện)..." style="flex:2; padding:8px 12px; font-size:0.88rem;" />
                <input type="text" id="newMainCatId" placeholder="Mã (trong ngoặc)..." style="flex:1; padding:8px 12px; font-size:0.88rem;" />
                <button class="sq-btn-submit" id="addMainCatBtn" style="padding:8px 14px; font-size:0.85rem;"><i class="fas fa-plus"></i> Thêm</button>
              </div>
            </div>

            <!-- Sub Categories -->
            <div class="cat-mgmt-section">
              <h4>2. Phân loại thiết bị (Subcategory Chips)</h4>
              <div id="subCatListWrapper">
                ${subCatList}
              </div>
              <div style="display:flex; gap:10px; margin-top:10px;">
                <input type="text" id="newSubCatName" placeholder="Tên loại thiết bị mới (vd: Tủ lạnh)..." style="flex:2; padding:8px 12px; font-size:0.88rem;" />
                <input type="text" id="newSubCatId" placeholder="Mã (trong ngoặc)..." style="flex:1; padding:8px 12px; font-size:0.88rem;" />
                <button class="sq-btn-submit" id="addSubCatBtn" style="padding:8px 14px; font-size:0.85rem;"><i class="fas fa-plus"></i> Thêm</button>
              </div>
            </div>
          </div>

          <div class="sq-modal-footer">
            <button class="sq-btn-cancel" id="closeCatMgmtBtn">Đóng</button>
          </div>
        </div>
      `;

      // Attach internal modal handlers
      const closeBtn = modalOverlay.querySelector('.close-modal');
      const closeMgmtBtn = modalOverlay.querySelector('#closeCatMgmtBtn');

      const closeModal = () => modalOverlay.remove();
      closeBtn.addEventListener('click', closeModal);
      closeMgmtBtn.addEventListener('click', closeModal);

      // Add main category
      modalOverlay.querySelector('#addMainCatBtn').addEventListener('click', () => {
        const nameInput = modalOverlay.querySelector('#newMainCatName');
        const idInput = modalOverlay.querySelector('#newMainCatId');
        const name = nameInput.value.trim();
        let id = idInput ? idInput.value.trim().toLowerCase().replace(/\s+/g, '_') : '';
        if (!name) {
          Toast.error("Vui lòng nhập tên danh mục chính!", 2000);
          return;
        }
        if (!id) {
          id = 'cat_' + Date.now();
        }
        if (mainCategories.some(c => c.id === id)) {
          Toast.error(`Mã danh mục "${id}" đã tồn tại!`, 2000);
          return;
        }
        mainCategories.push({ id, name });
        saveCategories();
        renderControlCardHTML();
        attachHeaderEventListeners();
        renderCategoriesContent();
        Toast.success(`Đã thêm danh mục: ${name}`, 2000);
      });

      // Add sub category
      modalOverlay.querySelector('#addSubCatBtn').addEventListener('click', () => {
        const nameInput = modalOverlay.querySelector('#newSubCatName');
        const idInput = modalOverlay.querySelector('#newSubCatId');
        const name = nameInput.value.trim();
        let id = idInput ? idInput.value.trim().toLowerCase().replace(/\s+/g, '_') : '';
        if (!name) {
          Toast.error("Vui lòng nhập tên loại thiết bị!", 2000);
          return;
        }
        if (!id) {
          id = 'sub_' + Date.now();
        }
        if (subCategories.some(s => s.id === id)) {
          Toast.error(`Mã phân loại "${id}" đã tồn tại!`, 2000);
          return;
        }
        subCategories.push({ id, name });
        saveCategories();
        renderSubFiltersHTML();
        attachSubFiltersEventListeners();
        renderCategoriesContent();
        Toast.success(`Đã thêm loại thiết bị: ${name}`, 2000);
      });

      // Dedicated modal for editing category name & ID in parentheses
      const openCategoryEditModal = (isSubCat, item) => {
        const editOverlay = document.createElement('div');
        editOverlay.className = 'sq-modal-overlay';
        editOverlay.style.zIndex = '1100';
        editOverlay.innerHTML = `
          <div class="sq-modal-card" style="max-width: 480px; width: 90%;">
            <div class="sq-modal-header">
              <h3><i class="fas fa-edit" style="color:var(--primary-color);"></i> Chỉnh Sửa ${isSubCat ? 'Phân Loại Thiết Bị' : 'Danh Mục Chính'}</h3>
              <button class="close-edit-modal">&times;</button>
            </div>
            <div class="sq-modal-body" style="display:flex; flex-direction:column; gap:14px; padding:20px;">
              <div>
                <label style="font-weight:600; font-size:0.88rem; color:#334155; margin-bottom:6px; display:block;">Tên hiển thị:</label>
                <input type="text" id="catEditName" value="${(item.name || '').replace(/"/g, '&quot;')}" style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.9rem;" />
              </div>
              <div>
                <label style="font-weight:600; font-size:0.88rem; color:#334155; margin-bottom:6px; display:block;">Mã trong ngoặc (ID):</label>
                <input type="text" id="catEditId" value="${(item.id || '').replace(/"/g, '&quot;')}" style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.9rem; font-family:monospace; background:#f8fafc;" />
              </div>
            </div>
            <div class="sq-modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:15px 20px;">
              <button class="sq-btn-cancel" id="cancelEditCatBtn">Hủy</button>
              <button class="sq-btn-submit" id="saveEditCatBtn"><i class="fas fa-save"></i> Cập nhật</button>
            </div>
          </div>
        `;
        document.body.appendChild(editOverlay);

        const closeEdit = () => editOverlay.remove();
        editOverlay.querySelector('.close-edit-modal').addEventListener('click', closeEdit);
        editOverlay.querySelector('#cancelEditCatBtn').addEventListener('click', closeEdit);
        editOverlay.addEventListener('click', (e) => {
          if (e.target === editOverlay) closeEdit();
        });

        editOverlay.querySelector('#saveEditCatBtn').addEventListener('click', () => {
          const newName = editOverlay.querySelector('#catEditName').value.trim();
          const newId = editOverlay.querySelector('#catEditId').value.trim().toLowerCase().replace(/\s+/g, '_');

          if (!newName || !newId) {
            Toast.error("Vui lòng nhập đầy đủ tên hiển thị và mã trong ngoặc!", 2000);
            return;
          }

          const list = isSubCat ? subCategories : mainCategories;
          if (newId !== item.id && list.some(x => x.id === newId)) {
            Toast.error(`Mã (ID) "${newId}" đã tồn tại!`, 2000);
            return;
          }

          const oldId = item.id;
          item.name = newName;
          item.id = newId;

          if (isSubCat) {
            if (oldId !== newId) {
              services.forEach(s => { if (s.subcategory === oldId) s.subcategory = newId; });
              if (currentSubcategory === oldId) currentSubcategory = newId;
              saveServices();
            }
            saveCategories();
            renderSubFiltersHTML();
            attachSubFiltersEventListeners();
          } else {
            if (oldId !== newId) {
              services.forEach(s => { if (s.category === oldId) s.category = newId; });
              if (currentCategory === oldId) currentCategory = newId;
              saveServices();
            }
            saveCategories();
            renderControlCardHTML();
            attachHeaderEventListeners();
          }

          renderServices();
          renderCategoriesContent();
          closeEdit();
          Toast.success("Đã cập nhật danh mục!", 2000);
        });
      };

      // Edit & Delete Main Category
      modalOverlay.querySelectorAll('.edit-main-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const cat = mainCategories.find(c => c.id === id);
          if (cat) openCategoryEditModal(false, cat);
        });
      });

      modalOverlay.querySelectorAll('.delete-main-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (mainCategories.length <= 1) {
            Toast.error("Cần giữ lại ít nhất 1 danh mục chính!", 2000);
            return;
          }
          if (confirm("Bạn có chắc muốn xóa danh mục này?")) {
            mainCategories = mainCategories.filter(c => c.id !== id);
            if (currentCategory === id) {
              currentCategory = mainCategories[0].id;
            }
            saveCategories();
            renderControlCardHTML();
            attachHeaderEventListeners();
            renderServices();
            renderCategoriesContent();
            Toast.success("Đã xóa danh mục!", 2000);
          }
        });
      });

      // Edit & Delete Sub Category
      modalOverlay.querySelectorAll('.edit-sub-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const sub = subCategories.find(s => s.id === id);
          if (sub) openCategoryEditModal(true, sub);
        });
      });

      modalOverlay.querySelectorAll('.delete-sub-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (confirm("Bạn có chắc muốn xóa phân loại thiết bị này?")) {
            subCategories = subCategories.filter(s => s.id !== id);
            if (currentSubcategory === id) {
              currentSubcategory = 'all';
            }
            saveCategories();
            renderSubFiltersHTML();
            attachSubFiltersEventListeners();
            renderServices();
            renderCategoriesContent();
            Toast.success("Đã xóa phân loại!", 2000);
          }
        });
      });
    };

    renderCategoriesContent();
    document.body.appendChild(modalOverlay);
  };

  // === NEARBY TECHNICIANS SLIDER LOGIC ===
  let nearbyTechs = [];
  let currentTechSlide = 0;
  let techRatingsMap = {};

  const sampleTechnicians = [
    { id: 101, username: "Nguyễn Văn Hùng", phone: "0987.654.321", address: "Hà Đông, Hà Nội", rating: 5.0, avartar: null },
    { id: 102, username: "Trần Đức Nam", phone: "0912.345.678", address: "Thanh Xuân, Hà Nội", rating: 4.9, avartar: null },
    { id: 103, username: "Lê Hoàng Anh", phone: "0978.123.456", address: "Cầu Giấy, Hà Nội", rating: 5.0, avartar: null },
    { id: 104, username: "Phạm Văn Minh", phone: "0904.567.890", address: "Hà Đông, Hà Nội", rating: 4.8, avartar: null },
    { id: 105, username: "Đỗ Mạnh Cường", phone: "0936.888.999", address: "Nam Từ Liêm, Hà Nội", rating: 4.9, avartar: null }
  ];

  const renderStars = (rating) => {
    const numRating = Number(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalf = (numRating % 1) >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    let html = "";
    for (let i = 0; i < fullStars; i++) {
      html += '<i class="fas fa-star" style="color:#f59e0b;"></i>';
    }
    if (hasHalf) {
      html += '<i class="fas fa-star-half-alt" style="color:#f59e0b;"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
      html += '<i class="far fa-star" style="color:#cbd5e1;"></i>';
    }
    return html;
  };

  const loadNearbyTechnicians = async () => {
    try {
      const res = await SupportService.getAllSupportTechnicians();
      const allTechs = res.data || res || [];
      if (Array.isArray(allTechs) && allTechs.length > 0) {
        // Geocode selectedLocation
        let userCoords = null;
        try {
          userCoords = await geocodeAddress(selectedLocation);
        } catch (e) { }

        const rawTokens = selectedLocation.split(/[,|\-\/]/).map(t => t.trim()).filter(Boolean);
        const locationKeywords = [];
        rawTokens.forEach(t => {
          const clean = t.replace(/^(Tỉnh|Thành phố|TP|Quận|Huyện|Phường|Xã|Thôn)\s+/gi, '').trim().toLowerCase();
          if (clean && clean.length >= 2) {
            locationKeywords.push(clean);
          }
        });

        const matched = [];
        await Promise.all(
          allTechs.map(async (tech) => {
            let techLat = tech.latitude;
            let techLon = tech.longitude;

            if (!techLat || !techLon) {
              const rawAddr = (tech.address || '').replace(/\|+/g, ' ').trim();
              if (rawAddr) {
                try {
                  const coords = await geocodeAddress(rawAddr);
                  techLat = coords.latitude;
                  techLon = coords.longitude;
                } catch (e) { }
              }
            }

            let distKm = null;
            let isMatched = false;

            if (userCoords && techLat && techLon) {
              distKm = calculateDistance(userCoords.latitude, userCoords.longitude, techLat, techLon);
              if (distKm <= 20) {
                isMatched = true;
              }
            }

            const aAddr = (tech.address || '').toLowerCase();
            if (!isMatched && locationKeywords.length > 0) {
              if (locationKeywords.some(kw => aAddr.includes(kw))) {
                isMatched = true;
                if (distKm === null) distKm = 3.5;
              }
            }

            if (!isMatched && (aAddr.includes('lấy hàng tại kho') || aAddr.includes('tại kho'))) {
              const isUserInHanoi = locationKeywords.some(kw => kw.includes('hà đông') || kw.includes('hà nội') || kw.includes('kiến hưng') || kw.includes('thanh xuân') || kw.includes('cầu giấy'));
              if (isUserInHanoi) {
                isMatched = true;
                if (distKm === null) distKm = 4.2;
              }
            }

            if (isMatched) {
              matched.push({
                ...tech,
                _distKm: distKm !== null ? Math.round(distKm * 10) / 10 : null
              });
            }
          })
        );

        nearbyTechs = matched;

        if (nearbyTechs.length > 0) {
          loadRatingsForTechs(nearbyTechs.slice(0, 10));
        }
      } else {
        nearbyTechs = [];
      }
    } catch (e) {
      console.warn("Failed to fetch technicians from API", e);
      nearbyTechs = [];
    }
    renderNearbyTechsHTML();
  };

  const loadRatingsForTechs = async (techs) => {
    const promises = techs.map(t =>
      SupportService.getListOrderRating(t.id, true)
        .then(res => {
          const reviews = res.data || res || [];
          if (Array.isArray(reviews) && reviews.length > 0) {
            const avg = reviews.reduce((sum, r) => sum + (parseInt(r.rate) || 0), 0) / reviews.length;
            techRatingsMap[t.id] = {
              avgRating: Math.round(avg * 10) / 10,
              count: reviews.length
            };
          } else {
            techRatingsMap[t.id] = { avgRating: 5.0, count: 0 };
          }
        })
        .catch(() => {
          techRatingsMap[t.id] = { avgRating: 5.0, count: 0 };
        })
    );
    await Promise.all(promises);

    // Re-sort nearbyTechs considering distance & ratings
    nearbyTechs.sort((a, b) => {
      const distA = a._distKm !== null ? a._distKm : 999;
      const distB = b._distKm !== null ? b._distKm : 999;
      if (Math.abs(distA - distB) > 3) return distA - distB;

      const rA = techRatingsMap[a.id]?.avgRating || a.rating || 5.0;
      const rB = techRatingsMap[b.id]?.avgRating || b.rating || 5.0;
      return rB - rA;
    });

    renderNearbyTechsHTML();
  };

  const renderNearbyTechsHTML = () => {
    const section = container.querySelector('#nearbyTechsSection');
    if (!section) return;

    if (!nearbyTechs || nearbyTechs.length === 0) {
      const safeLoc = String(selectedLocation)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      section.style.display = 'block';
      section.innerHTML = `
        <div class="nearby-techs-header">
          <div class="nearby-techs-title">
            <h2><i class="fas fa-users-gear" style="color:var(--primary-color);"></i> Kỹ Thuật Viên Gần Bạn</h2>
            <p>Khu vực đã chọn: <strong>${safeLoc}</strong></p>
          </div>
        </div>
        <div class="sd-no-techs-box" style="background:#fffcf9; border:2px dashed #fed7aa; border-radius:16px; padding:28px 20px; text-align:center; margin:10px 0;">
          <div style="width:54px; height:54px; border-radius:50%; background:#fff7ed; color:#f97316; display:flex; align-items:center; justify-content:center; font-size:1.6rem; margin:0 auto 12px auto; border:2px solid #ffedd5;">
            <i class="fas fa-user-slash"></i>
          </div>
          <h4 style="font-size:1.1rem; font-weight:700; color:#0f172a; margin:0 0 6px 0;">
            Chưa có kỹ thuật viên trong bán kính 20km
          </h4>
          <p style="font-size:0.9rem; color:#64748b; margin:0 0 16px 0; max-width:500px; margin-left:auto; margin-right:auto; line-height:1.5;">
            Hiện tại chưa có kỹ thuật viên đăng ký làm việc trong bán kính 20km từ khu vực <strong>${safeLoc}</strong>. Bạn có thể đến trang <strong>Tìm Thợ</strong> để xem danh sách tất cả kỹ thuật viên hoặc chọn thợ từ khu vực lân cận.
          </p>
          <a href="#/hotline" class="sd-btn-find-tech" style="display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg, var(--primary-color, #f97316) 0%, #ea580c 100%); color:#ffffff; padding:10px 20px; border-radius:8px; font-size:0.92rem; font-weight:600; text-decoration:none; box-shadow:0 4px 12px rgba(249,115,22,0.3);">
            <i class="fas fa-users-gear"></i> Đến Trang Tìm Thợ Để Chọn Thợ
          </a>
        </div>
      `;
      return;
    }
    section.style.display = 'block';

    const maxSlides = Math.max(0, nearbyTechs.length - 3);

    const cardsHTML = nearbyTechs.map((tech, index) => {
      const avatarSrc = tech.avartar ? getImageUrl(tech.avartar) : '';
      const avatarHTML = avatarSrc ? `<img src="${avatarSrc}" alt="${tech.username || 'Kỹ thuật viên'}" />` : `<i class="fas fa-user-gear"></i>`;
      const addressText = tech.address ? tech.address.replace(/\|+/g, ' ').trim() : `Khu vực: ${selectedLocation}`;

      const ratingInfo = techRatingsMap[tech.id] || { avgRating: tech.rating || 5.0, count: 0 };
      const ratingVal = ratingInfo.avgRating;
      const countVal = ratingInfo.count;

      // Recommended badge on top technician (matching Hotline page style)
      const isNearestMatch = index === 0;
      const recommendedBadgeHTML = isNearestMatch ? `
        <div class="recommended-badge">
          <i class="fas fa-star"></i>
          <span>Đề xuất gần nhất</span>
        </div>
      ` : '';

      return `
        <div class="tech-card-slide ${isNearestMatch ? 'nearest-tech' : ''}" data-id="${tech.id}">
          ${recommendedBadgeHTML}
          <div class="tech-slide-top" data-id="${tech.id}" style="cursor: pointer;" title="Bấm để xem chi tiết thông tin kỹ thuật viên ${tech.username || ''}">
            <div class="tech-slide-avatar">
              ${avatarHTML}
              <div class="tech-online-dot" title="Đang sẵn sàng"></div>
            </div>
            <div class="tech-slide-meta">
              <div class="tech-slide-name" title="${tech.username || tech.name || 'Kỹ thuật viên'}">${tech.username || tech.name || 'Kỹ thuật viên'}</div>
              <div class="tech-slide-location" title="${addressText}">
                <i class="fas fa-map-marker-alt" style="color:var(--primary-color);"></i>
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${addressText}</span>
              </div>
              <div class="tech-slide-rating">
                <div class="tech-rating-stars">${renderStars(ratingVal)}</div>
                <span>${ratingVal.toFixed(1)} ${countVal > 0 ? `(${countVal})` : '(Sẵn sàng)'}</span>
              </div>
            </div>
          </div>
          <div class="tech-slide-actions">
            <button class="tech-slide-btn view-detail view-tech-detail-btn" data-id="${tech.id}" style="background:#e0f2fe; color:#0284c7; border:1px solid #bae6fd;" title="Xem chi tiết thợ">
              <i class="fas fa-id-card"></i> Chi tiết
            </button>
            <button class="tech-slide-btn book book-tech-btn" 
              data-id="${tech.id}" 
              data-name="${tech.username || 'Kỹ thuật viên'}" 
              data-phone="${tech.phone || ''}">
              <i class="fas fa-calendar-check"></i> Đặt lịch thợ
            </button>
          </div>
        </div>
      `;
    }).join('');

    section.innerHTML = `
      <div class="nearby-techs-header">
        <div class="nearby-techs-title">
          <h2><i class="fas fa-users-gear" style="color:var(--primary-color);"></i> Kỹ Thuật Viên Gần Bạn</h2>
          <p>Danh sách thợ giỏi tại <strong>${selectedLocation}</strong> - Phục vụ tận nơi 24/7 (Bấm vào thợ để xem chi tiết)</p>
        </div>
        <div class="tech-slider-controls">
          <button class="tech-slider-btn prev-btn" id="prevTechBtn" title="Xem thợ trước">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="tech-slider-btn next-btn" id="nextTechBtn" title="Xem thợ kế tiếp">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <div class="tech-slider-container" id="techSliderContainer">
        <div class="tech-slider-track" id="techSliderTrack">
          ${cardsHTML}
        </div>
      </div>
    `;

    // Attach Tech Card & "Chi tiết" button click to navigate to Technician Detail Page
    section.querySelectorAll('.tech-card-slide').forEach(card => {
      card.style.cursor = 'pointer';
      const techId = card.getAttribute('data-id');

      card.addEventListener('click', (e) => {
        // Only trigger navigation if not clicking the book button or a link
        if (e.target.closest('.book-tech-btn') || e.target.closest('a')) return;
        if (techId) {
                    window.location.hash = `/technician-detail?id=${techId}`;
        }
      });
    });

    // Attach Book Tech buttons
    section.querySelectorAll('.book-tech-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const phone = btn.getAttribute('data-phone');
        Toast.info(`Đang chuyển tới trang đặt lịch với thợ ${name}...`, 2000);
        setTimeout(() => {
          window.location.hash = `/booking?techId=${id}&techName=${encodeURIComponent(name)}&techPhone=${encodeURIComponent(phone)}`;
        }, 500);
      });
    });

    // Attach native smooth scroll & desktop mouse drag
    const prevBtn = section.querySelector('#prevTechBtn');
    const nextBtn = section.querySelector('#nextTechBtn');
    const sliderContainer = section.querySelector('#techSliderContainer');

    const updateArrowButtons = () => {
      if (!sliderContainer) return;
      const maxScroll = sliderContainer.scrollWidth - sliderContainer.clientWidth;
      if (prevBtn) prevBtn.disabled = sliderContainer.scrollLeft <= 5;
      if (nextBtn) nextBtn.disabled = sliderContainer.scrollLeft >= maxScroll - 5;
    };

    if (sliderContainer) {
      sliderContainer.addEventListener('scroll', updateArrowButtons);
      updateArrowButtons();

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          const cardWidth = sliderContainer.querySelector('.tech-card-slide')?.offsetWidth || 290;
          sliderContainer.scrollBy({ left: -(cardWidth + 16), behavior: 'smooth' });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const cardWidth = sliderContainer.querySelector('.tech-card-slide')?.offsetWidth || 290;
          sliderContainer.scrollBy({ left: cardWidth + 16, behavior: 'smooth' });
        });
      }

      // Physics Mouse Dragging for Desktop
      let isMouseDown = false;
      let startX = 0;
      let scrollLeftStart = 0;

      sliderContainer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isMouseDown = true;
        startX = e.pageX - sliderContainer.offsetLeft;
        scrollLeftStart = sliderContainer.scrollLeft;
      });

      const stopDrag = () => {
        if (!isMouseDown) return;
        isMouseDown = false;
        sliderContainer.classList.remove('active-dragging');
      };

      sliderContainer.addEventListener('mouseleave', stopDrag);
      sliderContainer.addEventListener('mouseup', stopDrag);

      sliderContainer.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        const x = e.pageX - sliderContainer.offsetLeft;
        const walk = Math.abs(x - startX);
        if (walk > 10) {
          sliderContainer.classList.add('active-dragging');
          e.preventDefault();
          sliderContainer.scrollLeft = scrollLeftStart - (x - startX) * 1.5;
        }
      });
    }
  };

  const updateLocationDisplay = (loc) => {
    selectedLocation = loc;
    const span = container.querySelector('#locationText');
    if (span) {
      span.textContent = loc;
    }
    loadNearbyTechnicians();
  };

  const openAddressSelectionModal = () => {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'address-modal-overlay';

    let selectedProvince = null;
    let searchTerm = '';

    const renderModalContent = () => {
      modalOverlay.innerHTML = `
        <div class="address-modal-card">
          <!-- Header -->
          <div class="address-modal-header">
            <h2>Chọn địa chỉ</h2>
            <button class="address-modal-close" id="closeAddrBtn">&times;</button>
          </div>

          <!-- Search Box -->
          <div class="address-search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="addrSearchInput" value="${searchTerm}" placeholder="Tìm kiếm vị trí..." />
          </div>

          <!-- Use Current Location Outlined Button (when no province selected) -->
          ${!selectedProvince ? `
            <button class="use-current-location-btn" id="addrUseGpsBtn">
              <i class="fas fa-crosshairs"></i> Sử dụng vị trí hiện tại
            </button>
          ` : ''}

          <!-- Selected Stepper Hierarchy (when province selected) -->
          ${selectedProvince ? `
            <div class="address-selected-hierarchy">
              <div class="hierarchy-header">
                <span class="hierarchy-title">Khu vực được chọn</span>
                <button class="hierarchy-reset-btn" id="addrResetBtn">Thiết lập lại</button>
              </div>
              <div class="stepper-tree">
                <div class="stepper-node">
                  <div class="stepper-icon-done"><i class="fas fa-check"></i></div>
                  <span class="stepper-label">${selectedProvince.name}</span>
                </div>
                <div class="stepper-line"></div>
                <div class="stepper-node">
                  <div class="stepper-icon-active"></div>
                  <span class="stepper-label placeholder">Chọn Phường/Xã</span>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Section Title -->
          <div class="address-section-title">
            ${selectedProvince ? 'Chọn Phường/Xã' : 'Chọn Tỉnh/Thành phố'}
          </div>

          <!-- Scrollable Item List -->
          <div class="address-items-list" id="addrItemsList">
          </div>
        </div>
      `;

      // Populate items
      const itemsList = modalOverlay.querySelector('#addrItemsList');
      const term = searchTerm.trim().toLowerCase();

      if (!selectedProvince) {
        // Show Provinces (search by province name or district name)
        let customRowHTML = '';
        if (searchTerm.trim().length > 0) {
          const safeTerm = searchTerm.trim().replace(/"/g, '&quot;');
          customRowHTML = `
            <div class="address-item-row custom-search-item" data-name="${safeTerm}" style="background:#fff7ed; color:#f97316; font-weight:600; border-bottom:1px solid #ffedd5; display:flex; align-items:center; gap:8px;">
              <i class="fas fa-location-dot"></i> Sử dụng vị trí tìm kiếm: "${safeTerm}"
            </div>
          `;
        }

        const filtered = PROVINCES_DATA.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.districts.some(d => d.toLowerCase().includes(term))
        );

        if (filtered.length === 0 && !term) {
          itemsList.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">Không tìm thấy tỉnh/thành phố phù hợp</div>`;
        } else {
          itemsList.innerHTML = customRowHTML + filtered.map(p => `
            <div class="address-item-row prov-item" data-name="${p.name}">${p.name}</div>
          `).join('');
        }
      } else {
        // Show Wards/Districts
        let customRowHTML = '';
        if (searchTerm.trim().length > 0) {
          const safeTerm = `${selectedProvince.name}, ${searchTerm.trim()}`.replace(/"/g, '&quot;');
          customRowHTML = `
            <div class="address-item-row custom-search-item" data-name="${safeTerm}" style="background:#fff7ed; color:#f97316; font-weight:600; border-bottom:1px solid #ffedd5; display:flex; align-items:center; gap:8px;">
              <i class="fas fa-location-dot"></i> Sử dụng vị trí tìm kiếm: "${safeTerm}"
            </div>
          `;
        }

        const filtered = selectedProvince.districts.filter(d => d.toLowerCase().includes(term));

        if (filtered.length === 0 && !term) {
          itemsList.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">Không tìm thấy phường/xã phù hợp</div>`;
        } else {
          itemsList.innerHTML = customRowHTML + filtered.map(d => `
            <div class="address-item-row dist-item" data-name="${d}">${d}</div>
          `).join('');
        }
      }

      // Attach internal event handlers
      const closeBtn = modalOverlay.querySelector('#closeAddrBtn');
      const searchInput = modalOverlay.querySelector('#addrSearchInput');
      const useGpsBtn = modalOverlay.querySelector('#addrUseGpsBtn');
      const resetBtn = modalOverlay.querySelector('#addrResetBtn');

      closeBtn?.addEventListener('click', () => modalOverlay.remove());

      searchInput?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderModalContent();
        const newSearchInput = modalOverlay.querySelector('#addrSearchInput');
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(searchTerm.length, searchTerm.length);
        }
      });

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          selectedProvince = null;
          searchTerm = '';
          renderModalContent();
        });
      }

      if (useGpsBtn) {
        useGpsBtn.addEventListener('click', async () => {
          useGpsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lấy vị trí...';
          useGpsBtn.disabled = true;
          try {
            const coords = await getUserLocation();
            const geoData = await reverseGeocode(coords.latitude, coords.longitude);
            const addr = geoData.address || {};
            let detectedDistrict = addr.city_district || addr.district || addr.suburb || addr.county || addr.town || addr.city || '';
            detectedDistrict = detectedDistrict.replace(/^(Quận|Huyện|Thành phố|Phường|Xã)\s+/i, '').trim();

            if (detectedDistrict) {
              updateLocationDisplay(detectedDistrict);
              Toast.success(`Đã tự động xác định vị trí: ${detectedDistrict}`, 3000);
              modalOverlay.remove();
            } else {
              Toast.warning("Không tìm thấy thông tin khu vực cụ thể từ GPS.", 2500);
            }
          } catch (err) {
            console.error("GPS Error:", err);
            Toast.error("Không thể lấy vị trí hiện tại. Vui lòng cho phép quyền định vị.", 3000);
          } finally {
            if (modalOverlay.isConnected) {
              useGpsBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Sử dụng vị trí hiện tại';
              useGpsBtn.disabled = false;
            }
          }
        });
      }

      // Item click handlers
      itemsList.querySelectorAll('.custom-search-item').forEach(item => {
        item.addEventListener('click', () => {
          const customLoc = item.getAttribute('data-name');
          if (customLoc) {
            updateLocationDisplay(customLoc);
            Toast.success(`Đã chọn địa chỉ: ${customLoc}`, 2500);
            modalOverlay.remove();
          }
        });
      });

      itemsList.querySelectorAll('.prov-item').forEach(item => {
        item.addEventListener('click', () => {
          const provName = item.getAttribute('data-name');
          selectedProvince = PROVINCES_DATA.find(p => p.name === provName);
          searchTerm = '';
          renderModalContent();
        });
      });

      itemsList.querySelectorAll('.dist-item').forEach(item => {
        item.addEventListener('click', () => {
          const distName = item.getAttribute('data-name');
          const finalLocation = `${selectedProvince.name}, ${distName}`;
          updateLocationDisplay(finalLocation);
          Toast.success(`Đã chọn địa chỉ: ${finalLocation}`, 2500);
          modalOverlay.remove();
        });
      });
    };

    renderModalContent();
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.remove();
    });
  };

  // Attach control card tab event handlers
  const attachHeaderEventListeners = () => {
    const catBtns = container.querySelectorAll('.category-tab-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-cat');
        renderServices();
      });
    });
  };

  // Attach sub-filters event handlers
  const attachSubFiltersEventListeners = () => {
    const subBtns = container.querySelectorAll('.sub-filter-btn');
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSubcategory = btn.getAttribute('data-sub');
        renderServices();
      });
    });
  };

  // SETUP EVENT HANDLERS AFTER DOM ATTACHED
  setTimeout(() => {
    // 1. Location selection click
    const locationSelector = container.querySelector('#locationSelector');
    if (locationSelector) {
      locationSelector.addEventListener('click', () => {
        openAddressSelectionModal();
      });
    }

    // 2. Main category tabs navigation
    attachHeaderEventListeners();

    // 3. Subcategory horizontal filters
    attachSubFiltersEventListeners();

    // 4. Admin Toolbar buttons (Only for admin)
    if (isAccountAdmin) {
      const attachAdminEvents = () => {
        container.querySelector('#addServiceBtn')?.addEventListener('click', () => openServiceModal(null));
        container.querySelector('#manageCategoriesBtn')?.addEventListener('click', () => openCategoryManagementModal());
        const toggleBtn = container.querySelector('#toggleAdminModeBtn');
        if (toggleBtn) {
          toggleBtn.onclick = () => {
            isAdminMode = !isAdminMode;
            localStorage.setItem('services_admin_mode', isAdminMode ? 'true' : 'false');
            renderAdminToolbar();
            attachAdminEvents();
            renderServices();
            Toast.info(`Chế độ Admin hiện đang: ${isAdminMode ? 'BẬT' : 'TẮT'}`, 2000);
          };
        }
      };
      attachAdminEvents();
    }

    // 5. Cart drawer trigger
    const cartIconBtn = container.querySelector('#cartIconBtn');
    const closeCartBtn = container.querySelector('#closeCartBtn');
    const cartOverlayEl = container.querySelector('#cartOverlay');

    if (cartIconBtn) {
      cartIconBtn.addEventListener('click', () => toggleCartDrawer(true));
    }
    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => toggleCartDrawer(false));
    }
    if (cartOverlayEl) {
      cartOverlayEl.addEventListener('click', () => toggleCartDrawer(false));
    }

    // 6. Checkout click (Book selected services)
    const checkoutBtn = container.querySelector('#cartCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
          Toast.error("Vui lòng chọn ít nhất một dịch vụ kỹ thuật trước khi đặt lịch!", 3000);
          return;
        }

        const names = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
        const serviceString = `Báo giá dịch vụ: ${names} - Tổng tạm tính: ${formatVND(cart.reduce((acc, item) => acc + (item.price * item.quantity), 0))} (Khu vực: ${selectedLocation})`;

        toggleCartDrawer(false);
        Toast.info("Đang chuyển tiếp thông tin sang trang đăng ký đặt lịch...", 2000);

        setTimeout(() => {
          window.location.hash = `/booking?service_id=6&service_name=${encodeURIComponent(serviceString)}`;
        }, 1200);
      });
    }

    // Search Section Event Listeners
    const searchInput = container.querySelector('#quoteSearchInput');
    const searchClearBtn = container.querySelector('#quoteSearchClearBtn');

    // Smooth scroll down to search results section
    const scrollToResults = () => {
      setTimeout(() => {
        const target = container.querySelector('#quoteSearchBanner') || container.querySelector('.quote-control-card') || container.querySelector('#servicesGrid');
        if (target) {
          const headerHeight = 80;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
          });
        }
      }, 60);
    };

    let searchDebounceTimer = null;

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClearBtn) {
          searchClearBtn.style.display = searchQuery.trim() ? 'flex' : 'none';
        }
        renderServices();

        clearTimeout(searchDebounceTimer);
        if (searchQuery.trim()) {
          searchDebounceTimer = setTimeout(() => {
            scrollToResults();
          }, 600);
        }
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          clearTimeout(searchDebounceTimer);
          renderServices();
          scrollToResults();
        }
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        searchClearBtn.style.display = 'none';
        renderServices();
      });
    }

    container.querySelectorAll('.search-tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const keyword = chip.getAttribute('data-keyword');
        if (keyword) {
          searchQuery = keyword;
          if (searchInput) searchInput.value = keyword;
          if (searchClearBtn) searchClearBtn.style.display = 'flex';
          renderServices();
          scrollToResults();
        }
      });
    });

    // Trigger initial render of data
    updateCartCountBadge();
    renderCartItems();
    renderServices();
    loadNearbyTechnicians();

    // Auto-scroll if initial searchQuery was present (e.g., from URL)
    if (searchQuery.trim()) {
      scrollToResults();
    }

  }, 100);

  return container;
}
