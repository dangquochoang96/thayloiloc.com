import "../styles/home/floating-button.css";

export function FloatingButton() {
  const floatingButton = document.createElement("div");
  floatingButton.innerHTML = `
        <div class="floating-buttons" id="floatingButtons">
            <div class="float-toggle-wrapper" id="floatToggleWrapper">
              <button class="float-main-toggle" id="floatMainToggle" type="button" title="Hỗ trợ & Liên hệ">
                  <i class="fas fa-headset icon-closed"></i>
                  <i class="fas fa-xmark icon-opened"></i>
              </button>
              <div class="float-sub-menu" id="floatSubMenu">
                <a href="tel:0335118911" class="float-btn alo" title="Liên hệ điện thoại">
                    <i class="fas fa-phone"></i>
                    <span>Liên hệ</span>
                </a>
                <a href="https://zalo.me/2053854707066812736" target="_blank" rel="noopener" class="float-btn zalo" title="Chat Zalo OA">
                    <img src="/images/Icon_of_Zalopng.png" alt="Zalo" class="zalo-icon" />
                    <span>Zalo OA</span>
                </a>
              </div>
            </div>
            <a href="#/booking" class="float-btn booking" title="Đặt lịch dịch vụ">
                <i class="fas fa-calendar-plus"></i>
                <span>Đặt lịch</span>
            </a>
        </div>
    `;

  const container = floatingButton.firstElementChild;
  const toggleWrapper = container.querySelector("#floatToggleWrapper");
  const toggleBtn = container.querySelector("#floatMainToggle");

  if (toggleBtn && toggleWrapper) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWrapper.classList.toggle("is-open");
    });

    // Close when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (!toggleWrapper.contains(e.target) && toggleWrapper.classList.contains("is-open")) {
        toggleWrapper.classList.remove("is-open");
      }
    });
  }

  return container;
}