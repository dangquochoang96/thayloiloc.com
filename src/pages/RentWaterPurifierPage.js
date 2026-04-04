import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import '../styles/services/rent-water-page.css';

export function RentWaterPurifierPage() {
  const container = document.createElement('div');

  // Add Header
  container.appendChild(Header());

  const page = document.createElement('main');
  page.className = 'rent-water-page';

  page.innerHTML = `
    <div class="rent-hero">
      <div class="container">
        <h1>THUÊ MÁY LỌC NƯỚC</h1>
        <p class="subtitle">Dịch vụ cho thuê máy lọc nước nóng lạnh nguội với những quyền lợi vượt trội cho khách hàng</p>
      </div>
    </div>
    <div class="rent-content container">
      <!-- Intro Section -->
      <section class="rent-section">
        <h2>Kính gửi Quý khách hàng!</h2>
        <p>Nano Geyser xin gửi tới quý khách hàng dịch vụ cho thuê máy lọc nước nóng lạnh nguội với những quyền lợi vượt trội cho khách hàng như sau:</p>
        <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/NUOC%20UONG%20NANOGEYSER%20DAT%20CHUAN%20QCVN(1).jpg" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
        <ul class="benefits-list">
          <li><strong>Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT:</strong> Giúp khách hàng gạt bỏ nỗi lo về chất lượng nguồn nước, đảm bảo nguồn nước đầu ra đạt chuẩn quốc gia QCVN 6-1: 2010/BYT quy chuẩn nước uống đóng chai trực tiếp.</li>
          <li>Trong suốt thời gian sử dụng dịch vụ cho thuê máy lọc nước Nano Geyser việc vệ sinh, bảo dưỡng, thay thế lõi lọc hoàn toàn do Nano Geyser chịu trách nhiệm bao gồm cả vật tư thay thế, màng lọc, các phụ kiện thiết bị thay thế mà không thu thêm bất kì khoản phí phát sinh nào.</li>
          <li>Giá thuê máy lọc nước sẽ giảm dần theo từng năm.</li>
          <li>Khách hàng không cần đầu tư chi phí ban đầu lớn như mua máy mới.</li>
          <li>Sản phẩm cho thuê là dòng sản phẩm cao cấp, tích hợp đầy đủ hệ thống nóng lạnh nguội đáp ứng mọi nhu cầu sử dụng cho khách hàng.</li>
          <li>Giúp khách hàng gạt bỏ nỗi lo về việc quản lý vỏ bình, đổi bình, và vệ sinh vỏ bình.</li>
          <li>Chế độ bảo hành, bảo dưỡng định kỳ. Miễn phí thay lõi lọc, màng lọc và phí nhân công trong suốt thời gian hợp đồng thuê máy lọc nước còn hiệu lực.</li>
          <li>Sử dụng dòng sản phẩm cao cấp, thiết kế sang trọng làm đẹp thêm không gian sử dụng với dịch vụ cho thuê máy lọc nước nóng lạnh tại Nano Geyser</li>
        </ul>
      <img src="https://geysereco.com/plugin/ckfinder/userfilesfiles/254048172_23848972486740165_2620520872609955735_n.png.jpg" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
        <div class="highlight-box">
          <h3>Dịch vụ thuê máy lọc nước chỉ có tại Sóc Bay</h3>
          <p style="font-weight: 600; font-size: 1.1rem; text-transform: uppercase; margin-top: 1rem;">VÌ SAO NHIỀU DOANH NGHIỆP BỎ NƯỚC ĐÓNG BÌNH CHUYỂN SANG THUÊ MÁY LỌC NƯỚC</p>
        </div>
      </section>

      <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/HOTLINE%20THUE%20MAY%20LOC%20NUOC(1).png" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
      <!-- Products Section -->
      <section class="rent-section">
        <h2 class="section-title">II. CÁC SẢN PHẨM MÁY LỌC NƯỚC CHO THUÊ</h2>
        
        <!-- Product 1 -->
        <div class="product-card">
          <div class="product-info">
            <h3>1. MÁY LỌC NƯỚC NÓNG LẠNH NGUỘI NANO GEYSER GB50</h3>
            
            <p><strong>Tích hợp full chế độ nóng - lạnh - nguội</strong><br>
            Với hệ thống 1 vòi 3 chế độ Nóng - Lạnh - Nguội đáp ứng mọi nhu cầu sử dụng. Chất lượng nguồn nước tinh khiết đạt chuẩn quốc gia QCVN 6-1: 2010/BYT QUY CHUẨN NƯỚC UỐNG TRỰC TIẾP</p>
            <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/MAY%20LOC%20NUOC%20NONG%20LANH%20NGUOI%20NANO%20GEYSER.png" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />

            <p><strong>Thao tác tiện lợi an toàn</strong><br>
            Thao tác lấy nước đơn giản, dễ dàng. Với 3 chế độ Nóng - Lạnh - Nguội lấy trên cùng 1 vòi. Với công tắc Nóng/Lạnh riêng biệt có thể ngắt dễ dàng khi không có nhu cầu sử dụng. Đáp ứng đầy đủ mọi nhu cầu khi thuê máy lọc nước nóng lạnh, chất lượng nguồn nước đảm bảo tinh khiết đáp ứng nhu cầu hàng ngày như : Uống nước nguội, nước lạnh, pha sữa, pha trà,...vv Với độ nóng tuỳ chỉnh từ 7 đến 98 độ.</p>

            <p><strong>Màng lọc RO công nghệ chuẩn Châu Âu</strong><br>
            Màng lọc RO được nhập khẩu từ Mỹ với khe lọc siêu nhỏ chỉ 0,0001 micron. Với cơ chế thẩm thấu ngược cùng kích thước khe lọc siêu nhỏ giúp lọc bỏ hoàn toàn các tạp chất trong nước virus, vi khuẩn, các ion kim loại nặng trong nước, cho nước đầu ra hoàn toàn tinh khiết.</p>
           <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/DC__2366.png" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />

            <p><strong>Bổ sung khoáng chất tự nhiên cho nước</strong><br>
            Lõi lọc T33 với thành phần khoáng đá tự nhiên giúp bổ sung các loại khoáng chất, nguyên tố vi lượng cần thiết, tạo vị nước, tăng cường xử lý độ cứng làm mềm nước cho sự phát triển toàn diện của cơ thể.</p>

            <p><strong>5 cấp lọc ưu việt cho nguồn nước chuẩn tinh khiết</strong><br>
            Nguồn nước sau lọc qua cây nước nóng lạnh nguội Nano Geyser đạt Quy chuẩn Quốc gia nước về nước uống trực tiếp QCVN 6-1:2010/BYT được chứng nhận bởi Viện SKNN&MT Bộ Y Tế. Một trong những phòng xét nghiệm uy tín hàng đầu trong nước và quốc tế. Chất lượng nguồn nước đảm bảo an toàn tuyệt đối với sức khỏe người tiêu dùng khi uống trực tiếp</p>
            <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/DC__2596.png" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />

            <ul class="product-features">
              <li>Lõi lọc số 1: Lõi PP 5 Micro Giúp loại những chất bẩn thô có kích thước >5 Micron (µ) (kích thước mắt lưới), mem nấm</li>
              <li>Lõi lọc số 2: Lõi CTO Hấp thụ các chất hữu cơ có mùi, thuốc trừ sâu, thuốc diệt côn trùng, các chất gây ung thư</li>
              <li>Lõi lọc số 3: Lõi PP 1 Micro Loại bỏ chất bẩn thô có kích thước > 1 Micron (µ) đất cát, vi khuẩn</li>
              <li>Lõi lọc số 4: Màng Geyser RO Kích thước 0,001 Micron (µ). Loại bỏ hầu hết các chất hữu cơ kim loại hòa tan, vi khuẩn gây hại, các ion kim loại nặng, amoni, asen, vi sinh vật, siêu vi khuẩn, các chất gây ung thư.</li>
              <li>Lõi lọc số 5: Bổ sung các chất khoáng vi lượng cần thiết cho cơ thể người</li>
            </ul>

            <p><strong>Vận hành ưu việt giảm thiểu lượng nước thải</strong><br>
            Hệ thống linh phụ kiện chất lượng cao: Vòi lấy nước, lõi lọc, cốc lọc cao cấp<br>
            Tỷ lệ thu hồi nước tinh khiết lên đến 40%, giúp tiết kiệm tối đa</p>

            <p><strong>Kích thước ngỏ gọn, sang trọng</strong><br>
            Thiết kế dạng tủ đứng nhỏ gọn 42*32*100 phù hợp và linh hoạt với các vị trí trong nhà.<br>
            Với hình khối sắc nét, sang trọng,chất liệu kính cường lực sang trọng trên mặt tủ và màu sắc hiện đại phù hợp với mọi không gian.<br>
            Được làm bằng thép không gỉ đảm bảo vệ sinh, sức chứa dự trữ lên tới 10L</p>

            <p><strong>Thông số kỹ thuật</strong></p>
            <ul class="product-features">
              <li>Chức năng: làm nóng-làm ấm-làm lạnh nước tinh khiết uống trực tiếp</li>
              <li>Hệ thống vòi: 1 vòi 3 chế độ</li>
              <li>Điện áp: 220V – 50/60Hz – 70W – 430W</li>
              <li>Công suất lọc : 20L/H</li>
              <li>Dung tích bình nóng: 2L</li>
              <li>Dung tích bình nguội: 10L</li>
              <li>Dung tích bình lạnh: 1.5L</li>
              <li>Kích cỡ: 42x32x100 (cm).</li>
              <li>Hệ thống làm lạnh bằng Block Danfu</li>
              <li>Hệ thống lõi lọc: 5 cấp</li>
              <li>Màng lọc 100G: sử dụng công nghệ RO</li>
              <li>Nhiệt độ làm lạnh: 7-9 Độ</li>
              <li>Nhiệt độ làm nóng: 85-98 Độ</li>
            </ul>
          </div>
        </div>

        <!-- Product 2 -->
        <div class="product-card">
          <div class="product-info">
            <h3>2. MÁY LỌC NƯỚC NÓNG LẠNH NGUỘI G22 - 8 CẤP</h3>
            
            <p><strong>Full chế độ nước đáp ứng mọi nhu cầu sử dụng</strong><br>
            Máy lọc nước nóng lạnh nguội G22 mang đến giải pháp nước sạch với full chế độ nước Nóng Lạnh Nguội mang đến sự tiện lợi đáp ứng mọi nhu cầu sử dụng cho khách hàng.<br>
            Ứng dụng công nghệ làm lạnh Block siêu bền giúp lạnh lạnh nhanh, giữ lạnh sâu tới nhiệt độ 6-12°C nhanh chóng giải tỏa cơn khát.<br>
            Công nghệ làm nóng cho nhiệt độ nóng lên đến 85-95°C đáp ứng nhu cầu nước nóng cho mọi công việc pha trà, pha sữa, pha mì …vv<br>
            Tích hợp đèn báo chế độ nước giúp khách hàng dễ dàng sử dụng cũng như kiểm soát trạng thái của máy nhờ đèn Led hiển thị chế độ nóng - lạnh.<br>
            Công tắc bật tắt nóng lạnh riêng biệt: Tiết kiệm điện năng theo nhu cầu sử dụng</p>
            
            <p><strong>Thiết kế khóa an toàn vòi nóng, an toàn với người già & trẻ em</strong></p>
            <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/khoa%20an%20toan%20cho%20voi%20nuoc%20nong%20may%20l%E1%BB%8Dc%20nuoc%20g22.jpg" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
            
            <p><strong>Thiết kế khóa an toàn cho vòi nóng</strong><br>
            Với thiết kế khóa an toàn tại vòi lấy nước nóng giúp đảm bảo an toàn cho cả người già & trẻ em<br>
            Khoảng cách giữa vòi và khay đựng nước được thiết kế hợp lý, giúp bạn dễ dàng lấy nước khi sử dụng cốc cao hay bình đựng cá nhân.<br>
            Khay đựng nước thiết kế tinh tế giúp hạn chế rò rỉ nước ra bên ngoài.<br>
            Hệ thống 8 lõi lọc kết hợp công nghệ lọc RO tinh khiết cho nước đầu ra đạt chuẩn uống trực tiếp</p>

            <p><strong>Tích hợp 8 cấp lọc tiên tiến</strong></p>
            <ul class="product-features">
              <li><strong>Sediment 5mcr:</strong> Loại lõi lọc Sediment có nhiệm vụ lọc thô mọi nguồn nước đi vào để đảm bảo ngăn chặn loại cặn bã, tạp chất có kích thước lớn như các loại sinh vật sống trong nước như bọ gậy, rong rêu, gỉ sét trong đường ống hòa vào nước. Thời gian thay thế: 3-6 tháng</li>
              <li><strong>Post Carbon:</strong> Loại bỏ hoàn toàn mùi hôi, vị lạ, màu sắc hay các thành phần khác có trong nước cũng như có tác dụng ngăn chặn sự sinh sôi của vi khuẩn để tạo ra sản phẩm nước cuối cùng hoàn toàn sạch không màu và không mùi. Thời gian thay thế: 3-6 tháng</li>
              <li><strong>Sediment 1mcr:</strong> Lõi lọc Sediment Nano Geyser giúp loại bỏ các chất cặn bẩn, tỉ sét, bọ gậy, rong rêu... kích thước lớn hơn 1 micron. Thời gian thay thế 3-6 tháng</li>
              <li><strong>RO:</strong> Màng lọc với các khe lọc có kích thước 0.0001 micromet. Lọc bỏ các chất rắn, ion kim loại nặng. Lọc bỏ hoàn toàn những vi sinh vật, vi khuẩn… Mang đến nguồn nước ĐẠT CHUẨN QUỐC GIA NƯỚC UỐNG TRỰC TIẾP QCVN 6-1:2010/BYT. Thời gian thay thế: 24 tháng</li>
              <li><strong>3IN1:</strong> Giúp bổ sung Oxy trong nước, giúp người sử dụng máu lưu thông tốt hơn. Thời gian thay thế: 12-18 tháng</li>
              <li><strong>Alkaline:</strong> Tạo ra nước kiềm tính giúp trung hòa các axit dư thừa trong cơ thể. Thời gian thay thế: 12-18 tháng</li>
              <li><strong>Maifan:</strong> Bổ sung thêm một lượng khoáng cần thiết, tạo vị ngon, mát tự nhiên của nguồn nước. Thời gian thay thế: 12-18 tháng</li>
              <li><strong>Nanosilver:</strong> Diệt khuẩn và các loại nấm trong nước, khử mùi hôi, loại bỏ mùi Clo trong nước. Thời gian thay thế: 12-18 tháng</li>
            </ul>

            <p><strong>Vỏ ngoài nhựa ABS siêu bền</strong><br>
            Vỏ ngoài của cây nước làm bằng nhựa ABS, bóng đẹp, tinh tế, chịu được nhiệt độ cao, dễ dàng vệ sinh, độ cứng và độ chịu mài mòn cao, giúp tăng tuổi thọ của sản phẩm</p>
            
            <p><strong>8 cấp cho khả năng lọc vượt trội</strong><br>
            Hệ thống 8 cấp lọc mạnh mẽ cho khả năng lọc vượt trội<br>
            Đáp ứng nguồn nước đạt chuẩn quốc gia nước uống trực tiếp QCVN 6-1: 2010/BYT<br>
            Bổ sung khoáng chất nguyên tố vi lượng cần thiết, tạo vị nước, tăng cường xử lý độ cứng làm mềm nước cho sự phát triển toàn diện của cơ thể.</p>

            <p><strong>Bảo hành chính hãng 60 tháng</strong><br>
            Là sản phẩm máy lọc nước duy nhất trên thị trường có thời gian bảo hành lên đến 60 tháng và 24 tháng với bộ làm nóng lạnh<br>
            Dịch vụ bảo hành uy tín, chất lượng</p>
          </div>
        </div>

        <!-- Product 3 -->
        <div class="product-card">
          <div class="product-info">
            <h3>3. MÁY LỌC NƯỚC NANO GEYSER RO ECO8</h3>
            
            <p><strong>Hệ thống 8 cấp lọc mạnh mẽ</strong></p>
            <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/may%20loc%20nuoc%20RO%20ECO8.png" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
            
            <p><strong>8 cấp độ lọc cho nguồn nước chuẩn tinh khiết</strong></p>
            <ul class="product-features">
              <li><strong>Lõi số 1 – PP 5 MCR:</strong> Ngăn chặn bẩn, bùn đất, rỉ sét, các loại tạp chất thô ... có kích thước > 5 micron</li>
              <li><strong>Lõi số 2 GAC:</strong> Hấp phụ mùi vị, chất hữu cơ, chất tẩy rửa có trong nước. Loại bỏ hoàn toàn các loại hóa chất độc hại, kim loại nặng, clo dư trong nước …</li>
              <li><strong>Lõi số 3 - PP 1 MCR:</strong> Lọc cặn, bùn đất, rỉ sét, các loại tạp chất thô ... có kích thước > 1 micron.</li>
              <li><strong>Lõi số 4 – Màng Geyser RO:</strong> Đây là màng lọc quan trọng nhất của toàn bộ hệ thống được coi như quả tim của máy. Với cơ chế lọc thẩm thấu ngược, kích thước khe hở siêu nhỏ 0,0001 micron, các chất bẩn đi qua màng RO bị giữ lại và thải ra ngoài. Lõi RO có khả năng loại bỏ hoàn toàn các tạp chất kích cỡ siêu nhỏ, các chất kim loại nặng, làm mềm nước, vi khuẩn, vi rút, các chất khí hóa lỏng asen, amoni…. cho ra nước sạch tinh khiết đến 99,9%.</li>
              <li><strong>Lõi số 5 – 3IN1:</strong> Giúp bổ sung Oxy trong nước, giúp người sử dụng máu lưu thông tốt hơn.</li>
              <li><strong>Lõi số 6 – Geyser Maifan:</strong> Lõi lọc Mineralizer là vật liệu được làm từ các thành phần đá khoáng tự nhiên cao cấp có tác dụng làm phong phú, bổ sung muối khoáng, các nguyên tố vi lượng cần thiết cho cơ thể.</li>
              <li><strong>Lõi số 7 – Geyser Alkline:</strong> Cân bằng pH tạo ra nước kiềm tính, trung hòa axit dư thừa trong nước</li>
              <li><strong>Lõi số 8 – Geyser Nano silver:</strong> Được lắp ở vị trí cuối cùng của hệ thống máy lọc nước RO GEYSER nhằm chống tái nhiễm khuẩn trong quá trình nước lưu thông trong hệ thống lọc, dễ dàng thay lõi lọc khi xảy vấn đề.</li>
            </ul>
            
            <p><strong>Khả năng xử lý cặn Canxi vượt trội với lõi Gayer RO</strong><br>
            Với công nghệ lõi lọc hiện đại giúp tăng khả năng xử lý cặn canxi một cách tuyệt đối. Công suất lọc nhanh giảm nước thải, lọc sạch cặn canxi đá vôi, phù hợp cho cả nguồn nước giếng khoan</p>

            <p><strong>Khả năng xử lý cặn Canxi tuyệt đối nhờ công nghệ lọc hiện đại</strong></p>
            <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/kha%20nang%20xu%20ly%20can%20canxi%20tuyet%20doi%20voi%20may%20RO%20ECO8.png" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />

            <p><strong>Nước đầu ra đạt chuẩn quốc gia QCVN 6-1:2010/BYT</strong></p>
            Với công nghệ lọc RO cho nguồn nước đầu ra tinh khiết đạt chuẩn QCVN 6 -1: 2010/BYT, quy chuẩn cấp Quốc Gia về nước uống trực tiếp.</p>
            <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/8%20cap%20loc%20may%20loc%20nuoc%20RO%20NANO%20GEYSER%20ECO8(1).jpg" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
            <p style="text-align: center;">
              Combo phụ kiện máy lọc nước Nano Geyser
            </p>
            <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/Chung-nhan-dat-chuan-QCVN-6.gif" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
            <p style="text-align: center;">
              Máy lọc nước Nano Geyser đạt chuẩn QCVN 6-1: 2010/BYT
            </p>

            <p><strong>Dịch vụ bảo hành bảo dưỡng vượt trội</strong></p>
            <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/bao%20hanh%20chinh%20hang%2060%20thang.png" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
            <p><strong>Dịch vụ bảo hành chính hãng lên đến 60 tháng</strong><br>
            Thời gian bảo hành: Là sản phẩm duy nhất trên thị trường có thời gian bảo hành lên đến 60 tháng. Áp dụng cho toàn bộ linh kiện điện.<br>
            Dịch vụ bảo hành uy tín, chất lượng<br>
            Dịch vụ xử lý sự cố, hỗ trợ kỹ thuật: quý khách vui lòng liên hệ nhanh chóng qua Hotline 02466 862 911 hoạt động 24/7</p>

            <p><strong>Hướng dẫn lắp đặt</strong></p>

            <p><strong>Thông số kĩ thuật</strong></p>
            <ul class="product-features">
              <li>Công nghệ : RO Geyser</li>
              <li>Tính năng đặc biệt cho ra nguồn nước: Tinh khiết đạt chuẩn quốc gia nước uống trực tiếp</li>
              <li>Công suất lọc (Tối đa) : 20L/H</li>
              <li>Số cấp lọc : 8 lõi</li>
              <li>Tuổi thọ lõi lọc (Tối đa) : 7000L nước sạch</li>
              <li>Kích thước (RxCxS) : 38x16x45cm</li>
              <li>Lắp đặt : Để tủ bếp, để sàn, treo tường</li>
              <li>Bình áp : nhựa siêu bền</li>
              <li>Nguồn: 1.5A</li>
              <li>Bơm: Hút sâu 3m</li>
              <li>Nguồn điện 220V/ 50Hz</li>
              <li>Bảo Hành: 60 tháng</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Partners Section -->
      <section class="rent-section">
        <h2 class="section-title">III. ĐỐI TÁC SỬ DỤNG DỊCH VỤ THUÊ MÁY LỌC NƯỚC CỦA NANO GEYSER</h2>
        <p style="margin-bottom: 2rem;">Đối tác dử dụng dịch vụ thuê máy lọc nước nóng lạnh Nano Geyser</p>
        <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/thue%20may%20loc%20nuoc%20nano%20geyser.jpg" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
        <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/z2477388730947_29fe4b173d7baad6191f0d20a1f7d976.jpg" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
        <p style="text-align: center;">
          Tập đoàn CEN GROUP sử dụng dịch vụ thuê máy lọc nước Nano Geyser
        </p>
        
        <div class="partners-grid">
          <div class="partner-card">
          <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/z2477388810950_9464c7d5ae25376d8054b8599fa19b3c.jpg" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
            <h4>Tập đoàn CEN GROUP</h4>
            <div class="partner-meta">Sử dụng dịch vụ thuê máy lọc nước Nano Geyser</div>
          </div>
          <div class="partner-card">
            <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/5de63893523ba065f92a.jpg" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
            <h4>Minh Anh</h4>
            <div class="partner-meta">Sử dụng dịch vụ thuê máy lọc nước Nano Geyser</div>
          </div>
          <div class="partner-card">
            <img src="https://geysereco.com/plugin/ckfinder/userfilesimages/6e68872c0382f0dca993.jpg" alt="Đạt chuẩn quốc gia nước uống đóng chai trực tiếp QCVN 6-1: 2010/BYT" style="width: 100%; max-width: 800px; height: auto; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
            <h4>Hoàng Châu</h4>
            <div class="partner-meta">Thuê máy lọc nước nóng lạnh tại Nano Geyser</div>
          </div>
        </div>
      </section>
      
      <div class="contact-cta">
        <h3>Liên hệ ngay để nhận tư vấn và báo giá chi tiết</h3>
        <a href="#/hotline" class="btn btn-primary">Tìm Thợ - Gọi Hotline Theo Khu Vực</a>
      </div>
    </div>
  `;

  container.appendChild(page);

  // Add Footer
  container.appendChild(Footer());

  // Thêm xử lý để thay đổi đường dẫn của floating button "Đặt lịch" 
  // thành "#/bookingrent" khi ở trang này
  const bookingBtn = document.querySelector('.float-btn.booking');
  if (bookingBtn) {
    if (!bookingBtn.dataset.originalHref) {
      bookingBtn.dataset.originalHref = bookingBtn.getAttribute('href');
    }
    bookingBtn.setAttribute('href', '#/bookingrent');

    // Phục hồi lại đường dẫn cũ khi rời khỏi trang
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash !== '#/rent-water-purifier') {
        bookingBtn.setAttribute('href', bookingBtn.dataset.originalHref);
        window.removeEventListener('hashchange', handleHashChange);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
  }

  return container;
}
