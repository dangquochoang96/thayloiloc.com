import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import '../styles/process/maintenance-process.css';

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
  contentSection.innerHTML = `
    <div class="content-card">
      <div class="maintenance-table-wrapper">
      <img src="/public/images/Screenshot 2026-01-08 160523.png">
      <h2>I. QUY TRÌNH VỆ SINH – BẢO DƯỠNG – KIỂM TRA MÁY LỌC NƯỚC RO</h2>
      <img src="/public/images/Screenshot 2026-01-08 172541.png">
      <h2>II.CÁC CÔNG VIỆC THỰC HIỆN BẢO DƯỠNG, VỆ SINH, KIỂM TRA MÁY LỌC NƯỚC RO:</h2>
        <table class="maintenance-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Công Việc</th>
              <th>Báo Cáo Thực Trạng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="stt-cell">1</td>
              <td>
                - CHỤP ẢNH MÁY GỬI LÊN NHÓM ZALO<br><br>
              <h4>  - Kiểm tra rò rỉ nước của máy: khẩu khóa, dây nước, bồn chậu rửa.</h4>
              </td>
              <td></td>
            </tr>
            <tr>
              <td rowspan="5" class="stt-cell">2</td>
              <td class="section-title">Kiểm tra thực trạng hoạt động của máy:</td>
              <td></td>
            </tr>
            <tr>
              <td>- Kiểm tra Bình áp: kiểm tra bình áp xem nước ra yếu hay mạnh, nước chảy yếu bình áp bị thủng quả bóng hơi cần thay</td>
              <td></td>
            </tr>
            <tr>
              <td>
                <h4>- Kiểm tra Màng RO (số 4): đo để đánh khiết TDS của nước sau màng<br>
                Nếu TDS > 20 nên thay mới đảm bảo màng hoạt động tốt<br>
                Nếu TDS < 20 thì chưa cần thay<br>
                Nếu nước sau màng quá ít gần tắc thì nên thay để tổ tốn nước thải</h4>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>- Kiểm tra Bơm nguồn: có hoạt động không? Nguồn có bị meo không?</td>
              <td></td>
            </tr>
            <tr>
              <td>- Kiểm tra chế độ đóng ngắt máy: nếu máy không đóng ngắt được sẽ rất tốn nước nhà khách</td>
              <td></td>
            </tr>
            <tr>
              <td </td>
              <td>
                - Kiểm tra vòi nước ra: xem có bị đỏ hay lỏng.<br>
                Nếu bị lỏng thì siết lại cho chặt<br>
                Nếu bị đỏ nước sẽ thay vòi
              </td>
              <td></td>
            </tr>
            <tr>
              <td class="stt-cell">3</td>
              <td>- Vệ sinh các lọc 123: tháo lõi 123 và vệ sinh cốc. Nếu lõi 123 bẩn thì nên thay, chỉ cách phân biệt lõi lọc</td>
              <td></td>
            </tr>
            <tr>
              <td class="stt-cell">4</td>
              <td>- Vệ sinh lại máy và xung quanh máy cho sạch sẽ</td>
              <td></td>
            </tr>
            <tr>
              <td class="stt-cell">5</td>
              <td>- Đưa máy về vị trí cũ và bàn giao cho khách (dán tem, tải APP, đặt lịch)
              
              - Hóa đơn, ảnh lõi thay kèm vòi, ảnh khu vực máy có khẩu và tem dán, ảnh máy khách cài APP</td>
              <td></td>
            </tr>
          </tbody>
      </div>
      <h2> III. QUY TRÌNH VỆ SINH – BẢO DƯỠNG – KIỂM TRA MÁY LỌC NƯỚC NANO</h2>


  `;
  containerDiv.appendChild(contentSection);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  return container;
}
