import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { servicesService } from '../services/services.service.js';

export function HomePage() {
  const container = document.createElement('div');
  
  const header = Header();
  container.appendChild(header);

  const main = document.createElement('main');
  
  // Hero Section
  const heroSection = document.createElement('section');
  heroSection.style.padding = '4rem 0';
  heroSection.style.backgroundColor = '#fff';
  heroSection.innerHTML = `
    <div class="container" style="text-align: center;">
      <h1 style="font-size: 3rem; font-weight: 800; margin-bottom: 1.5rem; line-height: 1.2;">
        Your Trusted Partner for <br/>
        <span style="color: var(--primary-color)">Home Maintenance</span>
      </h1>
      <p style="font-size: 1.25rem; color: var(--text-muted); max-width: 600px; margin: 0 auto 2rem;">
        From repairs to installations, we handle it all with professionalism and care. Book a service today and experience the difference.
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <a href="#/booking" class="btn btn-primary" style="padding: 0.75rem 2rem; font-size: 1.1rem;">Book a Service</a>
        <a href="#/services" class="btn btn-secondary" style="padding: 0.75rem 2rem; font-size: 1.1rem;">View Services</a>
      </div>
    </div>
  `;
  main.appendChild(heroSection);

  // Features Section
  const featuresSection = document.createElement('section');
  featuresSection.style.padding = '4rem 0';
  featuresSection.innerHTML = `
    <div class="container">
      <h2 style="text-align: center; margin-bottom: 3rem; font-size: 2rem;">Why Choose Us</h2>
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
        <div class="card">
          <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Expert Technicians</h3>
          <p style="color: var(--text-muted);">Our team consists of certified and experienced professionals.</p>
        </div>
        <div class="card">
          <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Transparent Pricing</h3>
          <p style="color: var(--text-muted);">No hidden fees. You pay what you see.</p>
        </div>
        <div class="card">
          <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Satisfaction Guaranteed</h3>
          <p style="color: var(--text-muted);">We are committed to delivering top-notch service quality.</p>
        </div>
      </div>
    </div>
  `;
  main.appendChild(featuresSection);

  // Service Section
  const serviceSection = document.createElement('section');
  serviceSection.className = 'container';
  serviceSection.style.padding = '3rem 0';
  
  const serviceTitle = document.createElement('h1');
  serviceTitle.style.textAlign = 'center';
  serviceTitle.style.marginBottom = '3rem';
  serviceTitle.textContent = 'Our Services';
  serviceSection.appendChild(serviceTitle);

  const servicesGrid = document.createElement('div');
  servicesGrid.className = 'grid';
  servicesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
  
  // Loading state
  servicesGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-muted);">Loading services...</p>';
  serviceSection.appendChild(servicesGrid);

  // Fetch services from API
  servicesService.getListService()
    .then(response => {
      if (response.code === 1 && response.data) {
        // Sort by order field
        const services = response.data.sort((a, b) => parseInt(a.order) - parseInt(b.order));
        
        // Clear loading message
        servicesGrid.innerHTML = '';
        
        // Render services
        services.forEach(service => {
          const card = document.createElement('div');
          card.className = 'card';
          card.style.cursor = 'pointer';
          card.style.transition = 'transform 0.2s';
          
          card.innerHTML = `
            <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${service.name}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">${service.des ? service.des.substring(0, 100).replace(/<[^>]*>/g, '') + '...' : 'Dịch vụ máy lọc nước'}</p>
          `;
          
          // Add hover effect
          card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
          });
          card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
          });
          
          // Click to navigate to booking
          card.addEventListener('click', () => {
            window.location.hash = '/booking';
          });
          
          servicesGrid.appendChild(card);
        });
      } else {
        servicesGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: red;">Failed to load services</p>';
      }
    })
    .catch(error => {
      console.error('Error loading services:', error);
      servicesGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: red;">Error loading services. Please try again later.</p>';
    });

  main.appendChild(serviceSection);

  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}
