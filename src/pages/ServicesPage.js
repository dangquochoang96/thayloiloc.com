import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { servicesService } from '../services/services.service.js';
import '../styles/services/services-page.css';

export function ServicesPage() {
  const container = document.createElement('div');
  
  // Add Header
  container.appendChild(Header());

  let allServices = [];
  let loading = true;

  // Service icons mapping with FontAwesome
  const serviceIcons = {
    'vệ sinh': 'fa-broom',           // Cleaning
    'thay lõi': 'fa-filter',         // Filter replacement
    'sửa chữa': 'fa-wrench',         // Repair
    'sửa': 'fa-wrench',              // Repair (short form)
    'bảo dưỡng': 'fa-tools',         // Maintenance
    'lắp đặt': 'fa-hammer',          // Installation
    'tư vấn': 'fa-comments',         // Consultation
    'chuyển': 'fa-truck',            // Moving/Transfer
    'default': 'fa-cog'              // Default
  };

  const getServiceIcon = (serviceName) => {
    const lowerName = (serviceName || '').toLowerCase();
    
    // Priority order: check specific keywords first
    const priorityOrder = [
      'vệ sinh',
      'thay lõi', 
      'lắp đặt',
      'bảo dưỡng',
      'sửa chữa',
      'sửa',
      'tư vấn',
      'chuyển'
    ];
    
    for (const key of priorityOrder) {
      if (lowerName.includes(key)) {
        return serviceIcons[key];
      }
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