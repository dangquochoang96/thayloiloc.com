import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { newsService } from "../services/news.service.js";
import { getImageUrl, formatDate, truncateText } from "../utils/helpers.js";

// Import HTML templates
import heroTemplate from "../templates/home/hero-section.html?raw";
import servicesTemplate from "../templates/home/services-section.html?raw";
import newsTemplate from "../templates/home/news-section.html?raw";
import contactTemplate from "../templates/home/contact-section.html?raw";
import floatingButtonTemplate from "../templates/home/floating-button.html?raw";

// Import CSS styles
import "../styles/home/hero-section.css";
import "../styles/home/services-section.css";
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

// News loading function using news service
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
