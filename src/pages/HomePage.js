import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { FloatingButton } from "../components/FloatingButton.js";
import { newsService } from "../services/news.service.js";
import { productService } from "../services/product.service.js";
import { videoService } from "../services/video.service.js";
import { getImageUrl, formatDate, truncateText } from "../utils/helpers.js";
import { navigateTo } from "../utils/navigation.js";
import { checkAndShowLoginSuccess } from "../utils/toast.js";
import { showAdBanner } from "../components/AdBanner.js";

// Import HTML templates
import heroTemplate from "../templates/home/hero-section.html?raw";
import workingProcessTemplate from "../templates/home/working-process.html?raw";
import servicesTemplate from "../templates/home/services-section.html?raw";
import productsTemplate from "../templates/home/products-section.html?raw";
import appDownloadTemplate from "../templates/home/app-download-section.html?raw";
import newsTemplate from "../templates/home/news-section.html?raw";
import videoTemplate from "../templates/home/video-section.html?raw";
import contactTemplate from "../templates/home/contact-section.html?raw";

// Import CSS styles
import "../styles/home/hero-section.css";
import "../styles/home/working-process.css";
import "../styles/home/services-section.css";
import "../styles/home/products-section.css";
import "../styles/home/app-download-section.css";
import "../styles/home/news-section.css";
import "../styles/home/video-section.css";
import "../styles/home/contact-section.css";
import "../styles/toast.css";

export function HomePage() {
  const container = document.createElement("div");

  const header = Header();
  container.appendChild(header);

  const main = document.createElement("main");

  // Hero Section
  const heroSection = document.createElement("div");
  heroSection.innerHTML = heroTemplate;
  main.appendChild(heroSection.firstElementChild);

  // Working Process Section (Placed directly under hero banner)
  const workingProcessSection = document.createElement("div");
  workingProcessSection.innerHTML = workingProcessTemplate;
  main.appendChild(workingProcessSection.firstElementChild);

  // Services Section
  const servicesSection = document.createElement("div");
  servicesSection.innerHTML = servicesTemplate;
  main.appendChild(servicesSection.firstElementChild);

  // Video Section
  const videoSection = document.createElement("div");
  videoSection.innerHTML = videoTemplate;
  main.appendChild(videoSection.firstElementChild);

  // Load videos from API
  loadVideoHome();

  // Products Section
  const productsSection = document.createElement("div");
  productsSection.innerHTML = productsTemplate;
  main.appendChild(productsSection.firstElementChild);

  // Load products from API
  loadProducts();

  // App Download Section
  const appDownloadSection = document.createElement("div");
  appDownloadSection.innerHTML = appDownloadTemplate;
  main.appendChild(appDownloadSection.firstElementChild);

  // News Section
  const newsSection = document.createElement("div");
  newsSection.innerHTML = newsTemplate;
  main.appendChild(newsSection.firstElementChild);

  // Load news from API
  loadNews();

  // Contact Section
  const contactSection = document.createElement("div");
  contactSection.innerHTML = contactTemplate;
  main.appendChild(contactSection.firstElementChild);

  container.appendChild(main);
  container.appendChild(Footer());

  // Check and show login success toast
  setTimeout(() => {
    checkAndShowLoginSuccess();
  }, 100);

  // Show promotional ad banner after a short delay
  setTimeout(() => {
    showAdBanner();
  }, 800);

  return container;
}

// Products loading function using product service
function loadProducts() {
  productService
    .getProductList()
    .then((products) => {
      const productsLoading = document.getElementById("productsLoading");
      const productsSliderContainer = document.querySelector(".products-slider-container");

      if (productsLoading) productsLoading.style.display = "none";
      if (productsSliderContainer) productsSliderContainer.style.display = "block";

      // Get all products for slider
      const displayProducts = Array.isArray(products) ? products : [];
      
      displayProductsSlider(displayProducts);
      initializeSlider(displayProducts.length);
    })
    .catch((err) => {
            const productsLoading = document.getElementById("productsLoading");
      if (productsLoading) {
        productsLoading.innerHTML = `
          <i class="fas fa-exclamation-triangle" style="color:#dc3545;"></i>
          <p style="color:#666; margin-top: 10px;">Không thể tải sản phẩm: ${err.message}</p>
        `;
      }
    });
}

function displayProductsSlider(products) {
  const container = document.getElementById("productsTrack");
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML =
      '<p style="text-align:center; color:#666; width:100%;">Chưa có sản phẩm</p>';
    return;
  }

  container.innerHTML = products
    .map((product) => {
      // Get image from product_images array (first image)
      let imageUrl = '/images/default-service.svg';
      if (product.product_images && product.product_images.length > 0) {
        imageUrl = getImageUrl(product.product_images[0].link);
      }
      
      const price = product.price ? formatPrice(product.price) : 'Liên hệ';
      const category = product.category_name || product.category || 'Sản phẩm';
      
      return `
        <div class="product-slide">
          <div class="product-card" onclick="viewProductDetail(${product.id})" style="cursor:pointer;">
            <div class="product-image">
              <img src="${imageUrl}" alt="${product.name || 'Sản phẩm'}" onerror="this.src='/images/default-service.svg'">
              ${product.is_featured ? '<div class="product-badge">Nổi bật</div>' : ''}
            </div>
            <div class="product-content">
              <div class="product-category">${category}</div>
              <h3 class="product-title">${product.name || 'Sản phẩm'}</h3>
              <p class="product-description">${truncateText(product.description || product.des || 'Sản phẩm chất lượng cao', 80)}</p>
              
              ${product.features ? `
                <div class="product-features">
                  <ul>
                    ${product.features.slice(0, 3).map(feature => `
                      <li><i class="fas fa-check"></i> ${feature}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              
              <div class="product-footer">
                <div class="product-price">
                  ${price}
                  ${product.price ? '<span class="currency">VNĐ</span>' : ''}
                </div>
                <button class="product-action" onclick="event.stopPropagation(); contactForProduct(${product.id})">
                  <i class="fas fa-phone"></i>
                  Liên hệ
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Slider functionality
let currentSlide = 0;
let totalSlides = 0;
let slidesPerView = 3;
let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;

function initializeSlider(productCount) {
  totalSlides = Math.ceil(productCount / slidesPerView);
  currentSlide = 0;
  
  // Update slides per view based on screen size
  updateSlidesPerView();
  
  // Generate dots
  generateSliderDots();
  
  // Update slider position
  updateSliderPosition();
  
  // Add resize listener
  window.addEventListener('resize', handleSliderResize);
  
  // Add touch/swipe listeners for mobile
  initializeTouchEvents();
}

function initializeTouchEvents() {
  const slider = document.querySelector('.products-slider');
  if (!slider) return;
  
  // Touch events for mobile
  slider.addEventListener('touchstart', handleTouchStart, { passive: true });
  slider.addEventListener('touchmove', handleTouchMove, { passive: true });
  slider.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  // Mouse events for desktop (optional - for drag functionality)
  slider.addEventListener('mousedown', handleMouseDown);
  slider.addEventListener('mousemove', handleMouseMove);
  slider.addEventListener('mouseup', handleMouseEnd);
  slider.addEventListener('mouseleave', handleMouseEnd);
}

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  isDragging = true;
}

function handleTouchMove(e) {
  if (!isDragging) return;
  touchEndX = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  if (!isDragging) return;
  isDragging = false;
  
  const swipeThreshold = 50; // Minimum distance for swipe
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next slide
      if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateSliderPosition();
      }
    } else {
      // Swipe right - previous slide
      if (currentSlide > 0) {
        currentSlide--;
        updateSliderPosition();
      }
    }
  }
  
  touchStartX = 0;
  touchEndX = 0;
}

function handleMouseDown(e) {
  touchStartX = e.clientX;
  isDragging = true;
  e.preventDefault();
}

function handleMouseMove(e) {
  if (!isDragging) return;
  touchEndX = e.clientX;
}

function handleMouseEnd(e) {
  if (!isDragging) return;
  isDragging = false;
  
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateSliderPosition();
      }
    } else {
      if (currentSlide > 0) {
        currentSlide--;
        updateSliderPosition();
      }
    }
  }
  
  touchStartX = 0;
  touchEndX = 0;
}

function updateSlidesPerView() {
  const width = window.innerWidth;
  if (width <= 768) {
    slidesPerView = 1;
  } else if (width <= 1024) {
    slidesPerView = 2;
  } else {
    slidesPerView = 3;
  }
  
  // Recalculate total slides
  const productCount = document.querySelectorAll('.product-slide').length;
  totalSlides = Math.ceil(productCount / slidesPerView);
  
  // Ensure current slide is within bounds
  if (currentSlide >= totalSlides) {
    currentSlide = Math.max(0, totalSlides - 1);
  }
}

function generateSliderDots() {
  const dotsContainer = document.getElementById("sliderDots");
  if (!dotsContainer || totalSlides <= 1) {
    if (dotsContainer) dotsContainer.style.display = 'none';
    return;
  }
  
  dotsContainer.style.display = 'flex';
  dotsContainer.innerHTML = Array.from({ length: totalSlides }, (_, i) => 
    `<button class="slider-dot ${i === currentSlide ? 'active' : ''}" onclick="goToSlide(${i})"></button>`
  ).join('');
}

function updateSliderPosition() {
  const track = document.getElementById("productsTrack");
  if (!track) return;
  
  const slideWidth = 100 / slidesPerView;
  const translateX = -(currentSlide * slideWidth);
  track.style.transform = `translateX(${translateX}%)`;
  
  // Update dots
  const dots = document.querySelectorAll('.slider-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
  
  // Update button states
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');
  
  if (prevBtn) prevBtn.disabled = currentSlide === 0;
  if (nextBtn) nextBtn.disabled = currentSlide >= totalSlides - 1;
}

function handleSliderResize() {
  updateSlidesPerView();
  generateSliderDots();
  updateSliderPosition();
}

// Global slider functions
window.slideProducts = (direction) => {
  if (direction === 'next' && currentSlide < totalSlides - 1) {
    currentSlide++;
  } else if (direction === 'prev' && currentSlide > 0) {
    currentSlide--;
  }
  updateSliderPosition();
};

window.goToSlide = (slideIndex) => {
  currentSlide = slideIndex;
  updateSliderPosition();
};

// Helper function to format price
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price);
}

// Global function for navigation - moved to utils/navigation.js

// Global functions for product interactions
window.viewProductDetail = (productId) => {
  // Navigate to product detail page or show modal
    // For now, just log - can implement product detail page later
};

window.contactForProduct = (productId) => {
  // Handle contact for specific product
    // Can implement contact modal or redirect to contact form
  alert('Vui lòng liên hệ hotline: 0335118911 để biết thêm chi tiết về sản phẩm này!');
};

// News slider state
let newsCurrentSlide = 0;
let newsTotalSlides = 0;
let newsPerView = 3;

function loadNews() {
  // Load news from Geysereco API instead of main API
  newsService
    .getGeyserecoNewsWithPagination("san-pham-dich-vu-2")
    .then((result) => {
      const newsLoading = document.getElementById("newsLoading");
      const newsSliderContainer = document.getElementById("newsSliderContainer");

      if (newsLoading) newsLoading.style.display = "none";
      if (newsSliderContainer) newsSliderContainer.style.display = "block";

      let news = [];
      if (result && Array.isArray(result)) {
        news = result.slice(0, 9); // Get 9 latest news for slider
      } else if (result && result.data && Array.isArray(result.data)) {
        news = result.data.slice(0, 9);
      }

      // If no Geysereco news, fallback to main API
      if (news.length === 0) {
        return newsService.getNewsList().then((mainResult) => {
          if (mainResult.data && Array.isArray(mainResult.data)) {
            news = mainResult.data.slice(0, 9);
          } else if (Array.isArray(mainResult)) {
            news = mainResult.slice(0, 9);
          }
          displayNewsSlider(news);
          initializeNewsSlider(news.length);
        });
      } else {
        displayNewsSlider(news);
        initializeNewsSlider(news.length);
      }
    })
    .catch((err) => {
            // Fallback to main API if Geysereco fails
      return newsService.getNewsList()
        .then((result) => {
          const newsLoading = document.getElementById("newsLoading");
          const newsSliderContainer = document.getElementById("newsSliderContainer");

          if (newsLoading) newsLoading.style.display = "none";
          if (newsSliderContainer) newsSliderContainer.style.display = "block";

          let news = [];
          if (result.data && Array.isArray(result.data)) {
            news = result.data.slice(0, 9);
          } else if (Array.isArray(result)) {
            news = result.slice(0, 9);
          }

          displayNewsSlider(news);
          initializeNewsSlider(news.length);
        })
        .catch((mainErr) => {
                    const newsLoading = document.getElementById("newsLoading");
          if (newsLoading) {
            newsLoading.innerHTML = '<p style="color:#666;">Không thể tải tin tức</p>';
          }
        });
    });
}

function displayNewsSlider(news) {
  const container = document.getElementById("newsTrack");
  if (!container) return;

  if (news.length === 0) {
    container.innerHTML =
      '<p style="text-align:center; color:#666; width:100%; padding: 40px;">Chưa có tin tức</p>';
    return;
  }

  container.innerHTML = news
    .map((item) => {
      // Handle different image field names from Geysereco API
      const imageUrl = getImageUrl(
        item.image || 
        item.thumbnail || 
        item.avatar || 
        item.featured_image ||
        item.cover_image
      );
      
      // Handle different title field names
      const title = item.title || item.name || item.headline || "Tin tức";
      
      // Handle different description field names
      const description = item.description || 
        item.content || 
        item.des || 
        item.excerpt || 
        item.summary || 
        "";
      
      // Handle different date field names
      const date = item.created_at || 
        item.date || 
        item.published_at || 
        item.publish_date ||
        new Date().toISOString();
      
      // Create detail link - handle different ID formats
      const itemId = item.id || item.slug || item.uuid || Math.random();
      const detailLink = `#/news/${itemId}`;

      return `
      <div class="news-slide">
        <div class="news-card" onclick="window.location.href='${detailLink}'" style="cursor:pointer;">
          <div class="news-image">
            <img src="${imageUrl}" alt="${title}" onerror="this.src='/images/logo.png'">
          </div>
          <div class="news-content">
            <span class="news-date"><i class="fas fa-calendar"></i> ${formatDate(date)}</span>
            <h3>${title}</h3>
            <p>${truncateText(description, 100)}</p>
            <a href="${detailLink}" class="news-link">Xem thêm <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

function initializeNewsSlider(newsCount) {
  updateNewsPerView();
  newsTotalSlides = Math.ceil(newsCount / newsPerView);
  newsCurrentSlide = 0;
  
  generateNewsSliderDots();
  updateNewsSliderPosition();
  
  window.addEventListener('resize', handleNewsSliderResize);
  initializeNewsTouchEvents();
}

function updateNewsPerView() {
  const width = window.innerWidth;
  if (width <= 768) {
    newsPerView = 1;
  } else if (width <= 1024) {
    newsPerView = 2;
  } else {
    newsPerView = 3;
  }
  
  const newsCount = document.querySelectorAll('.news-slide').length;
  newsTotalSlides = Math.ceil(newsCount / newsPerView);
  
  if (newsCurrentSlide >= newsTotalSlides) {
    newsCurrentSlide = Math.max(0, newsTotalSlides - 1);
  }
}

function generateNewsSliderDots() {
  const dotsContainer = document.getElementById("newsSliderDots");
  if (!dotsContainer || newsTotalSlides <= 1) {
    if (dotsContainer) dotsContainer.style.display = 'none';
    return;
  }
  
  dotsContainer.style.display = 'flex';
  dotsContainer.innerHTML = Array.from({ length: newsTotalSlides }, (_, i) => 
    `<button class="news-slider-dot ${i === newsCurrentSlide ? 'active' : ''}" onclick="goToNewsSlide(${i})"></button>`
  ).join('');
}

function updateNewsSliderPosition() {
  const track = document.getElementById("newsTrack");
  if (!track) return;
  
  const slideWidth = 100 / newsPerView;
  const translateX = -(newsCurrentSlide * slideWidth * newsPerView);
  track.style.transform = `translateX(${translateX}%)`;
  
  // Update dots
  const dots = document.querySelectorAll('.news-slider-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === newsCurrentSlide);
  });
  
  // Update button states
  const prevBtn = document.querySelector('.news-slider-prev');
  const nextBtn = document.querySelector('.news-slider-next');
  
  if (prevBtn) prevBtn.disabled = newsCurrentSlide === 0;
  if (nextBtn) nextBtn.disabled = newsCurrentSlide >= newsTotalSlides - 1;
}

function handleNewsSliderResize() {
  updateNewsPerView();
  generateNewsSliderDots();
  updateNewsSliderPosition();
}

let newsTouchStartX = 0;
let newsTouchEndX = 0;
let newsIsDragging = false;

function initializeNewsTouchEvents() {
  const slider = document.querySelector('.news-slider-wrapper');
  if (!slider) return;
  
  // Touch events for mobile
  slider.addEventListener('touchstart', handleNewsTouchStart, { passive: true });
  slider.addEventListener('touchmove', handleNewsTouchMove, { passive: true });
  slider.addEventListener('touchend', handleNewsTouchEnd, { passive: true });
  
  // Mouse events for desktop (drag functionality)
  slider.addEventListener('mousedown', handleNewsMouseDown);
  slider.addEventListener('mousemove', handleNewsMouseMove);
  slider.addEventListener('mouseup', handleNewsMouseEnd);
  slider.addEventListener('mouseleave', handleNewsMouseEnd);
}

function handleNewsTouchStart(e) {
  newsTouchStartX = e.touches[0].clientX;
  newsIsDragging = true;
}

function handleNewsTouchMove(e) {
  if (!newsIsDragging) return;
  newsTouchEndX = e.touches[0].clientX;
}

function handleNewsTouchEnd() {
  if (!newsIsDragging) return;
  newsIsDragging = false;
  
  const swipeThreshold = 50; // Minimum distance for swipe
  const diff = newsTouchStartX - newsTouchEndX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next slide
      if (newsCurrentSlide < newsTotalSlides - 1) {
        newsCurrentSlide++;
        updateNewsSliderPosition();
      }
    } else {
      // Swipe right - previous slide
      if (newsCurrentSlide > 0) {
        newsCurrentSlide--;
        updateNewsSliderPosition();
      }
    }
  }
  
  newsTouchStartX = 0;
  newsTouchEndX = 0;
}

function handleNewsMouseDown(e) {
  newsTouchStartX = e.clientX;
  newsIsDragging = true;
  e.preventDefault();
}

function handleNewsMouseMove(e) {
  if (!newsIsDragging) return;
  newsTouchEndX = e.clientX;
}

function handleNewsMouseEnd() {
  if (!newsIsDragging) return;
  newsIsDragging = false;
  
  const swipeThreshold = 50;
  const diff = newsTouchStartX - newsTouchEndX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      if (newsCurrentSlide < newsTotalSlides - 1) {
        newsCurrentSlide++;
        updateNewsSliderPosition();
      }
    } else {
      if (newsCurrentSlide > 0) {
        newsCurrentSlide--;
        updateNewsSliderPosition();
      }
    }
  }
  
  newsTouchStartX = 0;
  newsTouchEndX = 0;
}

// Global news slider functions
window.slideNews = (direction) => {
  if (direction === 'next' && newsCurrentSlide < newsTotalSlides - 1) {
    newsCurrentSlide++;
  } else if (direction === 'prev' && newsCurrentSlide > 0) {
    newsCurrentSlide--;
  }
  updateNewsSliderPosition();
};

window.goToNewsSlide = (slideIndex) => {
  newsCurrentSlide = slideIndex;
  updateNewsSliderPosition();
};

// Video Home Playlist state
let videoHomePlaylist = [];
let videoHomeCurrentIndex = 0;
let youtubePlayerInstance = null;

function loadYoutubeAPI() {
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const existingReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof existingReady === "function") existingReady();
      resolve();
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    } else {
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

function loadVideoHome() {
  videoService.getAllVideos()
    .then((result) => {
      const videoHomeLoading = document.getElementById("videoHomeLoading");
      const videoPlaylistContainer = document.getElementById("videoHomePlaylistContainer");

      if (videoHomeLoading) videoHomeLoading.style.display = "none";

      let videos = [];
      if (result && result.data && Array.isArray(result.data)) {
        videos = result.data;
      } else if (Array.isArray(result)) {
        videos = result;
      }

      videoHomePlaylist = videos.slice(0, 9);

      if (videoHomePlaylist.length > 0) {
        if (videoPlaylistContainer) videoPlaylistContainer.style.display = "flex";
        videoHomeCurrentIndex = 0;
        renderVideoPlaylist();
        loadYoutubeAPI()
          .then(() => {
            initYoutubePlayer();
          })
          .catch((e) => {
            console.warn("YouTube API failed, falling back to iframe:", e);
            initYoutubePlayer();
          });
      } else {
        if (videoPlaylistContainer) {
          videoPlaylistContainer.style.display = "block";
          videoPlaylistContainer.innerHTML = '<p style="text-align:center; padding: 40px; width: 100%; color: #666;">Chưa có video</p>';
        }
      }
    })
    .catch((err) => {
      console.error("Error loading videos:", err);
      const videoHomeLoading = document.getElementById("videoHomeLoading");
      if (videoHomeLoading) {
        videoHomeLoading.innerHTML = '<p style="color:#666; text-align:center; padding: 20px;">Không thể tải video</p>';
      }
    });
}

function renderVideoPlaylist() {
  const listContainer = document.getElementById("videoHomePlaylist");
  if (!listContainer) return;

  listContainer.innerHTML = videoHomePlaylist.map((item, index) => {
    const imageUrl = item.link ? videoService.getYoutubeThumbnail(item.link, 'hqdefault') : "/images/logo.png";
    const title = item.name || item.title || "Video hướng dẫn";
    const date = item.created_at || new Date().toISOString();
    
    return `
      <div class="video-playlist-item ${index === videoHomeCurrentIndex ? 'active' : ''}" onclick="window.playVideoFromList(${index})">
        <div class="video-playlist-thumb">
          <img src="${imageUrl}" alt="${title}" onerror="this.src='/images/logo.png'">
        </div>
        <div class="video-playlist-info">
          <h3 class="video-playlist-title">${title}</h3>
          <span class="video-playlist-date"><i class="fas fa-calendar"></i> ${formatDate(date)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function initYoutubePlayer() {
  const currentVideo = videoHomePlaylist[videoHomeCurrentIndex];
  if (!currentVideo) return;
  
  const videoId = videoService.extractVideoId(currentVideo.link);
  const playerWrapper = document.querySelector(".video-player-wrapper");
  if (!playerWrapper) return;

  if (!videoId) {
    playerWrapper.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#fff;">Link video không hợp lệ</div>`;
    return;
  }

  // Clear existing container node
  playerWrapper.innerHTML = `<div id="youtubePlayer"></div>`;

  if (window.YT && window.YT.Player) {
    try {
      if (youtubePlayerInstance && typeof youtubePlayerInstance.destroy === 'function') {
        try { youtubePlayerInstance.destroy(); } catch(e) {}
      }

      youtubePlayerInstance = new window.YT.Player('youtubePlayer', {
        videoId: videoId,
        playerVars: {
          'autoplay': 1,
          'mute': 1,
          'rel': 0,
          'iv_load_policy': 3,
          'modestbranding': 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
      return;
    } catch (e) {
      console.warn("Could not create YT.Player, using iframe embed fallback:", e);
    }
  }

  // Direct iframe fallback
  playerWrapper.innerHTML = `
    <iframe 
      id="youtubePlayer" 
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  `;
}

function onPlayerReady(event) {
  try {
    event.target.playVideo();
  } catch(e) {}
}

function onPlayerStateChange(event) {
  if (window.YT && event.data === window.YT.PlayerState.ENDED) {
    playNextVideoHome();
  }
}

function playNextVideoHome() {
  videoHomeCurrentIndex++;
  if (videoHomeCurrentIndex >= videoHomePlaylist.length) {
    videoHomeCurrentIndex = 0;
  }
  
  updatePlayerAndList();
}

window.playVideoFromList = (index) => {
  videoHomeCurrentIndex = index;
  updatePlayerAndList();
};

function updatePlayerAndList() {
  const currentVideo = videoHomePlaylist[videoHomeCurrentIndex];
  if (!currentVideo) return;

  const videoId = videoService.extractVideoId(currentVideo.link);
  
  if (youtubePlayerInstance && typeof youtubePlayerInstance.loadVideoById === 'function' && videoId) {
    try {
      youtubePlayerInstance.loadVideoById(videoId);
    } catch(e) {
      initYoutubePlayer();
    }
  } else {
    initYoutubePlayer();
  }
  
  renderVideoPlaylist();
}


