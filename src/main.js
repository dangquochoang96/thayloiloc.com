import './styles/main.css';
import { Router } from './utils/router.js';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { BookingPage } from './pages/BookingPage.js';

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
  '/booking': {
    render: BookingPage
  },
  '*': {
    render: () => {
      const el = document.createElement('div');
      el.innerHTML = '<h1 style="text-align:center; padding: 2rem;">404 - Page Not Found</h1>';
      return el;
    }
  }
};

new Router(routes);
