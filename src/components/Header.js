import { authService } from '../services/auth.service.js';

export function Header() {
  const header = document.createElement('header');
  header.className = 'site-header';
  
  // Basic styles for header to ensure it looks good immediately
  const style = document.createElement('style');
  style.textContent = `
    .site-header {
      background: #fff;
      box-shadow: var(--shadow-sm);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    .nav-link {
      color: var(--text-main);
      text-decoration: none;
      font-weight: 500;
    }
    .nav-link:hover {
      color: var(--primary-color);
    }
  `;
  header.appendChild(style);

  const container = document.createElement('div');
  container.className = 'container nav-container';

  const logo = document.createElement('a');
  logo.href = '#/';
  logo.className = 'logo';
  logo.textContent = 'HandymanService';
  container.appendChild(logo);

  const nav = document.createElement('nav');
  nav.className = 'nav-links';

  const isLoggedIn = authService.isAuthenticated();
  const baseLinks = [
    { text: 'Home', href: '#/' },
  ];

  baseLinks.forEach(link => {
    const a = document.createElement('a');
    a.href = link.href;
    a.className = 'nav-link';
    a.textContent = link.text;
    nav.appendChild(a);
  });

  if (isLoggedIn) {
     const bookingLink = document.createElement('a');
     bookingLink.href = '#/booking';
     bookingLink.className = 'nav-link';
     bookingLink.textContent = 'Book Now';
     nav.appendChild(bookingLink);

     const logoutBtn = document.createElement('button');
     logoutBtn.className = 'btn btn-secondary';
     logoutBtn.textContent = 'Logout';
     logoutBtn.onclick = () => {
       authService.logout();
       window.location.reload();
     };
     nav.appendChild(logoutBtn);
  } else {
    const loginLink = document.createElement('a');
    loginLink.href = '#/login';
    loginLink.className = 'nav-link';
    loginLink.textContent = 'Login';
    nav.appendChild(loginLink);

    const registerLink = document.createElement('a');
    registerLink.href = '#/register';
    registerLink.className = 'btn btn-primary';
    registerLink.textContent = 'Register';
    nav.appendChild(registerLink);
  }

  container.appendChild(nav);
  header.appendChild(container);

  return header;
}
