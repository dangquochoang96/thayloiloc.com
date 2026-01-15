import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { newsService } from "../services/news.service.js";
import { productService } from "../services/product.service.js";
import { getImageUrl, formatDate, truncateText } from "../utils/helpers.js";

// Import HTML templates
import heroTemplate from "../templates/home/hero-section.html?raw";
import servicesTemplate from "../templates/home/services-section.html?raw";
import productsTemplate from "../templates/home/products-section.html?raw";
import appDownloadTemplate from "../templates/home/app-download-section.html?raw";
import newsTemplate from "../templates/home/news-section.html?raw";
import contactTemplate from "../templates/home/contact-section.html?raw";
import floatingButtonTemplate from "../templates/home/floating-button.html?raw";

// Import CSS styles
import "../styles/home/hero-section.css";
import "../styles/home/services-section.css";
import "../styles/home/products-section.css";
import "../styles/home/app-download-section.css";
import "../styles/home/news-section.css";
import "../styles/home/contact-section.css";
import "../styles/home/floating-button.css";

export function HomePage() {
  const container = document.createElement("div");

  const header = Header();
  container.appendChild(header);

  const main = document.createElement("main");

  // Hero Section
  const heroSection = document.createElement("div");
  heroSection.innerHTML = heroTemplate;
  main.appendChild(heroSection.firstElementChild);

  // Services Section
  const servicesSection = document.createElement("div");
  servicesSection.innerHTML = servicesTemplate;
  main.appendChild(servicesSection.firstElementChild);

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

  // Floating Button
  const floatingButton = document.createElement("div");
  floatingButton.innerHTML = floatingButtonTemplate;
  container.appendChild(floatingButton.firstElementChild);

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
      console.log("Error loading products:", err);
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

// Global functions for product interactions
window.viewProductDetail = (productId) => {
  // Navigate to product detail page or show modal
  console.log('View product detail:', productId);
  // For now, just log - can implement product detail page later
};

window.contactForProduct = (productId) => {
  // Handle contact for specific product
  console.log('Contact for product:', productId);
  // Can implement contact modal or redirect to contact form
  alert('Vui lòng liên hệ hotline: 1900-xxxx để biết thêm chi tiết về sản phẩm này!');
};
function loadNews() {
  newsService
    .getNewsList()
    .then((result) => {
      const newsLoading = document.getElementById("newsLoading");
      const newsGrid = document.getElementById("newsGrid");

      if (newsLoading) newsLoading.style.display = "none";
      if (newsGrid) newsGrid.style.display = "grid";

      let news = [];
      if (result.data && Array.isArray(result.data)) {
        news = result.data.slice(0, 6); // Get 6 latest news
      } else if (Array.isArray(result)) {
        news = result.slice(0, 6);
      }

      displayNews(news);
    })
    .catch((err) => {
      console.log("Error loading news:", err);
      const newsLoading = document.getElementById("newsLoading");
      if (newsLoading) {
        newsLoading.innerHTML =
          '<p style="color:#666;">Không thể tải tin tức</p>';
      }
    });
}

function displayNews(news) {
  const container = document.getElementById("newsGrid");
  if (!container) return;

  if (news.length === 0) {
    container.innerHTML =
      '<p style="text-align:center; color:#666; grid-column:1/-1;">Chưa có tin tức</p>';
    return;
  }

  container.innerHTML = news
    .map((item) => {
      const imageUrl = getImageUrl(item.image || item.thumbnail || item.avatar);
      const detailLink = `news-detail.html?id=${item.id}`;

      return `
      <div class="news-card" onclick="window.location.href='${detailLink}'" style="cursor:pointer;">
        <div class="news-image">
          <img src="${imageUrl}" alt="${
        item.title || item.name || "Tin tức"
      }" onerror="this.src='/images/logo.png'">
        </div>
        <div class="news-content">
          <span class="news-date"><i class="fas fa-calendar"></i> ${formatDate(
            item.created_at || item.date
          )}</span>
          <h3>${item.title || item.name || "Tin tức"}</h3>
          <p>${truncateText(
            item.description || item.content || item.des || "",
            100
          )}</p>
          <a href="${detailLink}" class="news-link">Xem thêm <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    `;
    })
    .join("");
}
