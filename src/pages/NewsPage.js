import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { newsService } from "../services/news.service.js";
import { getImageUrl, formatDate, truncateText } from "../utils/helpers.js";
import { navigateTo } from "../utils/navigation.js";

// Import CSS styles
import "../styles/news/news-page.css";

export function NewsPage() {
  const container = document.createElement("div");

  const header = Header();
  container.appendChild(header);

  const main = document.createElement("main");
  main.className = "news-page";

  // Page Header
  const pageHeader = document.createElement("div");
  pageHeader.className = "page-header";
  pageHeader.innerHTML = `
    <h1><i class="fas fa-newspaper"></i> Sản Phẩm và Dịch Vụ</h1>
    <p>Cập nhật những thông tin mới nhất về sản phẩm và dịch vụ của chúng tôi</p>
    <div class="breadcrumb">
      <a href="#/" onclick="event.preventDefault(); navigateTo('/')">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <span>Tin tức</span>
    </div>
  `;
  main.appendChild(pageHeader);

  // News Content
  const newsContent = document.createElement("section");
  newsContent.className = "news-content";
  newsContent.innerHTML = `
    <div class="container">
      <!-- Filter Section -->
      <div class="news-filters">
        <div class="search-box">
          <input type="text" id="newsSearch" placeholder="Tìm kiếm tin tức...">
          <i class="fas fa-search"></i>
        </div>
      </div>

      <!-- Loading State -->
      <div id="newsLoading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải tin tức...</p>
      </div>

      <!-- News Grid -->
      <div class="news-grid" id="newsGrid" style="display:none;">
        <!-- News items will be loaded here -->
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
        <i class="fas fa-newspaper"></i>
        <h3>Không tìm thấy tin tức</h3>
        <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    </div>
  `;
  main.appendChild(newsContent);

  container.appendChild(main);
  container.appendChild(Footer());

  // Initialize page functionality
  initializeNewsPage();

  return container;
}

let currentPage = 1;
let currentCategory = "all";
let currentSearch = "";
let allNews = [];
let filteredNews = [];
let totalPages = 1;
let isLoading = false;
const itemsPerPage = 8; // Match with API per_page

function initializeNewsPage() {
  // Load initial news
  loadAllNews();

  // Setup functionality after DOM is ready
  setTimeout(() => {
    setupSearch();
  }, 100);
}

function loadAllNews() {
  loadNewsPage(1);
}

function loadNewsPage(page = 1) {
  if (isLoading) return;

  isLoading = true;
  const newsLoading = document.getElementById("newsLoading");
  const newsGrid = document.getElementById("newsGrid");

  if (newsLoading) newsLoading.style.display = "flex";
  if (newsGrid) newsGrid.style.display = "none";

  // Use Geysereco API with pagination
  newsService
    .getGeyserecoNewsWithPagination("san-pham-dich-vu-2", page, itemsPerPage)
    .then((result) => {
      console.log("Geysereco API result:", result);

      let newsData = [];
      let pagination = {};

      // Handle Geysereco API response structure
      if (result && result.data && Array.isArray(result.data)) {
        newsData = result.data;
        pagination = {
          current_page: result.current_page || page,
          last_page: result.last_page || 1,
          total: result.total || newsData.length,
          per_page: result.per_page || itemsPerPage,
        };
      } else if (Array.isArray(result)) {
        newsData = result;
        pagination = {
          current_page: page,
          last_page: Math.ceil(result.length / itemsPerPage),
          total: result.length,
          per_page: itemsPerPage,
        };
      } else {
        // No data from API, use sample news
        console.log("No data from Geysereco API, using sample news");
        newsData = getSampleNews();
        pagination = {
          current_page: 1,
          last_page: Math.ceil(newsData.length / itemsPerPage),
          total: newsData.length,
          per_page: itemsPerPage,
        };
      }

      // Process news data
      const processedNews = newsData.map((item, index) => ({
        ...item,
        id: item.id || item.slug || `news-${page}-${index}`,
        category: item.category || "product", // Default to product for Geysereco
        source: "geysereco",
      }));

      // For server-side pagination, replace all news with current page data
      allNews = processedNews;
      // Set total pages from API response
      totalPages = pagination.last_page || 1;
      currentPage = pagination.current_page || page;

      // Sort by date (newest first)
      allNews.sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || a.published_at || 0);
        const dateB = new Date(b.created_at || b.date || b.published_at || 0);
        return dateB - dateA;
      });

      console.log(`Loaded page ${currentPage}:`);
      console.log(`- Items in this page: ${processedNews.length}`);
      console.log(`- Total items: ${pagination.total}`);
      console.log(`- Per page: ${pagination.per_page}`);
      console.log(`- Total pages: ${totalPages}`);
      console.log(`- Should show pagination: ${totalPages > 1}`);

      if (newsLoading) newsLoading.style.display = "none";
      if (newsGrid) newsGrid.style.display = "grid";

      // Display current page data (no client-side pagination needed for server-side pagination)
      displayNews(allNews);
      updatePagination();

      isLoading = false;
    })
    .catch((err) => {
      console.log("Error loading news from Geysereco API:", err);

      // Fallback to sample news only on first page
      if (page === 1) {
        allNews = getSampleNews();
        // Simulate pagination with sample news (16 items, 8 per page = 2 pages)
        totalPages = Math.ceil(allNews.length / itemsPerPage);
        currentPage = 1;

        if (newsLoading) newsLoading.style.display = "none";
        if (newsGrid) newsGrid.style.display = "grid";

        // Add mock categories for sample news
        allNews = allNews.map((item, index) => ({
          ...item,
          id: item.id || `sample-${index}`,
          category: item.category || getRandomCategory(),
          source: "geysereco",
        }));

        console.log("Using sample news due to API error:", allNews);
        console.log("Sample news total pages:", totalPages);

        // For sample news, use client-side pagination
        displayNews(allNews);
        updatePagination();
      }

      isLoading = false;
    });
}

function setupSearch() {
  const searchInput = document.getElementById("newsSearch");
  if (!searchInput) {
    console.log("Search input not found, retrying...");
    setTimeout(setupSearch, 200);
    return;
  }

  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value.toLowerCase().trim();
      currentPage = 1;
      filterNews();
    }, 300);
  });
}

function getRandomCategory() {
  const categories = ["product", "service", "event", "promotion"];
  return categories[Math.floor(Math.random() * categories.length)];
}

function filterNews() {
  if (!allNews || allNews.length === 0) {
    console.log("No news data available for filtering");
    return;
  }

  // For server-side pagination, we don't filter on client side
  // Just display the current page data
  filteredNews = allNews.filter((item) => {
    // Search filter only (category filtering would require new API calls)
    const searchMatch =
      !currentSearch ||
      (item.title || item.name || "").toLowerCase().includes(currentSearch) ||
      (item.description || item.content || item.des || "")
        .toLowerCase()
        .includes(currentSearch);

    return searchMatch;
  });

  // Display filtered results
  displayNews(filteredNews);
  updatePagination();
}

function displayNews(news) {
  const container = document.getElementById("newsGrid");
  const loadMoreSection = document.getElementById("loadMoreSection");
  const paginationSection = document.getElementById("paginationSection");
  const noResults = document.getElementById("noResults");

  if (!container) return;

  // Show/hide no results
  if (news.length === 0) {
    if (noResults) noResults.style.display = "flex";
    if (container) container.style.display = "none";
    if (loadMoreSection) loadMoreSection.style.display = "none";
    if (paginationSection) paginationSection.style.display = "none";
    // Hide loading when showing no results
    const newsLoading = document.getElementById("newsLoading");
    if (newsLoading) newsLoading.style.display = "none";
    return;
  } else {
    if (noResults) noResults.style.display = "none";
    if (container) container.style.display = "grid";
    // Hide loading when showing results
    const newsLoading = document.getElementById("newsLoading");
    if (newsLoading) newsLoading.style.display = "none";
  }

  // For server-side pagination, show all items from current page
  // For client-side pagination (sample news), slice the array
  let itemsToShow = news;

  // If using sample news (fallback), apply client-side pagination
  if (
    news.length > itemsPerPage &&
    news.some((item) => item.id && item.id.startsWith("sample-"))
  ) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    itemsToShow = news.slice(startIndex, endIndex);
    console.log(
      `Client-side pagination: showing items ${startIndex}-${endIndex - 1} of ${
        news.length
      } total`
    );
  } else {
    console.log(
      `Server-side pagination: showing ${news.length} items for page ${currentPage}`
    );
  }

  // Generate HTML for news items
  const newsHTML = itemsToShow
    .map((item, index) => {
      const imageUrl = getImageUrl(item.image || item.thumbnail || item.avatar);
      const categoryLabel = getCategoryLabel(item.category);
      const categoryClass = item.category || "general";
      const newsId = item.id || item.slug || `news-${index}`;
      const title = item.title || item.name || "Tin tức";
      const description =
        item.description || item.content || item.des || item.excerpt || "";
      const date =
        item.created_at ||
        item.date ||
        item.published_at ||
        new Date().toISOString();

      return `
      <article class="news-card" onclick="viewNewsDetail('${newsId}')" data-category="${
        item.category
      }">
        <div class="news-image">
          <img src="${imageUrl}" alt="${title}" 
               onerror="this.src='/images/logo.png'">
          <div class="news-category ${categoryClass}">${categoryLabel}</div>
        </div>
        <div class="news-content">
          <div class="news-meta">
            <span class="news-date">
              <i class="fas fa-calendar"></i> 
              ${formatDate(date)}
            </span>
            ${
              item.source === "geysereco"
                ? '<span class="news-source">Geysereco</span>'
                : ""
            }
          </div>
          <h3 class="news-title">${title}</h3>
          <p class="news-description">
            ${truncateText(description, 120)}
          </p>
          <div class="news-footer">
            <a href="#" class="news-link" onclick="event.stopPropagation(); viewNewsDetail('${newsId}')">
              Xem chi tiết <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  // Update container content
  container.innerHTML = newsHTML;
}

function updatePagination() {
  const paginationSection = document.getElementById("paginationSection");
  const loadMoreSection = document.getElementById("loadMoreSection");
  const paginationInfo = document.getElementById("paginationInfo");
  const paginationNumbers = document.getElementById("paginationNumbers");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  console.log(
    `updatePagination called: currentPage=${currentPage}, totalPages=${totalPages}`
  );

  if (totalPages <= 1) {
    console.log("Hiding pagination because totalPages <= 1");
    if (paginationSection) paginationSection.style.display = "none";
    if (loadMoreSection) loadMoreSection.style.display = "none";
    return;
  }

  console.log("Showing pagination");
  // Show pagination
  if (paginationSection) {
    paginationSection.style.display = "block";
    console.log("Pagination section made visible");
  } else {
    console.log("Pagination section not found!");
  }

  if (loadMoreSection) {
    loadMoreSection.style.display = "flex";
    console.log("Load more section made visible");
  } else {
    console.log("Load more section not found!");
  }

  // Update pagination info
  if (paginationInfo) {
    paginationInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
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

  // Update load more button
  if (loadMoreBtn) {
    if (currentPage >= totalPages) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "flex";
      loadMoreBtn.innerHTML = `
        <i class="fas fa-plus"></i>
        Tải thêm (Trang ${currentPage + 1}/${totalPages})
      `;
    }
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
    general: "Tin tức",
  };
  return labels[category] || "Tin tức";
}

window.goToPage = (page) => {
  if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) {
    loadNewsPage(page);
  }
};

window.goToPreviousPage = () => {
  if (currentPage > 1 && !isLoading) {
    loadNewsPage(currentPage - 1);
  }
};

window.goToNextPage = () => {
  if (currentPage < totalPages && !isLoading) {
    loadNewsPage(currentPage + 1);
  }
};

window.viewNewsDetail = (newsId) => {
  navigateTo(`/news/${newsId}`);
};
