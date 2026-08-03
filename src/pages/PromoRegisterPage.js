import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { SupportService } from "../services/support.service.js";
import { servicesService } from "../services/services.service.js";
import { notificationService } from "../services/notification.service.js";
import { Toast } from "../utils/toast.js";

// Import custom CSS
import "../styles/auth/promo-register.css";

export function PromoRegisterPage(params) {
  const container = document.createElement("div");
  container.className = "page-container";

  container.appendChild(Header());

  const main = document.createElement("main");
  main.className = "promo-container";

  // Background blobs for visual appeal
  const blob1 = document.createElement("div");
  blob1.className = "promo-bg-blob promo-bg-blob-1";
  const blob2 = document.createElement("div");
  blob2.className = "promo-bg-blob promo-bg-blob-2";
  main.appendChild(blob1);
  main.appendChild(blob2);

  const wrapper = document.createElement("div");
  wrapper.className = "promo-wrapper";
  main.appendChild(wrapper);

  // Retrieve staff ID
  const staffId = params?.staffId || "";
  
  // Render form for everyone — auto-fill if already logged in
  renderForm(wrapper, staffId);

  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}

// Render input form — works for both guests and logged-in users
function renderForm(wrapper, staffId) {
  const isLoggedIn = authService.isAuthenticated();
  const currentUser = isLoggedIn ? authService.getCurrentUser() : null;
  const userObj = currentUser?.user || currentUser;

  // Prefill values from session
  const prefillName = isLoggedIn ? (authService.getUserDisplayName() || userObj?.name || "") : "";
  const prefillPhone = isLoggedIn ? (userObj?.phone || "") : "";
  const prefillAddress = isLoggedIn ? (userObj?.address || "") : "";

  // 1. Build template
  wrapper.innerHTML = `
    <div class="promo-banner-image-container">
      <img src="/images/coverphoto.jpg" class="promo-banner-image" alt="Promo Banner">
    </div>

    <div class="promo-card">
      <div class="promo-header">
        <div class="promo-badge-gift">
          <i class="fas fa-gift"></i> Quà Tặng Đặc Biệt
        </div>
        <h2 class="promo-title">Đăng Ký Chương Trình</h2>
        <p class="promo-subtitle">Thay 3 lõi lọc tặng ngay 1 lõi lọc số 1 &amp; Vệ sinh máy miễn phí</p>
      </div>

      ${isLoggedIn ? `
      <div style="background: linear-gradient(135deg, #e0f2fe, #f0f9ff); border: 1px solid #bae6fd; border-radius: var(--radius-md); padding: 0.85rem 1.1rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem;">
        <i class="fas fa-user-check" style="color: #0284c7; font-size: 1.1rem; flex-shrink: 0;"></i>
        <p style="margin: 0; font-size: 0.875rem; color: #0369a1; line-height: 1.5;">
          Đã đăng nhập với tài khoản <strong>${prefillPhone}</strong>. Thông tin đã được điền sẵn, vui lòng xác nhận địa chỉ lắp đặt.
        </p>
      </div>
      ` : ""}

      <!-- Referral Staff Info Section -->
      <div id="promoStaffContainer" style="display: none;">
        <div class="promo-staff-card">
          <div class="promo-staff-avatar" id="promoStaffAvatar">
            <i class="fas fa-user-cog"></i>
          </div>
          <div class="promo-staff-info">
            <div class="promo-staff-label">Kỹ thuật viên hỗ trợ</div>
            <div class="promo-staff-name" id="promoStaffName">Đang tải...</div>
          </div>
        </div>
      </div>

      <!-- Registration Form -->
      <form id="promoRegisterForm">
        <div class="promo-form-group">
          <label for="phone">Số điện thoại <span class="required-asterisk">*</span></label>
          <div class="promo-input-wrapper">
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="Nhập số điện thoại của bạn"
              pattern="[0-9]{10}"
              value="${prefillPhone}"
              ${isLoggedIn ? 'readonly style="background:#f1f5f9; color:#64748b; cursor:not-allowed;"' : ""}
            >
            <i class="fas fa-phone"></i>
          </div>
        </div>

        <div class="promo-form-group">
          <label for="fullName">Họ và tên <span class="required-asterisk">*</span></label>
          <div class="promo-input-wrapper">
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              placeholder="Nhập họ và tên của bạn"
              value="${prefillName}"
              ${isLoggedIn && prefillName ? 'readonly style="background:#f1f5f9; color:#64748b; cursor:not-allowed;"' : ""}
            >
            <i class="fas fa-user"></i>
          </div>
        </div>

        <div class="promo-form-group">
          <label for="address">Địa chỉ lắp đặt <span class="required-asterisk">*</span></label>
          <div class="promo-input-wrapper">
            <input
              type="text"
              id="address"
              name="address"
              required
              placeholder="Nhập địa chỉ nhận dịch vụ"
              value="${prefillAddress}"
            >
            <i class="fas fa-map-marker-alt"></i>
          </div>
        </div>

        <div class="promo-checkbox-group">
          <label class="promo-checkbox-label">
            <input type="checkbox" id="agreeCheckbox" required checked>
            <span class="promo-checkbox-text">
              Tôi đồng ý đăng ký dịch vụ thay lõi lọc nước${!isLoggedIn ? ' và đồng ý lấy <strong>Số điện thoại</strong> làm thông tin tài khoản đăng nhập cho những lần sau.' : '.'}
            </span>
          </label>
        </div>

        <div id="promoErrorMsg" class="message message-error" style="display: none; margin-bottom: 1rem;"></div>

        <button type="submit" class="promo-btn-submit" id="btnSubmitPromo">
          <span>Đồng Ý Đăng Ký</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </form>
    </div>
  `;

  // 2. Fetch and render Staff Info if staffId exists
  if (staffId) {
    SupportService.getAllSupportTechnicians()
      .then((res) => {
        const technicians = res.data || [];
        const staff = technicians.find(t => String(t.id) === String(staffId));
        if (staff) {
          const staffContainer = wrapper.querySelector("#promoStaffContainer");
          const staffNameEl = wrapper.querySelector("#promoStaffName");
          const staffAvatarEl = wrapper.querySelector("#promoStaffAvatar");

          if (staffContainer && staffNameEl) {
            staffNameEl.textContent = staff.username || staff.name || `KTV #${staffId}`;

            // Set initials in avatar
            const displayName = staff.username || staff.name || "KTV";
            if (staffAvatarEl) {
              staffAvatarEl.textContent = displayName.charAt(0).toUpperCase();
            }

            staffContainer.style.display = "block";
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load staff details:", err);
      });
  }

  // 3. Attach Form Submission
  const form = wrapper.querySelector("#promoRegisterForm");
  const errorMsgEl = wrapper.querySelector("#promoErrorMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsgEl.style.display = "none";

    const name = form.fullName.value.trim();
    const phone = form.phone.value.trim();
    const address = form.address.value.trim();
    const agree = form.agreeCheckbox.checked;

    if (!name || !phone || !address) {
      showError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (name.length < 2) {
      showError("Họ và tên phải có ít nhất 2 ký tự!");
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      showError("Số điện thoại phải bao gồm 10 số!");
      return;
    }

    if (!agree) {
      showError("Bạn phải đồng ý với các điều khoản của chương trình!");
      return;
    }

    // Disable button to prevent double submit
    const submitBtn = form.querySelector("#btnSubmitPromo");
    if (submitBtn) {
      submitBtn.disabled = true;
      const span = submitBtn.querySelector("span");
      if (span) span.textContent = "Đang xử lý...";
    }

    // Begin background process screen
    renderProcessingScreen(wrapper, name, phone, address, staffId, isLoggedIn);
  });

  function showError(msg) {
    if (errorMsgEl) {
      errorMsgEl.textContent = msg;
      errorMsgEl.style.display = "block";
    }
  }
}

// Render background processing state
async function renderProcessingScreen(wrapper, name, phone, address, staffId, isLoggedIn) {
  wrapper.innerHTML = `
    <div class="promo-banner-image-container">
      <img src="/images/coverphoto.jpg" class="promo-banner-image" alt="Promo Banner">
    </div>

    <div class="promo-card">
      <div class="promo-loader-screen">
        <div class="promo-spinner-container">
          <div class="promo-pulse-circle"></div>
          <div class="promo-spinner-core">
            <i class="fas fa-cogs"></i>
          </div>
        </div>
        
        <h3 style="font-weight: 800; color: var(--secondary-color); margin-bottom: 0.5rem; font-size: 1.3rem;">Đang xử lý đăng ký</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">Vui lòng không tắt hoặc tải lại trang này</p>
        
        <div class="promo-steps-list">
          ${!isLoggedIn ? `
          <div class="promo-step-item pending" id="step-register">
            <i class="far fa-circle"></i>
            <span>Tạo tài khoản Socbay mới...</span>
          </div>
          <div class="promo-step-item pending" id="step-login">
            <i class="far fa-circle"></i>
            <span>Đăng nhập hệ thống...</span>
          </div>
          ` : ""}
          <div class="promo-step-item pending" id="step-booking">
            <i class="far fa-circle"></i>
            <span>Đặt lịch Thay lõi + Vệ sinh...</span>
          </div>
          <div class="promo-step-item pending" id="step-notify">
            <i class="far fa-circle"></i>
            <span>Đang gửi thông báo xác nhận...</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Step selectors
  const elReg = wrapper.querySelector("#step-register");
  const elLog = wrapper.querySelector("#step-login");
  const elBook = wrapper.querySelector("#step-booking");
  const elNotif = wrapper.querySelector("#step-notify");

  try {
    let userObj;

    if (isLoggedIn) {
      // Already logged in — skip register/login, use current session
      const user = authService.getUser();
      userObj = user?.user || user;
    } else {
      // 1. REGISTER USER
      setStepState(elReg, "active");
      await delay(1000); // Dramatic effect delay

      await authService.register(phone, name, phone); // Password is the phone number
      setStepState(elReg, "completed");

      // 2. LOGIN USER
      setStepState(elLog, "active");
      await delay(800);

      await authService.login(phone, phone);
      setStepState(elLog, "completed");

      // Get logged-in user details
      const user = authService.getUser();
      userObj = user?.user || user;
    }

    const userId = userObj?.id || userObj?.user?.id;

    // 3. BOOK FILTER REPLACEMENT + CLEANING
    setStepState(elBook, "active");
    await delay(1000);

    // Format target time: Day/Month/Year Hour:Minute
    const formatDateTime = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const today = new Date();

    const bookingData = {
      customer: userId,
      time_start: formatDateTime(today),
      type_task: "2", // [Thay lõi + VS]
      des: "Đăng ký chương trình thay 3 lõi lọc tặng 1 lõi lọc 1",
      status: 1,
      priority: 1,
      user_create: "161",
      address: address,
      images: ["/core_image/ec7e1Lxm1783579347.jpg"] // Ảnh promo có sẵn trên server
    };

    // Add sale_id (technician ID) if available
    if (staffId) {
      bookingData.sale_id = staffId;
    }

    const bookingRes = await servicesService.bookingService(bookingData);
    setStepState(elBook, "completed");

    // 4. NOTIFICATION
    setStepState(elNotif, "active");
    await delay(800);

    try {
      const notificationData = notificationService.formatBookingNotificationData(
        { ...bookingData, id: bookingRes.data?.id || bookingRes.id },
        userObj,
        "[Thay lõi + VS]"
      );
      await notificationService.sendBookingNotification(notificationData);
    } catch (notifErr) {
      console.error("Non-blocking notification error:", notifErr);
    }
    setStepState(elNotif, "completed");
    await delay(500);

    // Done! Show Success Screen
    renderSuccessScreen(wrapper, name, phone, address, isLoggedIn);
  } catch (error) {
    console.error("Promo registration workflow failed:", error);
    // Find currently active element to mark error
    const activeEl = wrapper.querySelector(".promo-step-item.active");
    if (activeEl) {
      activeEl.className = "promo-step-item";
      activeEl.style.color = "#ef4444";
      const icon = activeEl.querySelector("i");
      if (icon) icon.className = "fas fa-exclamation-triangle";
    }

    // Show back to form button and error details
    const errorContainer = document.createElement("div");
    errorContainer.style.marginTop = "2rem";
    errorContainer.innerHTML = `
      <div class="message message-error" style="text-align: left; margin-bottom: 1.5rem;">
        <strong>Lỗi xử lý:</strong> ${error.message || "Có lỗi xảy ra trong quá trình đăng ký."}
      </div>
      <button class="promo-btn-submit" id="btnBackToForm" style="background: var(--secondary-color);">
        <i class="fas fa-undo"></i> Quay lại làm lại
      </button>
    `;

    const cardEl = wrapper.querySelector(".promo-card");
    if (cardEl) {
      cardEl.appendChild(errorContainer);
    }

    wrapper.querySelector("#btnBackToForm")?.addEventListener("click", () => {
      renderForm(wrapper, staffId);
    });
  }
}

// Update UI step state helper
function setStepState(element, state) {
  if (!element) return;

  const icon = element.querySelector("i");
  if (state === "active") {
    element.className = "promo-step-item active";
    if (icon) icon.className = "fas fa-spinner fa-spin";
  } else if (state === "completed") {
    element.className = "promo-step-item completed";
    if (icon) icon.className = "fas fa-check-circle";
  }
}

// Render Success Screen
function renderSuccessScreen(wrapper, name, phone, address, isLoggedIn) {
  wrapper.innerHTML = `
    <div class="promo-banner-image-container">
      <img src="/images/coverphoto.jpg" class="promo-banner-image" alt="Promo Banner">
    </div>

    <div class="promo-card" style="position: relative; overflow: hidden;">
      <!-- Confetti particles -->
      <div class="promo-confetti-container">
        <div class="promo-confetti-piece"></div>
        <div class="promo-confetti-piece"></div>
        <div class="promo-confetti-piece"></div>
        <div class="promo-confetti-piece"></div>
        <div class="promo-confetti-piece"></div>
        <div class="promo-confetti-piece"></div>
        <div class="promo-confetti-piece"></div>
        <div class="promo-confetti-piece"></div>
        <div class="promo-confetti-piece"></div>
        <div class="promo-confetti-piece"></div>
      </div>

      <div class="promo-success-screen">
        <div class="promo-success-circle">
          <i class="fas fa-check"></i>
        </div>
        
        <h2 class="promo-success-title">Đăng Ký Thành Công</h2>
        <p class="promo-success-desc">
          Chúc mừng <strong>${name}</strong>! Bạn đã đăng ký thành công chương trình <strong>Thay 3 lõi lọc tặng 1 lõi lọc 1</strong>. Kỹ thuật viên sẽ liên hệ với bạn trong thời gian sớm nhất.
        </p>

        ${!isLoggedIn ? `
        <!-- Account Info for Next Logins (only shown for new accounts) -->
        <div class="promo-creds-card">
          <div class="promo-creds-title">Thông tin tài khoản đăng nhập</div>
          <div class="promo-creds-row">
            <span class="promo-creds-label">Tài khoản (Số điện thoại):</span>
            <span class="promo-creds-val">${phone}</span>
          </div>
          <div class="promo-creds-row">
            <span class="promo-creds-label">Mật khẩu mặc định:</span>
            <span class="promo-creds-val">${phone}</span>
          </div>
          <p style="margin: 0.5rem 0 0; font-size: 0.8rem; color: #dc2626; font-style: italic;">
            * Bạn hãy ghi nhớ thông tin này để đăng nhập lần sau.
          </p>
        </div>
        ` : ""}

        <div class="promo-success-buttons">
          <a href="#/booking-history" class="promo-btn-secondary" style="display: flex; align-items: center; justify-content: center; text-decoration: none;">Xem lịch hẹn</a>
          <a href="#/" class="promo-btn-primary" style="display: flex; align-items: center; justify-content: center; text-decoration: none;">Trang chủ</a>
        </div>
      </div>
    </div>
  `;

  // Display success toast notification
  Toast.success("Đăng ký chương trình thành công!", 4000);
}
