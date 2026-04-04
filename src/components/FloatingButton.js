import "../styles/home/floating-button.css";

export function FloatingButton() {
  const floatingButton = document.createElement("div");
  floatingButton.innerHTML = `
        <div class="floating-buttons">
            <a href="tel:0335118911" class="float-btn alo" title="Liên hệ ngay">
                <i class="fas fa-phone"></i>
                <span>Liên hệ</span>
            </a>
            <a href="https://zalo.me/2053854707066812736" class="float-btn zalo" title="Chat Zalo OA">
                <img src="/images/Icon_of_Zalopng.png" alt="Zalo" class="zalo-icon" />
                <span>Zalo OA</span>
            </a>
            <a href="#/booking" class="float-btn booking" title="Đặt lịch ngay">
                <i class="fas fa-calendar-plus"></i>
                <span>Đặt lịch</span>
            </a>
        </div>
    `;
  return floatingButton.firstElementChild;
}