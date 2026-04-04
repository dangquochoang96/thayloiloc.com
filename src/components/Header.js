import { authService } from "../services/auth.service.js";
import "../styles/header.css";

export function Header() {
  const header = document.createElement("header");
  header.className = "site-header";

  // Enhanced styles for modern header design
  const style = document.createElement("style");
  header.appendChild(style);

  const container = document.createElement("div");
  container.className = "nav-container";

  const logo = document.createElement("a");
  logo.href = "#/";
  logo.className = "logo";

  const logoImg = document.createElement("img");
  logoImg.src = "/images/logo.png";
  logoImg.alt = "Logo";
  logo.appendChild(logoImg);

  container.appendChild(logo);

  // Create center container for navigation
  const navCenter = document.createElement("div");
  navCenter.className = "nav-center";

  const nav = document.createElement("nav");
  nav.className = "nav-links";

  const isLoggedIn = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Declare contactDropdown variable at the top of the nav section
  // let contactDropdown = null;

  console.log("Auth check:", { isLoggedIn, user }); // Debug log

  // Debug user data structure
  authService.debugUserData();

  // Helper to create nav links
  const createNavLink = (text, href) => {
    const a = document.createElement("a");
    a.href = href;
    a.className = "nav-link";
    a.textContent = text;
    if (
      window.location.hash === href ||
      (window.location.hash === "" && href === "#/")
    ) {
      a.classList.add("active");
    }
    return a;
  };

  nav.appendChild(createNavLink("Trang Chủ", "#/"));

  // Dịch Vụ Dropdown
  const servicesDropdown = document.createElement("div");
  servicesDropdown.className = "nav-dropdown";
  const isOnServicesPage = ["#/services", "#/rent-water-purifier"].includes(window.location.hash);

  servicesDropdown.innerHTML = `
    <a href="javascript:void(0)" class="nav-link nav-dropdown-toggle ${isOnServicesPage ? "active" : ""}">
      Dịch Vụ
      <i class="fas fa-chevron-down dropdown-arrow"></i>
    </a>
    <div class="nav-dropdown-menu">
      <a href="#/services" class="${window.location.hash === "#/services" ? "active" : ""}"><i class="fas fa-wrench"></i> Dịch Vụ Sửa Chữa</a>
      <a href="#/rent-water-purifier" class="${window.location.hash === "#/rent-water-purifier" ? "active" : ""}"><i class="fas fa-tint"></i> Thuê máy lọc nước</a>
    </div>
  `;
  nav.appendChild(servicesDropdown);

  nav.appendChild(createNavLink("Liên Hệ", "#/contact"));
  nav.appendChild(createNavLink("Tìm Thợ", "#/hotline"));

  // Add history link for logged in users
  if (isLoggedIn && user) {
    nav.appendChild(createNavLink("Lịch Sử", "#/booking-history"));
  }

  // Add "Tin Tức" dropdown with submenus
  const newsDropdown = document.createElement("div");
  newsDropdown.className = "nav-dropdown";
  // Check if we're on any of the process pages, news page, or video page to highlight the parent menu
  const isOnProcessPage = [
    "#/lapdat",
    "#/check-process",
    "#/filter-replacement",
    "#/maintenance-process",
    "#/training-content",
    "#/news",
    "#/video",
  ].includes(window.location.hash);

  newsDropdown.innerHTML = `
    <a href="javascript:void(0)" class="nav-link nav-dropdown-toggle ${isOnProcessPage ? "active" : ""}">
      Tin Tức
      <i class="fas fa-chevron-down dropdown-arrow"></i>
    </a>
    <div class="nav-dropdown-menu">
      <a href="#/news" class="${window.location.hash === "#/news" ? "active" : ""}"><i class="fas fa-newspaper"></i> Tin Tức</a>
      <a href="#/video" class="${window.location.hash === "#/video" ? "active" : ""}"><i class="fas fa-play-circle"></i> Video</a>
      <div class="nav-dropdown-submenu">
        <a href="javascript:void(0)" class="nav-submenu-toggle">
          <i class="fas fa-cogs"></i> Quy Trình
          <i class="fas fa-chevron-right submenu-arrow"></i>
        </a>
        <div class="nav-submenu" style="display: none; margin-left: 25px;">
          <a href="#/lapdat" style="display: block; padding-left: 10px;"><i class="fas fa-tools"></i> Quy trình lắp máy lọc nước</a>
          <a href="#/check-process" style="display: block; padding-left: 10px;"><i class="fas fa-search-plus"></i> Quy trình kiểm tra máy lọc nước</a>
          <a href="#/filter-replacement" style="display: block; padding-left: 10px;"><i class="fas fa-sync-alt"></i> Quy trình thay lõi lọc</a>
          <a href="#/maintenance-process" style="display: block; padding-left: 10px;"><i class="fas fa-broom"></i> Quy trình vệ sinh bảo dưỡng</a>
          <a href="#/training-content" style="display: block; padding-left: 10px;"><i class="fas fa-graduation-cap"></i> Nội dung đào tạo</a>
        </div>
      </div>
    </div>
  `;
  nav.appendChild(newsDropdown);

  // Dropdown toggle functionality for Tin Tức
  const newsDropdownToggle = newsDropdown.querySelector(".nav-dropdown-toggle");
  newsDropdownToggle.addEventListener("click", (e) => {
    e.preventDefault();
    servicesDropdown.classList.remove("active");
    newsDropdown.classList.toggle("active");
  });

  // Dropdown toggle functionality for Dịch Vụ
  const servicesDropdownToggle = servicesDropdown.querySelector(".nav-dropdown-toggle");
  servicesDropdownToggle.addEventListener("click", (e) => {
    e.preventDefault();
    newsDropdown.classList.remove("active");
    const submenu = newsDropdown.querySelector(".nav-submenu");
    if (submenu) submenu.style.display = "none";
    servicesDropdown.classList.toggle("active");
  });

  // Submenu toggle functionality for Quy Trình
  const submenuToggle = newsDropdown.querySelector(".nav-submenu-toggle");
  submenuToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const submenu = newsDropdown.querySelector(".nav-submenu");
    if (submenu.style.display === "none") {
      submenu.style.display = "block";
    } else {
      submenu.style.display = "none";
    }
  });

  // Dropdown toggle functionality for Liên Hệ - only if contactDropdown exists
  // if (contactDropdown) {
  //   const contactToggle = contactDropdown.querySelector(".nav-dropdown-toggle");
  //   contactToggle.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     // Close news dropdown if open
  //     newsDropdown.classList.remove("active");
  //     // Also close submenu if open
  //     const submenu = newsDropdown.querySelector(".nav-submenu");
  //     if (submenu) {
  //       submenu.style.display = "none";
  //     }
  //     contactDropdown.classList.toggle("active");
  //   });
  // }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!newsDropdown.contains(e.target)) {
      newsDropdown.classList.remove("active");
      // Also close submenu if open
      const submenu = newsDropdown.querySelector(".nav-submenu");
      if (submenu) {
        submenu.style.display = "none";
      }
    }
    if (!servicesDropdown.contains(e.target)) {
      servicesDropdown.classList.remove("active");
    }
  });

  // Always add nav to center
  navCenter.appendChild(nav);
  container.appendChild(navCenter);

  // Right side buttons - different based on login status
  if (isLoggedIn && user) {
    // User dropdown for logged in users
    const userDropdown = document.createElement("div");
    userDropdown.className = "user-dropdown";

    const userBtn = document.createElement("button");
    userBtn.className = "user-btn";

    // Get user display name using the auth service method
    const userName = authService.getUserDisplayName();
    console.log("User name for display:", userName); // Debug log

    userBtn.innerHTML = `
      <i class="fas fa-user-circle"></i>
      <span>${userName}</span>
      <i class="fas fa-chevron-down"></i>
    `;

    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu";
    dropdownMenu.innerHTML = `
      <a href="#/profile">
        <i class="fas fa-user-edit"></i>
        Thông tin cá nhân
      </a>
      <a href="#/booking-history">
        <i class="fas fa-history"></i>
        Lịch sử đặt lịch
      </a>
      <div class="dropdown-divider"></div>
      <button class="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        Đăng xuất
      </button>
    `;

    // Enhanced dropdown functionality
    let isDropdownOpen = false;

    // Toggle dropdown on button click
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      isDropdownOpen = !isDropdownOpen;
      userDropdown.classList.toggle("active", isDropdownOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!userDropdown.contains(e.target)) {
        isDropdownOpen = false;
        userDropdown.classList.remove("active");
      }
    });

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isDropdownOpen) {
        isDropdownOpen = false;
        userDropdown.classList.remove("active");
      }
    });

    // Add logout functionality
    const logoutBtn = dropdownMenu.querySelector(".logout-btn");
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        authService.logout();
        window.location.reload();
      }
    });

    // Close dropdown when clicking on links
    const dropdownLinks = dropdownMenu.querySelectorAll("a");
    dropdownLinks.forEach((link) => {
      link.addEventListener("click", () => {
        isDropdownOpen = false;
        userDropdown.classList.remove("active");
      });
    });

    userDropdown.appendChild(userBtn);
    userDropdown.appendChild(dropdownMenu);
    container.appendChild(userDropdown);
  } else {
    // Login and Register buttons for non-logged in users
    const authButtons = document.createElement("div");
    authButtons.className = "auth-buttons";
    authButtons.style.display = "flex";
    authButtons.style.alignItems = "center";
    authButtons.style.gap = "1rem";

    const loginBtn = document.createElement("a");
    loginBtn.href = "#/login";
    loginBtn.className = "login-btn";
    loginBtn.innerHTML = `
      <i class="fas fa-sign-in-alt"></i>
      <span>Đăng Nhập</span>
    `;

    const registerBtn = document.createElement("a");
    registerBtn.href = "#/register";
    registerBtn.className = "register-btn";
    registerBtn.innerHTML = `
      <i class="fas fa-user-plus"></i>
      <span>Đăng Ký</span>
    `;

    authButtons.appendChild(loginBtn);
    authButtons.appendChild(registerBtn);
    container.appendChild(authButtons);
  }

  // Add hamburger menu for mobile
  const hamburger = document.createElement("div");
  hamburger.className = "hamburger";
  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    nav.classList.toggle("active");
  });

  container.appendChild(hamburger);

  header.appendChild(container);

  // Add scroll effect
  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    lastScrollY = window.scrollY;
  });

  return header;
}
