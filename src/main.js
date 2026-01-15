import './styles/main.css';
import './utils/navigation.js'; // Import global navigation functions
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
import { ProductFilterHistoryPage } from './pages/ProductFilterHistoryPage.js';
import { FilterHistoryDetailPage } from './pages/FilterHistoryDetailPage.js';
import { ServicesPage } from './pages/ServicesPage.js';
import { TrainingContentPage } from './pages/TrainingContentPage.js';
import { CheckProcessPage } from './pages/CheckProcessPage.js';
import { MaintenanceProcessPage } from './pages/MaintenanceProcessPage.js';
import { FilterReplacementPage } from './pages/FilterReplacementPage.js';
import { NewsPage } from './pages/NewsPage.js';
import { NewsDetailPage } from './pages/NewsDetailPage.js';
import { HotlinePage } from './pages/HotlinePage.js';
import { TechnicianDetailPage } from './pages/TechnicianDetailPage.js';

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
  '/news': {
    render: NewsPage
  },
  '/news/:id': {
    render: NewsDetailPage
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
  '/product-filter-history': {
    render: ProductFilterHistoryPage
  },
  '/filter-history-detail': {
    render: FilterHistoryDetailPage
  },
  '/training-content': {
    render: TrainingContentPage
  },
  '/check-process': {
    render: CheckProcessPage
  },
  '/maintenance-process': {
    render: MaintenanceProcessPage
  },
  '/filter-replacement': {
    render: FilterReplacementPage
  },
  '/news': {
    render: NewsPage
  },
  '/news-detail': {
    render: NewsDetailPage
  },
  '/hotline': {
    render: HotlinePage
  },
  '/technician-detail': {
    render: TechnicianDetailPage
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
