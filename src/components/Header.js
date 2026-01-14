import { authService } from "../services/auth.service.js";

export function Header() {
  const header = document.createElement("header");
  header.className = "site-header";

  // Enhanced styles for modern header design
  const style = document.createElement("style");
  style.textContent = `
    .site-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 1000;
      transition: all 0.3s ease;
    }
    
    .site-header.scrolled {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.2rem 2rem;
      position: relative;
    }
    
    .nav-center {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
    
    .logo {
      text-decoration: none;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
    }
    
    .logo img {
      height: 50px;
      width: auto;
      object-fit: contain;
    }
    
    .logo:hover {
      transform: translateY(-2px);
    }
    
    .nav-links {
      display: flex;
      gap: 0;
      align-items: center;
      background: rgba(248, 249, 250, 0.8);
      border-radius: 50px;
      padding: 0.5rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .nav-link {
      color: #64748b;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.1), transparent);
      transition: left 0.5s ease;
    }
    
    .nav-link:hover::before {
      left: 100%;
    }
    
    .nav-link:hover {
      color: #f97316;
      background: rgba(249, 115, 22, 0.1);
      transform: translateY(-1px);
    }
    
    .nav-link.active {
      color: #f97316;
      background: rgba(249, 115, 22, 0.15);
      font-weight: 600;
    }
    
    .user-dropdown {
      position: relative;
      display: inline-block;
      margin-left: 1rem;
    }
    
    .user-btn {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.8rem 1.2rem;
      background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
      color: white !important;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
      position: relative;
      overflow: hidden;
    }
    
    .user-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s ease;
    }
    
    .user-btn:hover::before {
      left: 100%;
    }
    
    .user-btn:hover {
      background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(249, 115, 22, 0.4);
    }
    
    .user-btn i.fa-chevron-down {
      font-size: 0.7rem;
      transition: transform 0.3s ease;
    }
    
    .user-dropdown.active .user-btn i.fa-chevron-down {
      transform: rotate(180deg);
    }
    
    .dropdown-menu {
      display: none;
      position: absolute;
      top: calc(100% + 15px);
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      min-width: 220px;
      border-radius: 20px;
      z-index: 9999;
      padding: 1rem 0;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .user-dropdown.active .dropdown-menu {
      display: block;
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    
    .dropdown-menu::before {
      content: '';
      position: absolute;
      top: -8px;
      right: 20px;
      width: 16px;
      height: 16px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-bottom: none;
      border-right: none;
      transform: rotate(45deg);
      backdrop-filter: blur(20px);
    }
    
    .dropdown-menu a,
    .dropdown-menu button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: #64748b !important;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 0;
      position: relative;
      overflow: hidden;
    }
    
    .dropdown-menu a::before,
    .dropdown-menu button::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 100%;
      background: linear-gradient(90deg, rgba(249, 115, 22, 0.1), transparent);
      transition: width 0.3s ease;
    }
    
    .dropdown-menu a:hover::before,
    .dropdown-menu button:hover::before {
      width: 100%;
    }
    
    .dropdown-menu a:hover,
    .dropdown-menu button:hover {
      color: #f97316 !important;
      background: rgba(249, 115, 22, 0.05);
      transform: translateX(5px);
    }
    
    .dropdown-menu i {
      width: 18px;
      color: #f97316;
      font-size: 1rem;
      transition: transform 0.2s ease;
    }
    
    .dropdown-menu a:hover i,
    .dropdown-menu button:hover i {
      transform: scale(1.1);
    }
    
    .dropdown-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.8), transparent);
      margin: 8px 16px;
    }
    
    /* Auth Buttons for non-logged in users */
    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .login-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem 1.2rem;
      color: #64748b !important;
      text-decoration: none;
      font-weight: 500;
      border-radius: 25px;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;
    }
    
    .login-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.1), transparent);
      transition: left 0.5s ease;
    }
    
    .login-btn:hover::before {
      left: 100%;
    }
    
    .login-btn:hover {
      color: #f97316 !important;
      background: rgba(249, 115, 22, 0.1);
      border-color: rgba(249, 115, 22, 0.2);
      transform: translateY(-1px);
    }
    
    .register-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem 1.2rem;
      background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
      color: white !important;
      border-radius: 25px;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
      position: relative;
      overflow: hidden;
    }
    
    .register-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s ease;
    }
    
    .register-btn:hover::before {
      left: 100%;
    }
    
    .register-btn:hover {
      background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(249, 115, 22, 0.4);
    }
    
    /* Search Icon - Remove this section */
    
    /* Mobile Hamburger */
    .hamburger {
      display: none;
      flex-direction: column;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .hamburger:hover {
      background: rgba(249, 115, 22, 0.1);
    }
    
    .hamburger span {
      width: 24px;
      height: 2px;
      background: #64748b;
      margin: 3px 0;
      transition: all 0.3s ease;
      border-radius: 2px;
    }
    
    .hamburger.active span:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }
    
    .hamburger.active span:nth-child(2) {
      opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }
    
    /* Mobile responsive */
    @media (max-width: 768px) {
      .nav-container {
        padding: 1rem;
      }
      
      .nav-center {
        position: static;
        transform: none;
      }
      
      .nav-links {
        position: fixed;
        left: -100%;
        top: 80px;
        flex-direction: column;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        width: 100%;
        padding: 2rem 0;
        transition: left 0.3s ease;
        border-radius: 0;
        border: none;
        border-top: 1px solid rgba(226, 232, 240, 0.5);
        gap: 0.5rem;
      }
      
      .nav-links.active {
        left: 0;
      }
      
      .nav-link {
        padding: 1rem 2rem;
        border-radius: 0;
        width: 100%;
        text-align: left;
      }
      
      .hamburger {
        display: flex;
      }
      
      .user-btn span {
        display: none;
      }
      
      .dropdown-menu {
        right: -10px;
        min-width: 200px;
      }
      
      .auth-buttons {
        gap: 0.5rem;
      }
      
      .login-btn span,
      .register-btn span {
        display: none;
      }
      
      .login-btn,
      .register-btn {
        padding: 0.6rem 1rem;
        font-size: 0.85rem;
      }
    }
    
    @media (max-width: 480px) {
      .nav-container {
        padding: 0.8rem 1rem;
      }
      
      .logo img {
        height: 40px;
      }
      
      .user-btn {
        padding: 0.6rem 1rem;
        font-size: 0.85rem;
      }
      
      .auth-buttons {
        gap: 0.3rem;
      }
      
      .login-btn,
      .register-btn {
        padding: 0.5rem 0.8rem;
        font-size: 0.8rem;
      }
    }
  `;
  header.appendChild(style);

  const container = document.createElement("div");
  container.className = "nav-container";

  const logo = document.createElement("a");
  logo.href = "#/";
  logo.className = "logo";
  
  const logoImg = document.createElement("img");
  logoImg.src = "/images/LOGO.png";
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
  
  console.log("Auth check:", { isLoggedIn, user }); // Debug log
  
  // Debug user data structure
  authService.debugUserData();
  
  // Base navigation links - always show these
  const baseLinks = [
    { text: "Trang Chủ", href: "#/" },
    { text: "Dịch Vụ", href: "#/services" }
  ];

  // Add history link for logged in users
  if (isLoggedIn && user) {
    baseLinks.push({ text: "Lịch Sử", href: "#/booking-history" });
  }

  baseLinks.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.href;
    a.className = "nav-link";
    a.textContent = link.text;
    
    // Add active class for current page
    if (window.location.hash === link.href || (window.location.hash === "" && link.href === "#/")) {
      a.classList.add("active");
    }
    
    nav.appendChild(a);
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
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isDropdownOpen = !isDropdownOpen;
      userDropdown.classList.toggle('active', isDropdownOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target)) {
        isDropdownOpen = false;
        userDropdown.classList.remove('active');
      }
    });

    // Close dropdown when pressing Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isDropdownOpen) {
        isDropdownOpen = false;
        userDropdown.classList.remove('active');
      }
    });

    // Add logout functionality
    const logoutBtn = dropdownMenu.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        authService.logout();
        window.location.reload();
      }
    });

    // Close dropdown when clicking on links
    const dropdownLinks = dropdownMenu.querySelectorAll('a');
    dropdownLinks.forEach(link => {
      link.addEventListener('click', () => {
        isDropdownOpen = false;
        userDropdown.classList.remove('active');
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
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
  });
  
  container.appendChild(hamburger);

  header.appendChild(container);

  // Add scroll effect
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScrollY = window.scrollY;
  });

  return header;
}