import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import '../styles/process/maintenance-process.css';
import '../styles/process/process.css';

import maintenanceProcessPage from "../templates/process/maintenance-process-page.html?raw";

export function MaintenanceProcessPage() {
  const container = document.createElement('div');
  container.appendChild(Header());

  const page = document.createElement('main');
  page.className = 'maintenance-process-page';

  const main = document.createElement('div');
  main.className = 'process-main';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';

  // Page header
  const pageHeader = document.createElement('div');
  pageHeader.className = 'page-header';
  pageHeader.innerHTML = `
    <h1><i class="fas fa-broom"></i> Quy Trình Vệ Sinh Bảo Dưỡng</h1>
    <p>Hướng dẫn chi tiết quy trình vệ sinh và bảo dưỡng máy lọc nước định kỳ</p>
    <div class="breadcrumb">
      <a href="#/">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <a href="javascript:void(0)">Quy trình sửa chữa</a>
      <i class="fas fa-chevron-right"></i>
      <span>Quy trình vệ sinh bảo dưỡng</span>
    </div>
  `;
  containerDiv.appendChild(pageHeader);

  // Content section
  const contentSection = document.createElement('div');
  contentSection.className = 'process-content';
  contentSection.innerHTML = maintenanceProcessPage;
  containerDiv.appendChild(contentSection);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  return container;
}
