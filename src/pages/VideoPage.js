import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { videoService } from "../services/video.service.js";
import { getImageUrl, formatDate, truncateText } from "../utils/helpers.js";
import { navigateTo } from "../utils/navigation.js";

// Import CSS styles
import "../styles/news/video-page.css";

export function VideoPage() {
  const container = document.createElement("div");

  const header = Header();
  container.appendChild(header);

  const main = document.createElement("main");
  main.className = "video-page";

  // Page Header
  const pageHeader = document.createElement("div");
  pageHeader.className = "page-header";
  pageHeader.innerHTML = `
    <h1><i class="fas fa-play-circle"></i> Video Hướng Dẫn</h1>
    <p>Xem các video hướng dẫn sử dụng sản phẩm và dịch vụ</p>
    <div class="breadcrumb">
      <a href="#/" onclick="event.preventDefault(); navigateTo('/')">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <span>Video</span>
    </div>
  `;
  main.appendChild(pageHeader);

  // Video Content
  const videoContent = document.createElement("section");
  videoContent.className = "video-content";
  videoContent.innerHTML = `
    <div class="container">
      <!-- Filter Section -->
      <div class="video-filters">
        <div class="search-box">
          <input type="text" id="videoSearch" placeholder="Tìm kiếm video...">
          <i class="fas fa-search"></i>
        </div>
      </div>

      <!-- Loading State -->
      <div id="videoLoading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải video từ API...</p>
      </div>

      <!-- Video Grid -->
      <div class="video-grid" id="videoGrid" style="display:none;">
        <!-- Video items will be loaded here -->
      </div>

      <!-- Pagination -->
      <div class="pagination-section" id="paginationSection" style="display:none;">
        <div class="pagination-info">
          <span id="paginationInfo">Trang 1 / 1</span>
        </div>
        <div class="pagination-controls">
          <button class="pagination-btn prev-btn" id="prevPageBtn" onclick="goToPreviousPage()">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="pagination-numbers" id="paginationNumbers">
            <!-- Page numbers will be generated here -->
          </div>
          <button class="pagination-btn next-btn" id="nextPageBtn" onclick="goToNextPage()">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- No Results -->
      <div class="no-results" id="noResults" style="display:none;">
        <i class="fas fa-video"></i>
        <h3>Không tìm thấy video</h3>
        <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    </div>
  `;
  main.appendChild(videoContent);

  container.appendChild(main);
  container.appendChild(Footer());

  // Initialize page functionality
  initializeVideoPage();

  return container;
}

let currentPage = 1;
let currentCategory = "all";
let currentSearch = "";
let allVideos = []; // Chứa tất cả video từ API
let filteredVideos = [];
let totalPages = 1;
let isLoading = false;
let isDataLoaded = false; // Flag để biết đã load data chưa
let itemsPerPage = 9; // 9 videos per page for pagination
let showAllMode = false; // Flag để hiển thị tất cả video

function initializeVideoPage() {
  // Reset state
  currentPage = 1;
  currentCategory = "all";
  currentSearch = "";
  allVideos = [];
  filteredVideos = [];
  isLoading = false;
  isDataLoaded = false;
  
  // Show loading state
  showLoadingState();
  
  // Setup functionality
  setupSearch();
  setupCategoryFilters();
  setupResponsiveHandlers();

  // Load all videos from API
  loadAllVideosFromAPI();
}

function setupResponsiveHandlers() {
  // Handle window resize for responsive grid
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (isDataLoaded) {
        filterAndPaginateVideos();
      }
    }, 250);
  });
}

function showLoadingState() {
  const videoLoading = document.getElementById("videoLoading");
  const videoGrid = document.getElementById("videoGrid");
  const paginationSection = document.getElementById("paginationSection");
  
  if (videoLoading) videoLoading.style.display = "flex";
  if (videoGrid) videoGrid.style.display = "none";
  if (paginationSection) paginationSection.style.display = "none";
}

function hideLoadingState() {
  const videoLoading = document.getElementById("videoLoading");
  if (videoLoading) videoLoading.style.display = "none";
}

function loadAllVideosFromAPI() {
  if (isLoading) return;

  isLoading = true;

  videoService.getAllVideos()
    .then((result) => {
      const processedVideos = (result.data || []).map((item, index) => ({
        id: item.id || `api-video-${index}`,
        title: item.name || item.title || `Video ${index + 1}`,
        thumbnail: videoService.getYoutubeThumbnail(item.link),
        video_url: videoService.convertToEmbedUrl(item.link),
        youtube_url: item.link,
        duration: "N/A",
        category: "general",
        created_at: item.created_at || new Date().toISOString(),
        views: Math.floor(Math.random() * 5000) + 100
      }));

      if (processedVideos.length > 0) {
        allVideos = processedVideos;
        isDataLoaded = true;
        currentPage = 1;
        
        hideLoadingState();
        filterAndPaginateVideos();
      } else {
        showNoResults();
      }

      isLoading = false;
    })
    .catch((error) => {
      showNoResults();
      isLoading = false;
    });
}

function loadVideoPage(page = 1) {
  if (!isDataLoaded) {
    initializeVideoPage();
    return;
  }

  currentPage = page;
  filterAndPaginateVideos();
}

function setupSearch() {
  const searchInput = document.getElementById("videoSearch");
  if (!searchInput) {
    setTimeout(setupSearch, 200);
    return;
  }

  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value.toLowerCase().trim();
      currentPage = 1; // Reset to page 1 when searching
      filterAndPaginateVideos();
    }, 300);
  });
}

function setupCategoryFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove("active"));
      // Add active class to clicked button
      e.target.classList.add("active");
      
      currentCategory = e.target.dataset.category;
      filterAndPaginateVideos();
    });
  });
}

function filterAndPaginateVideos() {
  if (!allVideos || allVideos.length === 0) {
    showNoResults();
    return;
  }

  // Filter videos
  filteredVideos = allVideos.filter((item) => {
    const categoryMatch = currentCategory === "all" || item.category === currentCategory;
    const searchMatch = !currentSearch ||
      item.title.toLowerCase().includes(currentSearch) ||
      item.description.toLowerCase().includes(currentSearch);
    return categoryMatch && searchMatch;
  });

  if (filteredVideos.length === 0) {
    showNoResults();
    return;
  }

  // If in show all mode, display all videos without pagination
  if (showAllMode) {
    displayVideos(filteredVideos);
    hidePagination();
    return;
  }

  // Calculate pagination (9 videos per page)
  totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  if (currentPage > totalPages) {
    currentPage = Math.max(1, totalPages);
  }

  // Get videos for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const videosForCurrentPage = filteredVideos.slice(startIndex, endIndex);

  // Display
  displayVideos(videosForCurrentPage);
  updatePagination();
}

function hideNoResults() {
  const noResults = document.getElementById("noResults");
  if (noResults) noResults.style.display = "none";
}

function hideGrid() {
  const container = document.getElementById("videoGrid");
  if (container) container.style.display = "none";
}

function hideLoading() {
  const videoLoading = document.getElementById("videoLoading");
  if (videoLoading) videoLoading.style.display = "none";
}

function hidePagination() {
  const paginationSection = document.getElementById("paginationSection");
  if (paginationSection) paginationSection.style.display = "none";
}

function showNoResults() {
  const container = document.getElementById("videoGrid");
  const noResults = document.getElementById("noResults");
  const paginationSection = document.getElementById("paginationSection");
  
  if (container) container.style.display = "none";
  if (noResults) noResults.style.display = "flex";
  if (paginationSection) paginationSection.style.display = "none";
}


function displayVideos(videos) {
  const container = document.getElementById("videoGrid");
  const noResults = document.getElementById("noResults");

  if (!container) return;

  if (videos.length === 0) {
    if (noResults) noResults.style.display = "flex";
    container.style.display = "none";
    return;
  }

  // Hide no results, show grid
  if (noResults) noResults.style.display = "none";
  
  // Ensure grid is visible and properly configured
  container.style.display = "grid";
  
  // Responsive grid layout
  const updateGridLayout = () => {
    const screenWidth = window.innerWidth;
    
    if (showAllMode && videos.length > 9) {
      // For showing all videos, use responsive columns
      if (screenWidth <= 576) {
        // Mobile: 1 column
        container.style.gridTemplateColumns = "1fr";
      } else if (screenWidth <= 768) {
        // Tablet: 2 columns
        container.style.gridTemplateColumns = "repeat(2, 1fr)";
      } else if (screenWidth <= 992) {
        // Small desktop: 3 columns
        container.style.gridTemplateColumns = "repeat(3, 1fr)";
      } else {
        // Large desktop: up to 5 columns for many videos
        const columns = Math.min(Math.ceil(Math.sqrt(videos.length)), 5);
        container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      }
      container.style.gap = screenWidth <= 576 ? "15px" : "20px";
    } else {
      // Default pagination mode - responsive 3x3 grid
      if (screenWidth <= 576) {
        // Mobile: 1 column
        container.style.gridTemplateColumns = "1fr";
        container.style.gap = "15px";
      } else if (screenWidth <= 768) {
        // Tablet: 2 columns
        container.style.gridTemplateColumns = "repeat(2, 1fr)";
        container.style.gap = "15px";
      } else if (screenWidth <= 992) {
        // Small desktop: 2 columns
        container.style.gridTemplateColumns = "repeat(2, 1fr)";
        container.style.gap = "20px";
      } else {
        // Desktop: 3 columns
        container.style.gridTemplateColumns = "repeat(3, 1fr)";
        container.style.gap = "30px";
      }
    }
  };
  
  updateGridLayout();

  // Add total count info at the top
  const totalInfo = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; margin-bottom: 20px; font-size: 1.2rem; font-weight: 600; color: #333;">
  </div>`;

  // Generate HTML
  const videosHTML = totalInfo + videos
    .map((item) => {
      const imageUrl = item.thumbnail || "/images/logo.png";
      const categoryLabel = getCategoryLabel(item.category);
      const categoryClass = item.category || "general";

      return `
      <article class="video-card" onclick="playVideo('${item.id}', '${item.video_url}')">
        <div class="video-thumbnail">
          <img src="${imageUrl}" alt="${item.title}" 
               onerror="this.src='/images/logo.png'">
          <div class="video-overlay">
            <div class="play-button">
              <i class="fas fa-play"></i>
            </div>
            ${item.duration !== 'N/A' ? `<div class="video-duration">${item.duration}</div>` : ''}
          </div>
        </div>
        <div class="video-content">
          <h3 class="video-title">${item.title}</h3>
          <p class="video-description">
            ${truncateText(item.description, 100)}
          </p>
          <div class="video-meta">
            <span class="video-date">
              <i class="fas fa-calendar"></i> 
              ${formatDate(item.created_at)}
            </span>
            <span class="video-views">
              <i class="fas fa-eye"></i> 
              ${item.views.toLocaleString()} lượt xem
            </span>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  container.innerHTML = videosHTML;
}

function updatePagination() {
  const paginationSection = document.getElementById("paginationSection");
  const paginationInfo = document.getElementById("paginationInfo");
  const paginationNumbers = document.getElementById("paginationNumbers");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  // Hide pagination if in show all mode
  if (showAllMode) {
    if (paginationSection) paginationSection.style.display = "none";
    return;
  }

  if (totalPages <= 1) {
    if (paginationSection) paginationSection.style.display = "none";
    return;
  }

  // Show pagination
  if (paginationSection) {
    paginationSection.style.display = "block";
  }

  // Update pagination info
  if (paginationInfo) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredVideos.length);
  }

  // Update pagination numbers
  if (paginationNumbers) {
    generatePaginationNumbers();
  }

  // Update navigation buttons
  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage === 1;
  }
  if (nextPageBtn) {
    nextPageBtn.disabled = currentPage >= totalPages;
  }
}

function generatePaginationNumbers() {
  const paginationNumbers = document.getElementById("paginationNumbers");
  if (!paginationNumbers) return;

  let numbersHTML = "";
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust start page if we're near the end
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page
  if (startPage > 1) {
    numbersHTML += `<button class="page-number" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) {
      numbersHTML += `<span class="page-ellipsis">...</span>`;
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? "active" : "";
    numbersHTML += `<button class="page-number ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      numbersHTML += `<span class="page-ellipsis">...</span>`;
    }
    numbersHTML += `<button class="page-number" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }

  paginationNumbers.innerHTML = numbersHTML;
}

function getCategoryLabel(category) {
  const labels = {
    tutorial: "Hướng dẫn",
    product: "Sản phẩm", 
    maintenance: "Bảo trì",
    general: "Tổng quát"
  };
  return labels[category] || "Video";
}

window.playVideo = (videoId, videoUrl) => {
  // Create video modal
  const modal = document.createElement("div");
  modal.className = "video-modal";
  modal.innerHTML = `
    <div class="video-modal-content">
      <div class="video-modal-header">
        <button class="close-modal" onclick="closeVideoModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="video-container">
        <iframe 
          src="${videoUrl}?autoplay=1" 
          frameborder="0" 
          allowfullscreen
          allow="autoplay; encrypted-media">
        </iframe>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";
};

window.closeVideoModal = () => {
  const modal = document.querySelector(".video-modal");
  if (modal) {
    modal.remove();
    document.body.style.overflow = "auto";
  }
};

window.goToPage = (page) => {
  if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) {
    loadVideoPage(page);
  }
};

window.goToPreviousPage = () => {
  if (currentPage > 1 && !isLoading) {
    loadVideoPage(currentPage - 1);
  }
};

window.goToNextPage = () => {
  if (currentPage < totalPages && !isLoading) {
    loadVideoPage(currentPage + 1);
  }
};