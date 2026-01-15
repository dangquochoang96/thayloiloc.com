import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { newsService } from "../services/news.service.js";
import { getImageUrl, formatDate } from "../utils/helpers.js";
import { navigateTo } from "../utils/navigation.js";

// Import CSS styles
import "../styles/news/news-detail-page.css";

export function NewsDetailPage(params = {}) {
  const container = document.createElement("div");

  const header = Header();
  container.appendChild(header);

  const main = document.createElement("main");
  main.className = "news-detail-page";

  // Page Header
  const pageHeader = document.createElement("div");
  pageHeader.className = "page-header";
  pageHeader.innerHTML = `
    <div class="container">
      <div class="breadcrumb">
        <a href="#/" onclick="event.preventDefault(); navigateTo('/')">Trang chủ</a>
        <i class="fas fa-chevron-right"></i>
        <a href="#/news" onclick="event.preventDefault(); navigateTo('/news')">Tin tức</a>
        <i class="fas fa-chevron-right"></i>
        <span id="newsTitleBreadcrumb">Chi tiết tin tức</span>
      </div>
    </div>
  `;
  main.appendChild(pageHeader);

  // News Detail Content
  const newsDetailContent = document.createElement("section");
  newsDetailContent.className = "news-detail-content";
  newsDetailContent.innerHTML = `
    <div class="container">
      <!-- Loading State -->
      <div id="newsDetailLoading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải chi tiết tin tức...</p>
      </div>

      <!-- News Detail -->
      <div class="news-detail" id="newsDetail" style="display:none;">
        <!-- Content will be loaded here -->
      </div>

      <!-- Error State -->
      <div class="error-state" id="newsDetailError" style="display:none;">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Không thể tải tin tức</h3>
        <p>Vui lòng thử lại sau hoặc quay về trang tin tức</p>
        <button class="btn-back" onclick="navigateTo('/news')">
          <i class="fas fa-arrow-left"></i>
          Quay về tin tức
        </button>
      </div>
    </div>
  `;
  main.appendChild(newsDetailContent);

  container.appendChild(main);
  container.appendChild(Footer());

  // Initialize page functionality with params
  initializeNewsDetailPage(params);

  return container;
}

let currentNewsId = null;
let isLoading = false;

function initializeNewsDetailPage(params = {}) {
  // Get news ID from params or URL hash
  let newsId = params.id;
  
  if (!newsId) {
    const hash = window.location.hash;
    const match = hash.match(/\/news\/(\d+)/);
    if (match) {
      newsId = match[1];
    }
  }
  
  if (newsId) {
    currentNewsId = newsId;
    loadNewsDetail(currentNewsId);
  } else {
    // No ID found, redirect to news page
    navigateTo('/news');
  }
}

function loadNewsDetail(newsId) {
  if (isLoading) return;
  
  isLoading = true;
  
  // Get DOM elements
  const newsDetailLoading = document.getElementById("newsDetailLoading");
  const newsDetail = document.getElementById("newsDetail");
  const newsDetailError = document.getElementById("newsDetailError");

  console.log('DOM elements found:', {
    loading: !!newsDetailLoading,
    detail: !!newsDetail,
    error: !!newsDetailError
  });

  if (newsDetailLoading) newsDetailLoading.style.display = "flex";
  if (newsDetail) newsDetail.style.display = "none";
  if (newsDetailError) newsDetailError.style.display = "none";

  console.log('Loading news detail for ID:', newsId);

  // Add timeout to prevent infinite loading - reduced to 3 seconds
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 3000);
  });

  // Load news detail from Geysereco API with timeout
  Promise.race([
    newsService.getGeyserecoNewsDetail(newsId),
    timeoutPromise
  ])
    .then((newsData) => {
      console.log('News detail loaded:', newsData);
      
      // Re-get DOM elements to ensure they exist
      const loadingEl = document.getElementById("newsDetailLoading");
      const detailEl = document.getElementById("newsDetail");
      
      console.log('Hiding loading, showing detail...');
      if (loadingEl) {
        loadingEl.style.display = "none";
        console.log('Loading hidden');
      }
      if (detailEl) {
        detailEl.style.display = "block";
        console.log('Detail shown');
      }
      
      displayNewsDetail(newsData);
      loadRelatedNews();
      
      isLoading = false;
    })
    .catch((err) => {
      console.log("Error loading news detail:", err.message);
      showSampleNewsData(newsId);
    });
}

function showSampleNewsData(newsId) {
  // Re-get DOM elements
  const loadingEl = document.getElementById("newsDetailLoading");
  const detailEl = document.getElementById("newsDetail");
  
  // Show sample data as fallback

  
  if (loadingEl) loadingEl.style.display = "none";
  if (detailEl) detailEl.style.display = "block";
  
  console.log('Using sample news data due to API error/timeout');
  displayNewsDetail(sampleNewsData);
  loadRelatedNews();
  
  isLoading = false;
}

function displayNewsDetail(newsData) {
  const container = document.getElementById("newsDetail");
  const breadcrumbTitle = document.getElementById("newsTitleBreadcrumb");
  
  if (!container || !newsData) {
    console.error('Missing container or news data');
    return;
  }

  const imageUrl = getImageUrl(newsData.image || newsData.thumbnail || newsData.avatar);
  const title = newsData.name || newsData.title || 'Tin tức';
  const content = newsData.content || newsData.description || newsData.des || 'Nội dung đang được cập nhật...';
  const date = newsData.created_at || newsData.date || newsData.published_at || new Date().toISOString();
  const status = newsData.status || 1;

  // Update breadcrumb
  if (breadcrumbTitle) {
    breadcrumbTitle.textContent = title;
  }

  // Update page title
  document.title = `${title} - Tin tức`;

  container.innerHTML = `
    <article class="news-article">
      <!-- News Header -->
      <header class="news-header">
        <div class="news-meta">
          <span class="news-date">
            <i class="fas fa-calendar"></i>
            ${formatDate(date)}
          </span>
        </div>
        <h1 class="news-title">${title}</h1>
      </header>

      <!-- News Featured Image -->
      <div class="news-featured-image">
        <img src="${imageUrl}" alt="${title}" onerror="this.src='/images/logo.png'">
      </div>

      <!-- News Content -->
      <div class="news-content">
        ${content}
      </div>

      <!-- News Footer -->
      <footer class="news-footer">
        <div class="news-actions">
          <button class="action-btn share-btn" onclick="shareNews()">
            <i class="fas fa-share-alt"></i>
            Chia sẻ
          </button>
          <button class="action-btn print-btn" onclick="printNews()">
            <i class="fas fa-print"></i>
            In bài viết
          </button>
        </div>
        <div class="back-to-news">
          <button class="btn-back" onclick="navigateTo('/news')">
            <i class="fas fa-arrow-left"></i>
            Quay về tin tức
          </button>
        </div>
      </footer>
    </article>
  `;
  
  console.log('News detail displayed successfully');
}

function loadRelatedNews() {
  // Load related news from the same category
  newsService
    .getGeyserecoNewsWithPagination("san-pham-dich-vu-2", 1, 4)
    .then((result) => {
      if (result && result.data && result.data.length > 0) {
        // Filter out current news
        const relatedNews = result.data.filter(item => 
          (item.id || item.slug) !== currentNewsId
        ).slice(0, 3);
        
        if (relatedNews.length > 0) {
          displayRelatedNews(relatedNews);
        }
      }
    })
    .catch((err) => {
      console.log("Error loading related news:", err);
    });
}

function displayRelatedNews(relatedNews) {
  const relatedSection = document.getElementById("relatedNewsSection");
  const relatedGrid = document.getElementById("relatedNewsGrid");
  
  if (!relatedSection || !relatedGrid || relatedNews.length === 0) return;

  relatedSection.style.display = "block";

  const relatedHTML = relatedNews.map((item) => {
    const imageUrl = getImageUrl(item.image || item.thumbnail || item.avatar);
    const title = item.name || item.title || 'Tin tức';
    const description = item.description || item.content || item.des || '';
    const date = item.created_at || item.date || item.published_at || new Date().toISOString();
    const newsId = item.id || item.slug;

    return `
      <article class="related-news-card" onclick="viewNewsDetail('${newsId}')">
        <div class="related-news-image">
          <img src="${imageUrl}" alt="${title}" onerror="this.src='/images/logo.png'">
        </div>
        <div class="related-news-content">
          <div class="related-news-date">
            <i class="fas fa-calendar"></i>
            ${formatDate(date)}
          </div>
          <h4 class="related-news-title">${title}</h4>
          <p class="related-news-description">
            ${truncateText(description, 100)}
          </p>
        </div>
      </article>
    `;
  }).join("");

  relatedGrid.innerHTML = relatedHTML;
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (!text) return "";
  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, "");
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
}

// Global functions for news detail actions
window.shareNews = () => {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    }).catch(console.error);
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Đã sao chép link bài viết vào clipboard!');
    }).catch(() => {
      alert('Không thể chia sẻ bài viết');
    });
  }
};

window.printNews = () => {
  window.print();
};