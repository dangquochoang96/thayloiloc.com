import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import '../styles/process/filter-replacement.css';

import filterReplacementPage from '../templates/process/filter-replacement-page.html?raw';

export function FilterReplacementPage() {
  const container = document.createElement('div');
  container.appendChild(Header());

  const page = document.createElement('main');
  page.className = 'filter-replacement-page';

  const main = document.createElement('div');
  main.className = 'process-main';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';

  // Page header
  const pageHeader = document.createElement('div');
  pageHeader.className = 'page-header';
  pageHeader.innerHTML = `
    <h1><i class="fas fa-sync-alt"></i> Quy Trình Thay Lõi Lọc</h1>
    <p>Hướng dẫn chi tiết quy trình thay thế lõi lọc cho máy lọc nước</p>
    <div class="breadcrumb">
      <a href="#/">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <a href="javascript:void(0)">Quy trình sửa chữa</a>
      <i class="fas fa-chevron-right"></i>
      <span>Quy trình thay lõi lọc</span>
    </div>
  `;
  containerDiv.appendChild(pageHeader);

  // Content section
  const contentSection = document.createElement('div');
  contentSection.className = 'process-content';
  contentSection.innerHTML = filterReplacementPage;
  containerDiv.appendChild(contentSection);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  return container;
}
