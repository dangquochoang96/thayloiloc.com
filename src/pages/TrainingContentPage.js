import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import '../styles/process/training-content.css';

export function TrainingContentPage() {
  const container = document.createElement('div');
  container.appendChild(Header());

  const page = document.createElement('main');
  page.className = 'training-content-page';

  const main = document.createElement('div');
  main.className = 'process-main';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';

  // Page header
  const pageHeader = document.createElement('div');
  pageHeader.className = 'page-header';
  pageHeader.innerHTML = `
    <h1><i class="fas fa-graduation-cap"></i> Nội Dung Đào Tạo</h1>
    <p>Chương trình đào tạo chuyên nghiệp về kỹ thuật sửa chữa và bảo dưỡng máy lọc nước</p>
    <div class="breadcrumb">
      <a href="#/">Trang chủ</a>
      <i class="fas fa-chevron-right"></i>
      <a href="javascript:void(0)">Quy trình sửa chữa</a>
      <i class="fas fa-chevron-right"></i>
      <span>Nội dung đào tạo</span>
    </div>
  `;
  containerDiv.appendChild(pageHeader);

  // Content section
  const contentSection = document.createElement('div');
  contentSection.className = 'process-content';
  contentSection.innerHTML = `
    <div class="content-card">

      <h3>      CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ DỊCH VỤ SOCBAY</h3>
      <h2>           CHƯƠNG TRÌNH TẬP HUẤN</h2>
    </div>
    <div class="training-table-wrapper">
      <table class="training-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>CHƯƠNG TRÌNH</th>
            <th>NGÀY</th>
            <th>KẾT QUẢ (OK/NG)</th>
            <th>NGƯỜI HƯỚNG DẪN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="2" class="stt-cell">1</td>
            <td>
              <strong>1.Giới thiệu mục tiêu của Cty:</strong>
              <ul>
                <li>Mục tiêu Cty, Logo, Sologan</li>
                <li>Web, Page FB, HOTLINE, APP</li>
                <li>Trang phục</li>
                <li>Dụng cụ</li>
              </ul>
              <strong>2.Gặp gỡ và giới thiệu với mọi người</strong>
            </td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr class="section-header">
            <td colspan="4"><strong>Tập huấn Sản Phẩm/Dịch Vụ</strong></td>
          </tr>
          <tr>
            <td rowspan="7" class="stt-cell">2</td>
            <td>1.Cấu tạo máy lọc nước RO/NANO (trên máy thực tế)</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>2.Chức năng các loại lõi lọc (bảng báo giá + lõi lọc thực tế)</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>3.Cách thức thực hiện tháo lắp máy / lõi lọc (trên máy thực tế)</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>4.Quy trình kiểm tra máy (Tài liệu + máy thực tế)</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>5.Thực hiện theo quy trình VSBD RO/NANO (Tài liệu + máy thực tế)</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>6.Thực hiện theo quy trình Thay lõi RO/NANO (Tài liệu + máy thực tế) + tìm hiểu nguồn nước các khu vực</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>7.Đọc bảng mã lỗi, các vấn đề hay gặp của máy RO/NANO (Tài liệu)</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td class="stt-cell">3</td>
            <td>Cách thức tư vấn Khách Hàng, các kinh nghiệm phục vụ Khách Hàng, luôn biết nói lời CẢM ƠN! (Tài liệu + Chia sẻ kinh nghiệm)</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td rowspan="4" class="stt-cell">4</td>
            <td>Đi thực tế theo Kỹ Thuật Khác, mỗi ngày theo 1 Kỹ thuật (2 đơn / ngày)</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td class="sub-item">Ngày 1</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td class="sub-item">Ngày 2</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td class="sub-item">Ngày 3</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr class="summary-row">
            <td class="stt-cell">5</td>
            <td><strong>TỔNG KẾT: GoodLuck!</strong><br>Bàn giao dụng cụ, trang phục, các giấy tờ kèm theo</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
  containerDiv.appendChild(contentSection);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  return container;
}
