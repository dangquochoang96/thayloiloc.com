import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { servicesService } from '../services/services.service.js';

export function ServicesPage() {
  const container = document.createElement('div');
  
  // Add Header
  container.appendChild(Header());

  let allServices = [];
  let loading = true;

  // Service icons mapping
  const serviceIcons = {
    'góp ý': 'fa-comment-dots',
    'khiếu nại': 'fa-comment-dots',
    'quản lý': 'fa-clipboard-list',
    'đơn hàng': 'fa-clipboard-list',
    'vệ sinh': 'fa-broom',
    'sửa': 'fa-wrench',
    'thay': 'fa-sync-alt',
    'lõi': 'fa-filter',
    'bảo dưỡng': 'fa-tools',
    'default': 'fa-cog'
  };

  const getServiceIcon = (name) => {
    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(serviceIcons)) {
      if (lowerName.includes(key)) return icon;
    }
    return serviceIcons.default;
  };

  const loadServices = async () => {
    try {
      const result = await servicesService.getListService();
      
      console.log('Services API Response:', result);
      
      let services = [];
      if (result.data && Array.isArray(result.data)) {
        services = result.data;
      } else if (Array.isArray(result)) {
        services = result;
      }

      allServices = services;
      loading = false;
      updateDisplay();
    } catch (error) {
      console.error('Error loading services:', error);
      loading = false;
      const loadingState = document.getElementById('servicesLoading');
      if (loadingState) {
        loadingState.innerHTML = `
          <i class="fas fa-exclamation-triangle" style="font-size:2rem; color:#dc3545;"></i>
          <p style="margin-top:10px; color:#666;">Không thể tải dịch vụ. Vui lòng thử lại.</p>
        `;
      }
    }
  };

  const selectService = (serviceId, serviceName) => {
    // Navigate to booking page with selected service
    window.location.hash = `#/booking?service_id=${serviceId}&service_name=${encodeURIComponent(serviceName)}`;
  };

  const displayServices = (services) => {
    const container = document.getElementById('serviceCards');
    if (!container) return;

    container.style.display = 'grid';
    container.innerHTML = '';

    services.forEach(service => {
      const icon = getServiceIcon(service.name || service.ten_dich_vu || '');
      const card = document.createElement('div');
      card.className = 'service-option';
      card.dataset.serviceId = service.id;
      card.dataset.serviceName = service.name || service.ten_dich_vu || 'Dịch vụ';

      card.innerHTML = `
        <div class="service-icon">
          <i class="fas ${icon}"></i>
        </div>
        <h3>${service.name || service.ten_dich_vu || 'Dịch vụ'}</h3>
        <p class="service-type">${service.loai_dich_vu || service.service_type || 'Dịch vụ thường'}</p>
        <button class="btn btn-outline" onclick="window.location.hash='#/booking'">
          Chọn Dịch Vụ
        </button>
      `;
      container.appendChild(card);
    });

    // If no services
    if (services.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:40px;">
          <i class="fas fa-inbox" style="font-size:3rem; color:#ccc;"></i>
          <p style="margin-top:15px; color:#666;">Chưa có dịch vụ nào</p>
        </div>
      `;
    }
  };

  const updateDisplay = () => {
    const loadingState = document.getElementById('servicesLoading');
    const serviceCards = document.getElementById('serviceCards');
    
    if (loadingState) {
      loadingState.style.display = loading ? 'block' : 'none';
    }
    if (serviceCards) {
      serviceCards.style.display = loading ? 'none' : 'grid';
    }
    
    if (!loading) {
      displayServices(allServices);
    }
  };

  const page = document.createElement('main');
  page.className = 'services-page';

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .services-main {
      padding: 100px 0 60px;
      min-height: 70vh;
      background: #f8f9fa;
    }

    .page-header {
      text-align: center;
      margin-bottom: 60px;
    }

    .page-header h1 {
      font-size: 2.5rem;
      color: #1a1a2e;
      margin-bottom: 15px;
      font-weight: 700;
    }

    .page-header h1 i {
      color: #F97316;
      margin-right: 15px;
    }

    .page-header p {
      color: #666;
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
      font-size: 0.9rem;
    }

    .breadcrumb a {
      color: #F97316;
      text-decoration: none;
    }

    .breadcrumb i {
      color: #ccc;
      font-size: 0.7rem;
    }

    .breadcrumb span {
      color: #666;
    }

    .service-selection {
      padding: 0;
    }

    .service-selection h2 {
      text-align: center;
      font-size: 2.2rem;
      color: #1a1a2e;
      margin-bottom: 50px;
      font-weight: 700;
    }

    .service-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .service-option {
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      border-radius: 28px;
      padding: 40px 25px 35px;
      text-align: center;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.08);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      border: none;
      position: relative;
      overflow: hidden;
    }

    .service-option::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #F97316, #34ce57, #7ed957);
      transform: scaleX(0);
      transition: transform 0.4s;
    }

    .service-option::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(40, 167, 69, 0.1) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.4s;
    }

    .service-option:hover::before {
      transform: scaleX(1);
    }

    .service-option:hover::after {
      opacity: 1;
    }

    .service-option:hover {
      transform: translateY(-15px) scale(1.02);
      box-shadow: 0 25px 70px rgba(40, 167, 69, 0.2);
    }

    .service-option .service-icon {
      width: 100px;
      height: 100px;
      background: linear-gradient(145deg, #e8f5e9, #c8e6c9);
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 25px;
      position: relative;
      transition: all 0.4s;
      z-index: 1;
    }

    .service-option:hover .service-icon {
      background: linear-gradient(145deg, #F97316, #34ce57);
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 15px 35px rgba(40, 167, 69, 0.3);
    }

    .service-option .service-icon i {
      font-size: 2.5rem;
      color: #F97316;
      transition: all 0.4s;
    }

    .service-option:hover .service-icon i {
      color: white;
    }

    .service-option h3 {
      font-size: 1.1rem;
      color: #1a1a2e;
      margin-bottom: 15px;
      min-height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      line-height: 1.4;
      position: relative;
      z-index: 1;
    }

    .service-option .service-type {
      font-size: 0.75rem;
      color: #F97316;
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      padding: 8px 16px;
      border-radius: 25px;
      display: inline-block;
      margin-bottom: 22px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      z-index: 1;
    }

    .service-option .btn-outline {
      width: 100%;
      padding: 15px 20px;
      font-size: 0.9rem;
      border: none;
      background: linear-gradient(135deg, #f0f0f0, #e5e5e5);
      color: #F97316;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      z-index: 1;
    }

    .service-option:hover .btn-outline {
      background: linear-gradient(135deg, #F97316, #34ce57);
      color: white;
      box-shadow: 0 10px 30px rgba(40, 167, 69, 0.4);
      transform: translateY(-2px);
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-state i {
      font-size: 3rem;
      color: #F97316;
      margin-bottom: 20px;
    }

    .loading-state p {
      color: #666;
      font-size: 1.1rem;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .service-cards {
        grid-template-columns: repeat(2, 1fr);
      }

      .service-option {
        padding: 35px 20px 30px;
      }

      .page-header h1 {
        font-size: 2rem;
      }
    }

    @media (max-width: 500px) {
      .service-cards {
        grid-template-columns: 1fr;
      }

      .page-header h1 {
        font-size: 1.8rem;
      }
    }
  `;
  page.appendChild(style);

  // Main content
  const main = document.createElement('main');
  main.className = 'services-main';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';

  // Page header
  const pageHeader = document.createElement('div');
  pageHeader.className = 'page-header';
  pageHeader.innerHTML = `
    <h1><i class="fas fa-concierge-bell"></i> Dịch Vụ Của Chúng Tôi</h1>
    <p>Chọn dịch vụ phù hợp với nhu cầu của bạn. Chúng tôi cung cấp đầy đủ các dịch vụ bảo dưỡng, sửa chữa và hỗ trợ máy lọc nước chuyên nghiệp.</p>
    <div class="breadcrumb">
      <a href="#/">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <span>Dịch vụ</span>
    </div>
  `;
  containerDiv.appendChild(pageHeader);

  // Service selection
  const serviceSelection = document.createElement('div');
  serviceSelection.className = 'service-selection';

  // Loading state
  const loadingState = document.createElement('div');
  loadingState.className = 'loading-state';
  loadingState.id = 'servicesLoading';
  loadingState.style.display = loading ? 'block' : 'none';
  loadingState.innerHTML = `
    <i class="fas fa-spinner fa-spin"></i>
    <p>Đang tải dịch vụ...</p>
  `;
  serviceSelection.appendChild(loadingState);

  // Service cards
  const serviceCards = document.createElement('div');
  serviceCards.className = 'service-cards';
  serviceCards.id = 'serviceCards';
  serviceCards.style.display = loading ? 'none' : 'grid';
  serviceSelection.appendChild(serviceCards);

  containerDiv.appendChild(serviceSelection);
  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);

  // Load services data
  setTimeout(() => {
    loadServices();
  }, 100);

  // Add Footer
  container.appendChild(Footer());

  return container;
}