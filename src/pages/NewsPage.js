import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { newsService } from '../services/news.service.js';
import { getImageUrl, formatDate, truncateText } from '../utils/helpers.js';
import '../styles/news/news-page.css';

export function NewsPage() {
  const container = document.createElement('div');
  container.appendChild(Header());

  const page = document.createElement('main');
  page.className = 'news-page';

  const main = document.createElement('div');
  main.className = 'news-main';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';

  // Page header
  const pageHeader = document.createElement('div');
  pageHeader.className = 'page-header';
  pageHeader.innerHTML = `
    <h1><i class="fas fa-newspaper"></i> Tin Tức & Sự Kiện</h1>
    <p>Cập nhật những tin tức mới nhất về sản phẩm, dịch vụ và chương trình khuyến mãi</p>
    <div class="breadcrumb">
      <a href="#/">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <span>Tin tức</span>
    </div>
  `;
  containerDiv.appendChild(pageHeader);

  // Loading state
  const loadingState = document.createElement('div');
  loadingState.className = 'loading-state';
  loadingState.id = 'newsLoading';
  loadingState.innerHTML = `
    <i class="fas fa-spinner fa-spin"></i>
    <p>Đang tải tin tức...</p>
  `;
  containerDiv.appendChild(loadingState);

  // News grid
  const newsGrid = document.createElement('div');
  newsGrid.className = 'news-grid';
  newsGrid.id = 'newsGrid';
  newsGrid.style.display = 'none';
  containerDiv.appendChild(newsGrid);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  // Load news
  setTimeout(() => {
    loadNews();
  }, 100);

  return container;
}

function loadNews() {
  newsService
    .getNewsList()
    .then((result) => {
      const newsLoading = document.getElementById('newsLoading');
      const newsGrid = document.getElementById('newsGrid');

      if (newsLoading) newsLoading.style.display = 'none';
      if (newsGrid) newsGrid.style.display = 'grid';

      let news = [];
      if (result.data && Array.isArray(result.data)) {
        news = result.data;
      } else if (Array.isArray(result)) {
        news = result;
      }

      displayNews(news);
    })
    .catch((err) => {
      console.error('Error loading news:', err);
      const newsLoading = document.getElementById('newsLoading');
      if (newsLoading) {
        newsLoading.innerHTML = `
          <i class="fas fa-exclamation-triangle" style="font-size:2rem; color:#dc3545;"></i>
          <p style="margin-top:10px; color:#666;">Không thể tải tin tức. Vui lòng thử lại.</p>
        `;
      }
    });
}

function displayNews(news) {
  const container = document.getElementById('newsGrid');
  if (!container) return;

  if (news.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:40px;">
        <i class="fas fa-inbox" style="font-size:3rem; color:#ccc;"></i>
        <p style="margin-top:15px; color:#666;">Chưa có tin tức nào</p>
      </div>
    `;
    return;
  }

  container.innerHTML = news
    .map((item) => {
      const imageUrl = getImageUrl(item.image || item.thumbnail || item.avatar);
      
      return `
        <div class="news-card" onclick="viewNewsDetail(${item.id})" style="cursor:pointer;">
          <div class="news-image">
            <img src="${imageUrl}" alt="${item.title || item.name || 'Tin tức'}" 
                 onerror="this.src='/images/logo.png'">
            <div class="news-overlay">
              <i class="fas fa-eye"></i>
            </div>
          </div>
          <div class="news-content">
            <div class="news-meta">
              <span class="news-date">
                <i class="fas fa-calendar"></i> 
                ${formatDate(item.created_at || item.date)}
              </span>
              ${item.category ? `<span class="news-category">${item.category}</span>` : ''}
            </div>
            <h3>${item.title || item.name || 'Tin tức'}</h3>
            <p>${truncateText(item.description || item.content || item.des || '', 120)}</p>
            <a href="javascript:void(0)" onclick="event.stopPropagation(); viewNewsDetail(${item.id})" class="news-link">
              Xem chi tiết <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      `;
    })
    .join('');
}

// Global function to view news detail
window.viewNewsDetail = (newsId) => {
  window.location.hash = `#/news-detail?id=${newsId}`;
};
