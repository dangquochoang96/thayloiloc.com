import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import '../styles/process/check-process.css';

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
  contentSection.innerHTML = `
    <div class="content-card" style="text-align: left;">
      
      <h2 style="text-align: left; font-weight: bold;">I. QUY TRÌNH KIỂM TRA MÁY LỌC NƯỚC RO </h2>
      <img src="/images/Screenshot 2026-01-08 160633.png">
      <p>Kiểm tra máy trước khi thay lõi lọc là công việc cần thiết để phát hiện máy có bị lỗi gì không? Từ đó thông báo với khách hàng để có hướng xử lý, rồi sau đó mới thay lõi lọc nước. Kiểm tra máy lọc nước bao gồm kiểm tra các bộ phận: nước có ra không, màng RO, bình áp, bơm nguồn, chế độ đóng ngắt của máy. 

 

<h3>1.Kiểm tra nước có ra không:</h3> Để nguyên máy mở vòi nước xem nước có ra không? Nếu nước ra đều mạnh thì chuyển xuống kiểm tra các bộ phận khác. Nếu nước không ra máy có vấn đề cần sửa trước khi thay lõi. 

 

<h3>2.Kiểm tra màng RO (lõi số 4 trong máy):</h3> Để nguyên máy, khóa van bình áp, mở vòi nước tầm 1 phút xem nước có ra không. Nếu nước không ra hoặc ra nhỏ giọt thì màng RO tắc hoặc gần tắc cần phải thay vì nước thải rất nhiều gần như 100%. Nếu nước ra thành dòng nhỏ và đều thì màng RO vẫn bình thường chưa phải thay. 

Nếu nước ra chảy mạnh có thể màng RO bị bục hoặc do đấu nhầm đường nước thải qua vòi. 

Đo TDS nước sau màng RO: Nếu TDS > 20 thì tư vấn thay, vì màng lâu rồi không đảm bảo, tư vấn thay màng RO mới đo lại nước sau màng đảm bảo < 20 

 

<h3>3.Kiểm tra bình áp:</h3> Để nguyên máy, lắc bình áp xem có nước đầy bên trong không, nếu bình áp đầy nước thì mở vòi nước ra, nếu nước chảy mạnh và đều thì bình áp vẫn hoạt động bình thường. Nếu nước chảy mạnh xong để 1 phút nước chảy yếu dần thì bình áp đã bị hỏng quả bóng cao su bên trong nên không đẩy nước ra vòi được, trường hợp này cần thay bình áp. 

Nếu lắc bình áp không có nước thì lúc này chưa kiểm tra bình áp được, khi nào khắc phục máy nước vào bình áp đầy mới kiểm tra lại được. 

 

<h3>4.Kiểm tra bơm nguồn:</h3> Để nguyên máy mở vòi nước tầm 1 phút xem máy bơm có hoạt động không? Bơm có hoạt động liên tục không? Có tiếng kêu to không? Nếu máy bơm không hoạt động cần tìm nguyên nhân trước khi thay lõi. 

 

<h3>5.Kiểm tra đóng ngắt máy:</h3> Sau khi kiểm tra các lỗi trên mà bình thường thì mở máy cho nước ở vòi chảy ra, sau khi nghe thấy máy bơm hoạt động thì khóa vòi nước lại. Để một lúc nếu máy bơm tự ngắt thì máy hoạt động bình thường, nếu máy bơm không ngắt thì cần xử lý trước khi thay lõi. 

 

<h3>6.Kiểm tra khẩu khóa dây, vòi máy lọc nước:</h3> Kiểm tra khẩu khóa xem có bị han rỉ, còn khóa mở được hay không? Nếu không cần tư vấn khách thay để đảm bảo an toàn khi cần khóa máy.  

Kiểm tra dây: nếu dây cũ và giòn cũng cần phải thay 

Kiểm tra vòi ra máy lọc nước: Nếu vòi rỉ nước không khóa lại được cần tư vấn thay, vì vòi lúc này lâu rồi hỏng van khóa, nếu vòi khi xoay bị lỏng thì vặn chặt lại cho khách.  

 

<h3>7.Kiểm tra hệ thống nước cấp, đường nước thải của bồn chậu rửa:</h3> Trong trường hợp hệ thống cũ, han rỉ dễ động vào dễ gây hư hỏng cần thông báo trước cho khách, tránh trường hợp không may đụng hỏng mới báo khách. </p>
<h2>II. QUY TRÌNH KIỂM TRA MÁY LỌC NƯỚC NANO</h2>
<img src="/images/Screenshot 2026-01-08 160649.png">
<p><h3>1.Kiểm tra nước có ra hay chảy yếu không?:</h3> Để nguyên máy mở vòi nước xem nước:  

Nước không ra hoặc chảy nhỏ thì khả năng do lõi lọc Nano (Aragon) bị tắc, nếu dùng trên 2 năm thì cần thay. Nếu chưa đến 2 năm thì cần vệ sinh lõi lọc Nano Aragon bằng cách lấy giấy giáp đánh sạch bề mặt, sau đó dùng chanh tươi vệ sinh bề mặt lõi. Tuyệt đối không dùng hóa chất lạ vệ sinh lõi dẫn đến nguy hại cho khách hàng. 


<h3>2.Hỏi khách xem nước khi đun có bị váng cặn không?:</h3> Trường hợp nước bị váng cặn nếu dùng máy trên 6 tháng thì thay lõi 1,2 (trong đó có lõi Cation), nếu dưới 6 tháng thì hoàn nguyên lõi Cation và tư vấn lắp bổ sung lõi tiền lọc Cation 350K  
 
<h3>3.Kiểm tra khẩu khóa dây, vòi máy lọc nước:</h3> Kiểm tra khẩu khóa xem có bị han rỉ, còn khóa mở được hay không? Nếu không cần tư vấn khách thay để đảm bảo an toàn khi cần khóa máy.  

Kiểm tra dây: nếu dây cũ và giòn cũng cần phải thay 

Kiểm tra vòi ra máy lọc nước: Nếu vòi rỉ nước không khóa lại được cần tư vấn thay, vì vòi lúc này lâu rồi hỏng van khóa, nếu vòi khi xoay bị lỏng thì vặn chặt lại cho khách.  

<h3>4.Kiểm tra hệ thống nước cấp, đường nước thải của bồn chậu rửa:</h3> Trong trường hợp hệ thống cũ, han rỉ động vào dễ gây hư hỏng cần thông báo trước cho khách, tránh trường họp không may đụng hỏng mới báo khách.  </p>
<h1>HOTLINE: 0963 456 911 / 09 323 999 20 </h1>
    </div>
  `;
  containerDiv.appendChild(contentSection);

  main.appendChild(containerDiv);
  page.appendChild(main);
  container.appendChild(page);
  container.appendChild(Footer());

  return container;
}
