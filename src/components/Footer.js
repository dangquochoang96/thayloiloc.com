export function Footer() {
  const footer = document.createElement("footer");
  footer.className = "footer";

  footer.innerHTML = ` 
    <div class="footer-main">
      <div class="container">
        <div class="footer-grid">
          <!-- Company Info -->
          <div class="footer-column footer-about">
            <h4 class="footer-title">Về chúng tôi</h4>
            <div class="footer-brand-wrapper">
              <div class="footer-logo">
                <img src="/images/logo.png" alt="Thayloiloc" style="height: 40px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <h3 style="display: none; color: var(--primary-color); font-size: 1.5rem; font-weight: 700;">Thayloiloc</h3>
              </div>
              <p class="footer-description">Dịch vụ thay lõi lọc tại nhà chuyên nghiệp, tận nơi. Giải pháp đáng tin cậy, nhanh chóng và giá cả phải chăng cho mọi nhu cầu của bạn.</p>
              <div class="footer-social">
                <a href="#" class="social-link" aria-label="Facebook">
                  <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="social-link" aria-label="Instagram">
                  <i class="fab fa-instagram"></i>
                </a>
                <a href="#" class="social-link" aria-label="Twitter">
                  <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="social-link" aria-label="LinkedIn">
                  <i class="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-column">
            <h4 class="footer-title">Quick Links</h4>
            <ul class="footer-links">
              <li><a href="#/">Trang chủ</a></li>
              <li><a href="#/services">Dịch vụ</a></li>
              <li><a href="#/booking">Đặt lịch ngay</a></li>
              <li><a href="#/about">Về chúng tôi</a></li>
            </ul>
          </div>

          <!-- Services -->
          <div class="footer-column">
            <h4 class="footer-title">Dịch vụ của chúng tôi</h4>
            <ul class="footer-links">
              <li><a href="#/services">Chuyển rời máy lọc nước</a></li>
              <li><a href="#/services">Lắp đặt máy lọc nước</a></li>
              <li><a href="#/services">Vệ sinh bảo dưỡng máy lọc nước</a></li>
              <li><a href="#/services">Sửa máy lọc nước</a></li>
              <li><a href="#/services">Thay lõi lọc nước</a></li>
              <li><a href="#/services">Dịch vụ khác</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="footer-column">
            <h4 class="footer-title">Liên Hệ</h4>
            <ul class="footer-contact">
              <li>
                <i class="fas fa-envelope"></i>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:nanogeyser29@gmail.com">nanogeyser29@gmail.com</a>
                </div>
              </li>
              <li>
                <i class="fas fa-phone-alt"></i>
                <div>
                  <strong>Điện Thoại</strong>
                  <a href="tel:0963456911">0963456911</a>
                </div>
              </li>
              <li>
                <i class="fas fa-map-marker-alt"></i>
                <div>
                  <strong>Địa chỉ</strong>
                  <span>CTT1 - 03, Khu Biệt Thự Liền kề Kiến Hưng Luxury, P. Phúc La, Hà Đông, Hà Nội, Việt Nam</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="container">
        <div class="footer-bottom-content">
          <p>&copy; ${new Date().getFullYear()} Socbay. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#/privacy">Privacy Policy</a>
            <span class="separator">•</span>
            <a href="#/terms">Terms of Service</a>
            <span class="separator">•</span>
            <a href="#/cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  `;

  return footer;
}
