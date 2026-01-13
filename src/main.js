import './styles/main.css';
import { Router } from './utils/router.js';
import { ensureFontAwesome } from './utils/icons.js';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { BookingPage } from './pages/BookingPage.js';
import { BookingHistoryPage } from './pages/BookingHistoryPage.js';
import { BookingDetailPage } from './pages/BookingDetailPage.js';
import { FilterHistoryPage } from './pages/FilterHistoryPage.js';
import { ServicesPage } from './pages/ServicesPage.js';

const routes = {
  '/': {
    render: HomePage
  },
  '/login': {
    render: LoginPage
  },
  '/register': {
    render: RegisterPage
  },
  '/profile': {
    render: ProfilePage
  },
  '/services': {
    render: ServicesPage
  },
  '/booking': {
    render: BookingPage
  },
  '/booking-history': {
    render: BookingHistoryPage
  },
  '/booking-detail': {
    render: BookingDetailPage
  },
  '/filter-history': {
    render: FilterHistoryPage
  },
  '*': {
    render: () => {
      const el = document.createElement('div');
      el.innerHTML = '<h1 style="text-align:center; padding: 2rem;">404 - Page Not Found</h1>';
      return el;
    }
  }
};

// Ensure Font Awesome is loaded before starting the router
ensureFontAwesome().then(() => {
  console.log('Starting router with Font Awesome loaded');
  new Router(routes);
}).catch((error) => {
  console.warn('Font Awesome failed to load, continuing anyway:', error);
  new Router(routes);
});
