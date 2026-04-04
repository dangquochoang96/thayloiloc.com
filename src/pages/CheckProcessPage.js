import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import '../styles/process/check-process.css';
import '../styles/process/process.css';

import checkProcessContent from '../templates/process/check-process-page.html?raw';

export function CheckProcessPage() {
  const container = document.createElement('div');
  container.appendChild(Header());

  const page = document.createElement('main');
  page.className = 'check-process-page';

  const main = document.createElement('div');
  main.className = 'process-main';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';

  // Page header
  const pageHeader = document.createElement('div');
  pageHeader.className = 'page-header';
  pageHeader.innerHTML = `
    <h1><i class="fas fa-search-plus"></i> Quy Trình Kiểm Tra Máy Lọc Nước</h1>
    <p>Hướng dẫn chi tiết quy trình kiểm tra và đánh giá tình trạng máy lọc nước</p>
    <div class="breadcrumb">
      <a href="#/">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <a href="javascript:void(0)">Quy trình sửa chữa</a>
      <i class="fas fa-chevron-right"></i>
      <span>Quy trình kiểm tra</span>
    </div>
  `;
  containerDiv.appendChild(pageHeader);

  // Content section
  const contentSection = document.createElement('div');
  contentSection.className = 'process-content';
  contentSection.innerHTML = checkProcessContent;
  containerDiv.appendChild(contentSection);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  return container;
}
