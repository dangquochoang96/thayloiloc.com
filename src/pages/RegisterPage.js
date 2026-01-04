import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { authService } from '../services/auth.service.js';

export function RegisterPage() {
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
  card.style.maxWidth = '500px';

  card.innerHTML = `
    <h2 style="text-align: center; margin-bottom: 2rem;">Create Account</h2>
    <form id="register-form" style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <label for="name" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Name</label>
        <input type="text" id="name" name="name" required style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
      </div>
      <div>
        <label for="phone" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Phone</label>
        <input type="text" id="phone" name="phone" required style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
      </div>
      <div>
        <label for="password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password</label>
        <input type="password" id="password" name="password" required style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
      </div>
      
      <div id="error-msg" style="color: red; font-size: 0.9rem; display: none;"></div>
      <div id="success-msg" style="color: green; font-size: 0.9rem; display: none;">Registration successful! Redirecting...</div>
      
      <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Register</button>
      
      <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted);">
        Already have an account? <a href="#/login" style="color: var(--primary-color);">Login</a>
      </p>
    </form>
  `;

  const form = card.querySelector('#register-form');
  const errorMsg = card.querySelector('#error-msg');
  const successMsg = card.querySelector('#success-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    
    const name = form.name.value;
    const phone = form.phone.value;
    const pass = form.password.value;

    try {
      await authService.register(phone, name, pass);
      successMsg.style.display = 'block';
      setTimeout(() => {
        window.location.hash = '/login';
      }, 1500);
    } catch (err) {
      errorMsg.textContent = err.message || 'Registration failed.';
      errorMsg.style.display = 'block';
    }
  });

  main.appendChild(card);
  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}
