import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { newsService } from '../services/news.service.js';
import { getImageUrl, formatDate } from '../utils/helpers.js';
import '../styles/news/news-detail.css';

export function NewsDetailPage() {
  const container = document.createElement('div');
  container.appendChild(Header());

  const page = document.createElement('main');
  page.className = 'news-detail-page';

  const main = document.createElement('div');
  main.className = 'news-detail-main';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';

  // Loading state
  const loadingState = document.createElement('div');
  loadingState.className = 'loading-state';
  loadingState.id = 'newsDetailLoading';
  loadingState.innerHTML = `
    <i class="fas fa-spinner fa-spin"></i>
    <p>Đang tải chi tiết tin tức...</p>
  `;
  containerDiv.appendChild(loadingState);

  // News detail content
  const newsDetailContent = document.createElement('div');
  newsDetailContent.className = 'news-detail-content';
  newsDetailContent.id = 'newsDetailContent';
  newsDetailContent.style.display = 'none';
  containerDiv.appendChild(newsDetailContent);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  // Get news ID from URL
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const newsId = urlParams.get('id');

  if (newsId) {
    loadNewsDetail(newsId);
  } else {
    showError('Không tìm thấy tin tức');
  }

  return container;
}

function loadNewsDetail(newsId) {
  newsService
    .getNewsDetail(newsId)
    .then((result) => {
      const loadingState = document.getElementById('newsDetailLoading');
      const contentDiv = document.getElementById('newsDetailContent');

      if (loadingState) loadingState.style.display = 'none';
      if (contentDiv) contentDiv.style.display = 'block';

      const news = result.data || result;
      displayNewsDetail(news);
    })
    .catch((err) => {
      console.error('Error loading news detail:', err);
      showError('Không thể tải chi tiết tin tức');
    });
}

function displayNewsDetail(news) {
  const container = document.getElementById('newsDetailContent');
  if (!container) return;

  const imageUrl = getImageUrl(news.image || news.thumbnail || news.avatar);

  container.innerHTML = `
    <div class="breadcrumb">
      <a href="#/">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <a href="#/news">Tin tức</a>
      <i class="fas fa-chevron-right"></i>
      <span>${news.title || news.name || 'Chi tiết'}</span>
    </div>

    <article class="news-article">
      <header class="article-header">
        <h1>${news.title || news.name || 'Tin tức'}</h1>
        <div class="article-meta">
          <span class="meta-item">
            <i class="fas fa-calendar"></i>
            ${formatDate(news.created_at || news.date)}
          </span>
          ${news.author ? `
            <span class="meta-item">
              <i class="fas fa-user"></i>
              ${news.author}
            </span>
          ` : ''}
          ${news.category ? `
            <span class="meta-item">
              <i class="fas fa-tag"></i>
              ${news.category}
            </span>
          ` : ''}
        </div>
      </header>

      <div class="article-image">
        <img src="${imageUrl}" alt="${news.title || news.name || 'Tin tức'}" 
             onerror="this.src='/images/logo.png'">
      </div>

      <div class="article-content">
        ${news.content || news.description || news.des || '<p>Nội dung đang được cập nhật...</p>'}
      </div>

      <div class="article-footer">
        <button onclick="window.history.back()" class="btn-back">
          <i class="fas fa-arrow-left"></i>
          Quay lại
        </button>
        <div class="article-share">
          <span>Chia sẻ:</span>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" 
             target="_blank" class="share-btn facebook">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(news.title || '')}" 
             target="_blank" class="share-btn twitter">
            <i class="fab fa-twitter"></i>
          </a>
        </div>
      </div>
    </article>
  `;
}

function showError(message) {
  const loadingState = document.getElementById('newsDetailLoading');
  if (loadingState) {
    loadingState.innerHTML = `
      <i class="fas fa-exclamation-triangle" style="font-size:2rem; color:#dc3545;"></i>
      <p style="margin-top:10px; color:#666;">${message}</p>
      <button onclick="window.location.hash='#/news'" class="btn-back" style="margin-top:1rem;">
        <i class="fas fa-arrow-left"></i>
        Quay lại danh sách tin tức
      </button>
    `;
  }
}
