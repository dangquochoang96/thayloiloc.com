import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { getImageUrl } from "../utils/helpers.js";
import { SupportService } from "../services/support.service.js";
import { getUserLocation, watchUserLocation, clearLocationWatch, calculateDistance } from "../utils/geohash.js";
import { geocodeAddress } from "../utils/geocoding.js";
import "../styles/hotline/hotline-page.css";

export function HotlinePage() {
  const container = document.createElement("div");
  container.appendChild(Header());

  const page = document.createElement("main");
  page.className = "hotline-page";

  const main = document.createElement("div");
  main.className = "hotline-main";

  const containerDiv = document.createElement("div");
  containerDiv.className = "container";

  // Page header
  const pageHeader = document.createElement("div");
  pageHeader.className = "page-header";
  pageHeader.innerHTML = `
    <h1><i class="fas fa-phone-volume"></i> Liên Hệ Hotline</h1>
    <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
    <div class="breadcrumb">
      <a href="#/">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <span>Hotline</span>
    </div>
  `;
  containerDiv.appendChild(pageHeader);

  // Hotline content
  const hotlineContent = document.createElement("div");
  hotlineContent.className = "hotline-content";
  hotlineContent.innerHTML = `
    <div class="technicians-section">
      <div class="section-header">
        <h2><i class="fas fa-users-cog"></i> Kỹ Thuật Viên Hỗ Trợ</h2>
        <div class="header-actions">
          <button id="refreshTechnicians" class="refresh-btn" title="Làm mới danh sách">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button id="findNearbyBtn" class="find-nearby-btn">
            <i class="fas fa-map-marker-alt"></i>
            Tìm thợ gần tôi
          </button>
        </div>
      </div>
      
      <div id="locationStatus" class="location-status" style="display: none;"></div>

      <div class="technicians-filters">
        <div class="filter-item">
          <i class="fas fa-user"></i>
          <input 
            type="text" 
            id="filterName" 
            placeholder="Tìm theo tên..."
            class="filter-input"
          />
        </div>
        <div class="filter-item">
          <i class="fas fa-phone"></i>
          <input 
            type="text" 
            id="filterPhone" 
            placeholder="Tìm theo số điện thoại..."
            class="filter-input"
          />
        </div>
        <div class="filter-item">
          <i class="fas fa-map-marker-alt"></i>
          <input 
            type="text" 
            id="filterAddress" 
            placeholder="Tìm theo địa chỉ..."
            class="filter-input"
          />
        </div>
        <button id="clearFilters" class="clear-filters-btn">
          <i class="fas fa-times"></i>
          Xóa bộ lọc
        </button>
      </div>

      <div id="techniciansLoading" class="loading-spinner" style="display: none;">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải danh sách kỹ thuật viên...</p>
      </div>
      <div id="techniciansGrid" class="technicians-grid">
        <!-- Danh sách kỹ thuật viên sẽ được load -->
      </div>
      <div id="paginationContainer" class="pagination-container" style="display: none;">
        <!-- Pagination sẽ được render ở đây -->
      </div>
    </div>

    <div class="working-hours">
      <h2><i class="fas fa-clock"></i> Giờ Làm Việc</h2>
      <div class="hours-grid">
        <div class="hours-item">
          <i class="fas fa-calendar-day"></i>
          <div>
            <strong>Thứ 2 - Thứ 6</strong>
            <p>8:00 - 18:00</p>
          </div>
        </div>
        <div class="hours-item">
          <i class="fas fa-calendar-week"></i>
          <div>
            <strong>Thứ 7 - Chủ Nhật</strong>
            <p>8:00 - 17:00</p>
          </div>
        </div>
        <div class="hours-item emergency">
          <i class="fas fa-exclamation-circle"></i>
          <div>
            <strong>Khẩn Cấp 24/7</strong>
            <p>Luôn sẵn sàng hỗ trợ</p>
          </div>
        </div>
      </div>
    </div>

    <div class="contact-info">
      <h2><i class="fas fa-map-marker-alt"></i> Địa Chỉ Văn Phòng</h2>
      <div class="info-grid">
        <div class="info-item">
          <i class="fas fa-building"></i>
          <div>
            <strong>Trụ sở chính</strong>
            <p>179 Đường Phùng Hưng, Phúc La, Hà Đông, Hà Nội</p>
          </div>
        </div>
        <div class="info-item">
          <i class="fas fa-map-marked-alt"></i>
          <div>
            <strong>Chi nhánh miền Nam</strong>
            <p>Số 178 đường Nguyễn Trãi, kp Thống Nhất 1, P Dĩ An, Tp Dĩ An, Bình Dương</p>
          </div>
        </div>
      </div>
    </div>
  `;
  containerDiv.appendChild(hotlineContent);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  // Store cleanup function
  let cleanupFn = null;

  // Initialize after DOM is ready
  setTimeout(() => {
    cleanupFn = initializeTechnicians();
  }, 100);

  // Add cleanup on page unload
  container._cleanup = () => {
    if (cleanupFn && typeof cleanupFn === 'function') {
      cleanupFn();
    }
  };

  return container;
}

// Load rating data cho tất cả kỹ thuật viên (trả về data thay vì update UI)
async function loadAllTechniciansRatingData(technicians) {
  try {
    // Gọi tất cả API cùng lúc
    const ratingPromises = technicians.map(tech => 
      SupportService.getListOrderRating(tech.id)
        .then(data => ({
          techId: tech.id,
          reviews: data.data || data || []
        }))
        .catch(error => {
          console.error(`Error loading rating for tech ${tech.id}:`, error);
          return {
            techId: tech.id,
            reviews: []
          };
        })
    );
    
    // Đợi tất cả API hoàn thành
    const results = await Promise.all(ratingPromises);
    
    // Tạo object chứa rating info cho từng thợ
    const ratingsData = {};
    results.forEach(result => {
      if (result.reviews.length > 0) {
        const avgRating = result.reviews.reduce((sum, r) => sum + (parseInt(r.rate) || 0), 0) / result.reviews.length;
        const roundedRating = Math.round(avgRating * 10) / 10;
        
        ratingsData[result.techId] = {
          avgRating: roundedRating,
          count: result.reviews.length
        };
      } else {
        ratingsData[result.techId] = {
          avgRating: 0,
          count: 0
        };
      }
    });
    
    return ratingsData;
  } catch (error) {
    console.error('Error loading all ratings:', error);
    return {};
  }
}

// Load rating cho kỹ thuật viên (deprecated - dùng loadAllTechniciansRating thay thế)
function loadTechnicianRating(techId) {
  const ratingEl = document.querySelector(`.tech-rating-display[data-tech-id="${techId}"]`);
  if (!ratingEl) return;

  SupportService.getListOrderRating(techId)
    .then((data) => {
      const reviews = data.data || data || [];
      
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + (parseInt(r.rate) || 0), 0) / reviews.length;
        const roundedRating = Math.round(avgRating * 10) / 10;
        
        ratingEl.innerHTML = `
          <div class="tech-rating-stars">
            ${renderStars(avgRating)}
          </div>
          <span class="tech-rating-text">${roundedRating} (${reviews.length})</span>
        `;
      } else {
        ratingEl.innerHTML = `
          <div class="tech-rating-stars">
            ${renderStars(0)}
          </div>
          <span class="tech-rating-text">Chưa có đánh giá</span>
        `;
      }
    })
    .catch((error) => {
      console.error(`Error loading rating for tech ${techId}:`, error);
      ratingEl.innerHTML = `
        <div class="tech-rating-stars">
          ${renderStars(0)}
        </div>
        <span class="tech-rating-text">Chưa có đánh giá</span>
      `;
    });
}

// Render stars
function renderStars(rating) {
  const numRating = Number(rating) || 0;
  const fullStars = Math.floor(numRating);
  const hasHalf = (numRating % 1) >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  let html = "";
  
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  
  if (hasHalf) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }
  
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star"></i>';
  }
  
  return html;
}

// Format phone number function
function formatPhoneNumber(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.$3");
  }
  return phone;
}

// Initialize technicians functionality
function initializeTechnicians() {
  const loadingEl = document.getElementById("techniciansLoading");
  const gridEl = document.getElementById("techniciansGrid");
  const filterName = document.getElementById("filterName");
  const filterPhone = document.getElementById("filterPhone");
  const filterAddress = document.getElementById("filterAddress");
  const clearFiltersBtn = document.getElementById("clearFilters");
  const findNearbyBtn = document.getElementById("findNearbyBtn");
  const locationStatus = document.getElementById("locationStatus");
  const refreshBtn = document.getElementById("refreshTechnicians");

  if (!loadingEl || !gridEl) return;

  let allTechnicians = []; // Dùng cho nearby mode
  let ratingsData = {};
  let userLocation = null;
  let nearbyMode = false;
  let locationWatchId = null;
  let currentPage = 1;
  const itemsPerPage = 9;
  let currentFilters = { name: '', phone: '', address: '' }; // Lưu filters hiện tại
  let totalPages = 1;
  let totalItems = 0;
  let searchTimeout = null; // Debounce search

  // Geocode technicians in background
  async function geocodeTechniciansInBackground(technicians) {
    for (let i = 0; i < technicians.length; i++) {
      const tech = technicians[i];
      
      if (tech.address && !tech.geocoded) {
        try {
          const coords = await geocodeAddress(tech.address);
          
          // Update the technician in allTechnicians array
          const index = allTechnicians.findIndex(t => t.id === tech.id);
          if (index !== -1) {
            allTechnicians[index] = {
              ...allTechnicians[index],
              latitude: coords.latitude,
              longitude: coords.longitude,
              geocoded: true
            };
            
            // If in nearby mode, update the list
            if (nearbyMode && userLocation) {
              updateNearbyTechnicians();
            }
          }
        } catch (error) {
          // Mark as failed to avoid retrying
          const index = allTechnicians.findIndex(t => t.id === tech.id);
          if (index !== -1) {
            allTechnicians[index] = {
              ...allTechnicians[index],
              geocoded: false,
              geocodeFailed: true
            };
          }
        }
        
        // Shorter wait time: 500ms instead of 1000ms
        if (i < technicians.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  }

  // Filter technicians function - now uses API search
  function filterTechnicians() {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Debounce search by 500ms
    searchTimeout = setTimeout(() => {
      currentFilters = {
        name: filterName.value.trim(),
        phone: filterPhone.value.trim(),
        address: filterAddress.value.trim()
      };

      currentPage = 1; // Reset về trang 1 khi filter
      loadTechnicians();
    }, 500);
  }

  // Render pagination
  function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'flex';
    
    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    paginationHTML += `
      <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
              data-page="${currentPage - 1}" 
              ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
      paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span class="pagination-dots">...</span>`;
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                data-page="${i}">
          ${i}
        </button>
      `;
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="pagination-dots">...</span>`;
      }
      paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    // Next button
    paginationHTML += `
      <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
              data-page="${currentPage + 1}"
              ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
    
    paginationHTML += '</div>';
    paginationHTML += `<div class="pagination-info">Trang ${currentPage} / ${totalPages} (${totalItems} thợ)</div>`;
    
    paginationContainer.innerHTML = paginationHTML;
    
    // Add click events
    paginationContainer.querySelectorAll('.pagination-btn:not(.disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          currentPage = page;
          
          if (nearbyMode) {
            // Re-render nearby mode with new page
            updateNearbyTechnicians();
          } else {
            // Load new page from API
            loadTechnicians();
          }
          
          // Scroll to top of technicians section
          document.querySelector('.technicians-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Render technicians function
  function renderTechnicians(technicians) {
    if (technicians.length === 0) {
      gridEl.innerHTML = `
        <div class="no-technicians">
          <i class="fas fa-user-slash"></i>
          <p>Không tìm thấy kỹ thuật viên phù hợp</p>
        </div>
      `;
      document.getElementById('paginationContainer').style.display = 'none';
      return;
    }

    // No need to paginate here - API already returns paginated data
    // Find the nearest technician if in nearby mode
    const nearestTech = nearbyMode && technicians.length > 0 ? technicians[0] : null;

    gridEl.innerHTML = technicians
      .map((tech, index) => {
        const ratingInfo = ratingsData[tech.id] || { avgRating: 0, count: 0 };
        const ratingHTML = ratingInfo.count > 0
          ? `
            <div class="tech-rating-stars">
              ${renderStars(ratingInfo.avgRating)}
            </div>
            <span class="tech-rating-text">${ratingInfo.avgRating} (${ratingInfo.count})</span>
          `
          : `
            <div class="tech-rating-stars">
              ${renderStars(0)}
            </div>
            <span class="tech-rating-text">Chưa có đánh giá</span>
          `;

        // Show distance if in nearby mode
        const distanceHTML = tech.distance !== undefined
          ? `<div class="tech-distance">
              <i class="fas fa-route"></i>
              <span>${tech.distance.toFixed(1)} km</span>
            </div>`
          : '';

        // Add recommended badge for nearest technician
        const isNearest = nearestTech && tech.id === nearestTech.id;
        const recommendedBadge = isNearest
          ? `<div class="recommended-badge">
              <i class="fas fa-star"></i>
              <span>Đề xuất gần nhất</span>
            </div>`
          : '';

        const cardClass = isNearest ? 'technician-card active nearest-tech' : 'technician-card active';

        return `
        <div class="${cardClass}" data-tech='${JSON.stringify(
          tech
        )}' data-tech-id="${tech.id}">
          ${recommendedBadge}
          <div class="tech-avatar">
            ${
              tech.avartar
                ? `<img src="${getImageUrl(tech.avartar)}" alt="${
                    tech.username
                  }">`
                : `<i class="fas fa-user-cog"></i>`
            }
          </div>
          <div class="tech-info">
            <h3>${tech.username}</h3>
            ${distanceHTML}
            <div class="tech-rating-display" data-tech-id="${tech.id}">
              ${ratingHTML}
            </div>
            <div class="tech-phone-display">
              <i class="fas fa-phone"></i>
              <span>${formatPhoneNumber(tech.phone)}</span>
            </div>
          </div>
          <div class="tech-contact">
            <div class="tech-actions">
              <a href="tel:${
                tech.phone
              }" class="action-btn call-btn" onclick="event.stopPropagation()">
                <i class="fas fa-phone"></i>
                Gọi ngay
              </a>
              <a href="sms:${
                tech.phone
              }" class="action-btn sms-btn" onclick="event.stopPropagation()">
                <i class="fas fa-sms"></i>
                Nhắn tin
              </a>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    // Add click event to show detail
    gridEl.querySelectorAll(".technician-card").forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const tech = JSON.parse(card.dataset.tech);
        window.location.hash = `/technician-detail?id=${tech.id}`;
      });
    });

    // Render pagination
    renderPagination();
  }

  // Find nearby technicians
  async function findNearbyTechnicians() {
    try {
      findNearbyBtn.disabled = true;
      findNearbyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lấy vị trí...';
      locationStatus.style.display = 'block';
      locationStatus.className = 'location-status loading';
      locationStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xác định vị trí của bạn...';

      // Get initial user location
      userLocation = await getUserLocation();

      locationStatus.className = 'location-status loading';
      locationStatus.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang tải danh sách thợ...`;

      // Load all technicians for nearby mode
      const data = await SupportService.getAllSupportTechnicians();
      allTechnicians = (data.data || []).map(tech => ({
        ...tech,
        geocoded: false
      }));

      // Load ratings for all technicians
      ratingsData = await loadAllTechniciansRatingData(allTechnicians);

      locationStatus.className = 'location-status success';
      locationStatus.innerHTML = `<i class="fas fa-check-circle"></i> Đã xác định vị trí của bạn - Đang theo dõi di chuyển...`;

      nearbyMode = true;
      findNearbyBtn.innerHTML = '<i class="fas fa-list"></i> Hiện tất cả';
      findNearbyBtn.disabled = false;

      // Update technicians list based on current location
      updateNearbyTechnicians();

      // Geocode in background
      geocodeTechniciansInBackground(allTechnicians);

      // Start watching location changes
      locationWatchId = watchUserLocation(
        (newLocation) => {
          // Check if location changed significantly (more than 100 meters)
          const distanceMoved = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            newLocation.latitude,
            newLocation.longitude
          );

          if (distanceMoved > 0.1) { // 100 meters
            userLocation = newLocation;
            locationStatus.className = 'location-status success';
            locationStatus.innerHTML = `<i class="fas fa-location-arrow"></i> Vị trí đã cập nhật - Đang tìm thợ gần bạn...`;
            
            // Update technicians list
            updateNearbyTechnicians();
          }
        },
        (error) => {
          console.error('Error watching location:', error);
          locationStatus.className = 'location-status warning';
          locationStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Không thể theo dõi vị trí: ${error.message}`;
        }
      );

    } catch (error) {
      console.error('Error finding nearby technicians:', error);
      locationStatus.className = 'location-status error';
      locationStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
      findNearbyBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Tìm thợ gần tôi';
      findNearbyBtn.disabled = false;
    }
  }

  // Update nearby technicians based on current location
  function updateNearbyTechnicians() {
    if (!userLocation) return;

    locationStatus.className = 'location-status loading';
    locationStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tính toán khoảng cách...';

    // Calculate distance for all technicians
    const techniciansWithDistance = allTechnicians.map(tech => {
      // Use real coordinates if available
      if (!tech.latitude || !tech.longitude) {
        return null;
      }
      
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        tech.latitude,
        tech.longitude
      );

      return {
        ...tech,
        distance
      };
    }).filter(tech => tech !== null);

    // Count technicians without coordinates
    const withoutCoords = allTechnicians.filter(t => !t.latitude || !t.longitude);
    
    // Sort by distance
    techniciansWithDistance.sort((a, b) => a.distance - b.distance);

    // Debug: Log all technicians with distance
    console.log('=== NEARBY TECHNICIANS DEBUG ===');
    console.log('User location:', userLocation);
    console.log('Technicians with coordinates:', techniciansWithDistance.length);
    console.log('Technicians without coordinates:', withoutCoords.length);
    techniciansWithDistance.forEach(tech => {
      console.log(`${tech.username}: ${tech.distance.toFixed(2)} km - ${tech.address || 'No address'}`);
    });
    if (withoutCoords.length > 0) {
      console.log('Without coords:', withoutCoords.map(t => `${t.username} (${t.address || 'No address'})`).join(', '));
    }
    console.log('================================');

    // Show only technicians within 10km
    const nearbyTechs = techniciansWithDistance.filter(tech => tech.distance <= 10);

    if (nearbyTechs.length === 0) {
      locationStatus.className = 'location-status warning';
      let message = '<i class="fas fa-exclamation-triangle"></i> Không tìm thấy thợ trong bán kính 10km';
      if (withoutCoords.length > 0) {
        message += `<br><small>${withoutCoords.length} thợ chưa có tọa độ (đang xử lý...)</small>`;
      }
      if (techniciansWithDistance.length > 0) {
        const nearest = techniciansWithDistance[0];
        message += `<br><small>Thợ gần nhất: ${nearest.username} (${nearest.distance.toFixed(1)} km)</small>`;
      }
      locationStatus.innerHTML = message;
      renderTechnicians([]);
    } else {
      locationStatus.className = 'location-status success';
      let message = `<i class="fas fa-map-marker-alt"></i> Tìm thấy ${nearbyTechs.length} thợ gần bạn (trong bán kính 10km)`;
      if (withoutCoords.length > 0) {
        message += `<br><small>${withoutCoords.length} thợ khác đang được xử lý...</small>`;
      }
      locationStatus.innerHTML = message;
      
      // Update pagination for nearby mode
      totalItems = nearbyTechs.length;
      totalPages = Math.ceil(totalItems / itemsPerPage);
      
      // Paginate nearby techs
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedNearbyTechs = nearbyTechs.slice(startIndex, endIndex);
      
      renderTechnicians(paginatedNearbyTechs);
    }
  }

  // Toggle nearby mode
  function toggleNearbyMode() {
    if (nearbyMode) {
      // Reset to show all
      nearbyMode = false;
      userLocation = null;
      currentPage = 1; // Reset về trang 1
      allTechnicians = []; // Clear all technicians
      
      // Stop watching location
      if (locationWatchId !== null) {
        clearLocationWatch(locationWatchId);
        locationWatchId = null;
      }
      
      findNearbyBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Tìm thợ gần tôi';
      locationStatus.style.display = 'none';
      
      // Reload with API pagination
      loadTechnicians();
    } else {
      // Find nearby
      currentPage = 1; // Reset về trang 1
      findNearbyTechnicians();
    }
  }

  // Load technicians function - now with API pagination and search
  async function loadTechnicians() {
    // Skip if in nearby mode
    if (nearbyMode) return;

    loadingEl.style.display = "block";
    gridEl.innerHTML = "";

    try {
      // Show initial loading
      loadingEl.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải danh sách kỹ thuật viên...</p>
      `;

      // Call API with pagination and filters
      const data = await SupportService.getSupportTechnicians(currentPage, currentFilters);
      let technicians = data.data || [];

      // Update pagination info
      totalPages = data.last_page || 1;
      totalItems = data.total || 0;

      if (technicians.length === 0) {
        loadingEl.style.display = "none";
        gridEl.innerHTML = `
          <div class="no-technicians">
            <i class="fas fa-user-slash"></i>
            <p>Không có kỹ thuật viên nào</p>
          </div>
        `;
        document.getElementById('paginationContainer').style.display = 'none';
        return;
      }

      // Load ratings for current page
      loadingEl.innerHTML = `
        <i class="fas fa-star fa-spin"></i>
        <p>Đang tải đánh giá...</p>
      `;

      ratingsData = await loadAllTechniciansRatingData(technicians);

      // Hide loading and render
      loadingEl.style.display = "none";
      renderTechnicians(technicians);

      // Geocode in background for nearby feature
      geocodeTechniciansInBackground(technicians);
    } catch (error) {
      console.error("Lỗi khi tải danh sách kỹ thuật viên:", error);
      loadingEl.style.display = "none";
      
      // Check if it's a rate limit error
      const isRateLimit = error.message && error.message.includes('Too Many Requests');
      
      gridEl.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${isRateLimit ? 'Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.' : 'Không thể tải danh sách kỹ thuật viên'}</p>
          <button class="retry-btn">
            <i class="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      `;
      document.getElementById('paginationContainer').style.display = 'none';
    }
  }

  // Event delegation for retry button
  document.addEventListener("click", (e) => {
    if (e.target.closest(".retry-btn")) {
      loadTechnicians();
    }
  });

  // Filter event listeners
  if (filterName) {
    filterName.addEventListener("input", filterTechnicians);
  }
  if (filterPhone) {
    filterPhone.addEventListener("input", filterTechnicians);
  }
  if (filterAddress) {
    filterAddress.addEventListener("input", filterTechnicians);
  }

  // Clear filters button
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      filterName.value = "";
      filterPhone.value = "";
      filterAddress.value = "";
      currentPage = 1; // Reset về trang 1
      currentFilters = { name: '', phone: '', address: '' }; // Reset filters
      
      if (nearbyMode) {
        // Keep nearby mode active but recalculate
        updateNearbyTechnicians();
      } else {
        loadTechnicians();
      }
    });
  }

  // Find nearby button
  if (findNearbyBtn) {
    findNearbyBtn.addEventListener("click", toggleNearbyMode);
  }

  // Refresh button
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
      
      try {
        if (nearbyMode) {
          // Reload all technicians for nearby mode
          const data = await SupportService.getAllSupportTechnicians(true);
          allTechnicians = (data.data || []).map(tech => ({
            ...tech,
            geocoded: false
          }));
          ratingsData = await loadAllTechniciansRatingData(allTechnicians);
          updateNearbyTechnicians();
          geocodeTechniciansInBackground(allTechnicians);
        } else {
          // Reload current page
          await loadTechnicians();
        }
      } catch (error) {
        console.error('Error refreshing:', error);
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
      }
    });
  }

  // Load all technicians
  loadTechnicians();

  // Cleanup when leaving page
  return () => {
    if (locationWatchId !== null) {
      clearLocationWatch(locationWatchId);
      locationWatchId = null;
    }
  };

  // Show technician detail modal
  function showTechnicianDetail(tech) {
    // Remove existing modal
    const existingModal = document.querySelector(".tech-modal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.className = "tech-modal";
    modal.innerHTML = `
      <div class="tech-modal-overlay"></div>
      <div class="tech-modal-content">
        <button class="tech-modal-close">
          <i class="fas fa-times"></i>
        </button>
        <div class="tech-modal-header">
          <div class="tech-modal-avatar">
            ${
              tech.avartar
                ? `<img src="${getImageUrl(tech.avartar)}" alt="${
                    tech.username
                  }">`
                : `<i class="fas fa-user-cog"></i>`
            }
          </div>
          <h2>${tech.username}</h2>
        </div>
        <div class="tech-modal-body">
          <div class="tech-detail-item">
            <i class="fas fa-id-badge"></i>
            <div>
              <span class="label">Mã nhân viên</span>
              <span class="value">#${tech.id}</span>
            </div>
          </div>
          <div class="tech-detail-item">
            <i class="fas fa-phone"></i>
            <div>
              <span class="label">Số điện thoại</span>
              <span class="value">${formatPhoneNumber(tech.phone)}</span>
            </div>
          </div>
          <div class="tech-detail-item">
            <i class="fas fa-circle" style="color: #22c55e; font-size: 0.8rem;"></i>
            <div>
              <span class="label">Trạng thái</span>
              <span class="value">Đang hoạt động</span>
            </div>
          </div>
        </div>
        <div class="tech-modal-actions">
          <a href="tel:${tech.phone}" class="modal-btn call-btn">
            <i class="fas fa-phone"></i>
            Gọi ngay
          </a>
          <a href="sms:${tech.phone}" class="modal-btn sms-btn">
            <i class="fas fa-sms"></i>
            Nhắn tin
          </a>
          <a href="https://zalo.me/${
            tech.phone
          }" target="_blank" class="modal-btn zalo-btn">
            <i class="fas fa-comment-dots"></i>
            Zalo
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal events
    modal
      .querySelector(".tech-modal-overlay")
      .addEventListener("click", () => modal.remove());
    modal
      .querySelector(".tech-modal-close")
      .addEventListener("click", () => modal.remove());
    document.addEventListener("keydown", function closeOnEsc(e) {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", closeOnEsc);
      }
    });
  }
}
