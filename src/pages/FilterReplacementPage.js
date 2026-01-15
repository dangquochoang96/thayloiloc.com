import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import '../styles/process/filter-replacement.css';

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
  contentSection.innerHTML = `
    <div ">
      
      
      </div>
      <img src="/images/Screenshot 2026-01-08 160523.png" style="display: block; margin: 1rem auto; max-width: 100%;">
      <h2>QUY TRÌNH THAY LÕI LỌC NƯỚC</h2>
      <p>Bao gồm 7 bước như hình dưới - Quý Khách Hàng hãy cùng kiểm tra quy trình Thay lõi lọc nước ngay tại nhà mình cùng với SOCBAY.</p>
      <img src="/images/Screenshot 2026-01-09 093327.png" style="display: block; margin: 1rem auto; max-width: 100%;">
      <h3>MÔ HÌNH 5S - NHẬT BẢN ĐƯỢC ÁP DỤNG CHO THAY LÕI LỌC NƯỚC TẠI NHÀ</h3>

    </div>
    <div style="max-width: 900px; margin: auto; font-family: Arial, sans-serif; text-align: auto;">
    

    <p style="text-align: left; line-height: 1.6; color: #333;">
        Kiểm tra máy trước khi thay lõi lọc là công việc cần thiết để phát hiện máy có bị lỗi gì không? 
        Từ đó thông báo với khách hàng để có hướng xử lý kịp thời.
    </p>

    <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
            <tr style="text-align: center; font-weight: bold;">
                <th style="padding: 10px;">5S</th>
                <th style="padding: 10px;">Ý Nghĩa</th>
                <th style="padding: 10px;">Yêu Cầu</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: center; font-weight: bold; padding: 10px;">S1</td>
                <td style="padding: 10px;"><span style="font-weight: bold;">Seiri</span> - Sàng Lọc</td>
                <td style="padding: 10px;">Lựa chọn thay lõi lọc chính hãng, thay những lõi lọc đúng hạn - Loại bỏ những lõi lọc không chính hãng, không thay những lõi lọc khi chưa đến hạn</td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold; padding: 10px;">S2</td>
                <td style="padding: 10px;"><span style="font-weight: bold;">Seiton</span> - Sắp Xếp</td>
                <td style="padding: 10px;">Sắp xếp máy, dây nước cho khách gọn gàng, vòi nước ra vặn chặt. Sắp xếp đồ đạc gầm tủ bếp gọn gàng</td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold; padding: 10px;">S3</td>
                <td style="padding: 10px;"><span style="font-weight: bold;">Seiso</span> - Sạch Sẽ</td>
                <td style="padding: 10px;">Giữ gìn trang phục cá nhân, lõi lọc thiết bị, dụng cụ luôn sạch sẽ. Lau khô, làm sạch khu vực xung quanh máy lọc nước</td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold; padding: 10px;">S4</td>
                <td style="padding: 10px;"><span style="font-weight: bold;">Seiketsu</span> - Săn Sóc</td>
                <td style="padding: 10px;">Duy trì 3S (Sàng lọc, Sắp xếp, Sạch sẽ) mọi lúc mọi nơi</td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold; padding: 10px;">S5</td>
                <td style="padding: 10px;"><span style="font-weight: bold;">Shitsuke</span> - Sẵn Sàng</td>
                <td style="padding: 10px;">Luôn tuân thủ 3S (Sàng lọc, Sắp xếp, Sạch sẽ) một cách tự giác, tự nguyện</td>
            </tr>
        </tbody>
    </table>
</div>
<p>    .</p> 
<div style="max-width: 900px; margin: auto; font-family: Arial, sans-serif;"> 
 <table border="1" style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
            <tr style="background-color: #f2f2f2; text-align: center;">
                <th style="padding: 10px; width: 50px;">STT</th>
                <th style="padding: 10px;">Các Công Việc Thay Lõi Lọc Nước RO</th>
                <th style="padding: 10px; width: 100px;">Thực Trạng (OK/NG)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: center; font-weight: bold;">1</td>
                <td style="padding: 10px;">
                    <b style="font-size: 16px;">Kiểm tra tình trạng máy lọc nước:</b><br>
                    - CHỤP ẢNH MÁY GỬI LÊN NHÓM ZALO<br>
                    - Kiểm tra nước có ra không?<br>
                    - Kiểm tra màng RO - lõi số 4 trong máy + đo TDS sau màng, kiểm tra nước thải<br>
                    - Kiểm tra bình áp<br>
                    - Kiểm tra bơm nguồn<br>
                    - Kiểm tra đóng ngắt máy<br>
                    - Kiểm tra khẩu khóa, dây, vòi máy lọc nước (vòi lỏng bắt buộc vặn lại)<br>
                    - Kiểm tra rò rỉ nước, hệ thống cấp nước, đường nước thải bồn chậu
                </td>
                <td></td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold;">2</td>
                <td style="padding: 10px;"><b>Báo cáo tình trạng máy:</b></td>
                <td></td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold;">3</td>
                <td style="padding: 10px;">
                    <b>Vệ sinh máy và cốc lọc:</b><br>
                    - Kỹ thuật cần có đủ dụng cụ, rẻ lau<br>
                    - Tháo lõi 123 và vệ sinh cốc. Nếu lõi 123 bẩn thì nên thay, chỉ cách phân biệt lõi lọc
                </td>
                <td></td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold;">4</td>
                <td style="padding: 10px;">
                    <b style="font-style: italic; font-size: 17px;">Thay lõi lọc nước / sửa chữa</b><br>
                    <span style="font-size: 13px;">*** Thay lõi lọc hoặc sửa chữa thay thế đúng như báo cáo tình trạng ở bước 2</span>
                </td>
                <td></td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold;">5</td>
                <td style="padding: 10px;">
                    <b>Kiểm tra lại máy lọc nước</b><br>
                    <span style="font-size: 13px;">*** T/H máy bị lỗi ngoài phát sinh khi báo cáo ở bước 1&2: thì Khách Hàng sẽ không phải thanh toán chi phí phát sinh này</span>
                </td>
                <td></td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold;">6</td>
                <td style="padding: 10px;">
                    <b>Lau chùi sạch sẽ, kiểm tra dò nước, sắp xếp lại đồ đạc</b><br>
                    <span style="font-size: 13px;">*** T/H không gọn gàng, để nước ra sàn nhà, tủ bếp chưa lau, xin KH hãy ghi NG cột bên</span>
                </td>
                <td></td>
            </tr>
            <tr>
                <td style="text-align: center; font-weight: bold;">7</td>
                <td style="padding: 10px;">
                    <b>Bàn giao máy lọc nước</b><br>
                    - Ghi phiếu hóa đơn<br>
                    - Xin chữ ký, ý kiến đánh giá, nhận xét và dặn dò Khách hàng về bọt khí khi thay lõi mới<br>
                    - Ghi <b style="font-style: italic; color: blue;">tích điểm + hướng dẫn cài APP</b><br>
                    - Lên lịch thay lõi vệ sinh đợt tiếp theo<br>
                    - Dán tem SOCBAY: khi có vấn đề gì KH gọi vào số HOTLINE...
                </td>
                <td></td>
            </tr>
        </tbody>
    </table>
</div>
<div style="max-width: 900px; margin: auto; font-family: Arial, sans-serif; text-align: left;">


    <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
            <tr style="background-color: #f2f2f2; text-align: center; font-weight: bold;">
                <th style="padding: 10px; width: 40px;">STT</th>
                <th style="padding: 10px;">Các Công Việc Thay Lõi Lọc Nước NANO</th>
                <th style="padding: 10px; width: 100px;">Thực Trạng<br>(OK/NG)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: center; font-weight: bold; vertical-align: top; padding-top: 10px;">1</td>
                <td style="padding: 10px; vertical-align: top;">
                    <b style="font-size: 16px;">Kiểm tra tình trạng máy lọc nước:</b><br>
                    - CHỤP ẢNH MÁY GỬI LÊN NHÓM ZALO<br>
                    - Kiểm tra nước có ra hay chảy yếu không?<br>
                    - Kiểm tra khi đun có váng cặn không?<br>
                    - Kiểm tra khẩu khóa, dây, vòi máy lọc nước (vòi lỏng bắt buộc vặn lại)<br>
                    - Kiểm tra rò rỉ nước, hệ thống cấp nước, đường nước thải bồn chậu
                </td>
                <td></td>
            </tr>

            <tr>
                <td style="text-align: center; font-weight: bold; vertical-align: top; padding-top: 10px;">2</td>
                <td style="padding: 10px; vertical-align: top;">
                    <b>Báo cáo tình trạng máy:</b>
                </td>
                <td></td>
            </tr>

            <tr>
                <td style="text-align: center; font-weight: bold; vertical-align: top; padding-top: 10px;">3</td>
                <td style="padding: 10px; vertical-align: top;">
                    <b>Vệ sinh máy và cốc lọc:</b><br>
                    - Kỹ thuật cần có đủ dụng cụ, rẻ lau<br>
                    - Tháo lõi 123 và vệ sinh cốc<br>
                    - Vệ sinh lõi lọc Nano Aragon dùng giấy giáp và chanh tươi, chỉ cách phân biệt lõi lọc
                </td>
                <td></td>
            </tr>

            <tr>
                <td style="text-align: center; font-weight: bold; vertical-align: top; padding-top: 10px;">4</td>
                <td style="padding: 10px; vertical-align: top;">
                    <b style="font-style: italic; font-size: 17px;">Thay lõi lọc nước / sửa chữa</b><br>
                    <span style="font-size: 13px; color: #555;">*** Thay lõi lọc hoặc sửa chữa thay thế đúng như báo cáo tình trạng ở bước 2</span>
                </td>
                <td></td>
            </tr>

            <tr>
                <td style="text-align: center; font-weight: bold; vertical-align: top; padding-top: 10px;">5</td>
                <td style="padding: 10px; vertical-align: top;">
                    <b>Kiểm tra lại máy lọc nước</b><br>
                    <span style="font-size: 13px; color: #555;">*** T/H máy bị lỗi ngoài phát sinh khi báo cáo ở bước 1&2: thì Khách Hàng sẽ không phải thanh toán chi phí phát sinh này</span>
                </td>
                <td></td>
            </tr>

            <tr>
                <td style="text-align: center; font-weight: bold; vertical-align: top; padding-top: 10px;">6</td>
                <td style="padding: 10px; vertical-align: top;">
                    <b>Lau chùi sạch sẽ, kiểm tra dò nước, sắp xếp lại đồ đạc</b><br>
                    <span style="font-size: 13px; color: #555;">*** T/H không gọn gàng, để nước ra sàn nhà, tủ bếp chưa lau, xin KH hãy ghi NG cột bên</span>
                </td>
                <td></td>
            </tr>

            <tr>
                <td style="text-align: center; font-weight: bold; vertical-align: top; padding-top: 10px;">7</td>
                <td style="padding: 10px; vertical-align: top;">
                    <b style="color: #d35400;">Bàn giao máy lọc nước</b><br>
                    - Ghi phiếu hóa đơn<br>
                    - Xin chữ ký, ý kiến đánh giá, nhận xét và dặn dò Khách hàng về bọt khí khi thay lõi mới (Nếu điểm Hài Lòng <= 3 xin phản hồi trung thực từ Khách)<br>
                    - Ghi <b style="font-style: italic; color: blue;">tích điểm + hướng dẫn cài APP</b><br>
                    - Lên lịch thay lõi vệ sinh đợt tiếp theo<br>
                    - Dán tem SOCBAY: khi có vấn đề gì KH gọi vào số HOTLINE 0963.456.911<br>
                    - Chụp và gửi 4 ảnh: Hóa đơn, ảnh lõi thay kèm vòi, ảnh khu vực máy có khăn và tem dán, ảnh máy khách cài APP
                </td>
                <td></td>
            </tr>
            </tbody>
    </table>
    <h3>HOTLINE: 0963 456 911 / 02466 862 911</h3>
    <h3>Note: KH hài lòng ghi OK, nếu không vui lòng ghi NG vào cột bên phải </h3>
</div>
  `;
  containerDiv.appendChild(contentSection);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  return container;
}
