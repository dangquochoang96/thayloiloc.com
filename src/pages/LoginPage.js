import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { authService } from '../services/auth.service.js';

export function LoginPage() {
  const container = document.createElement('div');
  container.className = 'page-container';
  
  container.appendChild(Header());

  const main = document.createElement('main');
  main.className = 'container';
  main.style.minHeight = '60vh';
  main.style.display = 'flex';
  main.style.alignItems = 'center';
  main.style.justifyContent = 'center';
  main.style.padding = '2rem 0';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.width = '100%';
  card.style.maxWidth = '400px';

  card.innerHTML = `
    <h2 style="text-align: center; margin-bottom: 2rem;">Welcome Back</h2>
    <form id="login-form" style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <label for="phone" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Phone</label>
        <input type="text" id="phone" name="phone" required style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
      </div>
      <div>
        <label for="password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password</label>
        <input type="password" id="password" name="password" required style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
      </div>
      
      <div id="error-msg" style="color: red; font-size: 0.9rem; display: none;"></div>
      
      <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Login</button>
      
      <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted);">
        Don't have an account? <a href="#/register" style="color: var(--primary-color);">Register</a>
      </p>
    </form>
  `;

  const form = card.querySelector('#login-form');
  const errorMsg = card.querySelector('#error-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.style.display = 'none';
    const phone = form.phone.value;
    const pass = form.password.value;

    try {
      await authService.login(phone, pass);
      // If login successful, redirect to home/dashboard
      window.location.hash = '/';
      window.location.reload(); // To update header state
    } catch (err) {
      errorMsg.textContent = err.message || 'Login failed. Please check your credentials.';
      errorMsg.style.display = 'block';
    }
  });

  main.appendChild(card);
  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}
