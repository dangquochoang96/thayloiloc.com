import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { bookingService } from "../services/booking.service.js";
import { formatDate } from "../utils/helpers.js";

// Import HTML template
import profileTemplate from "../templates/auth/profile.html?raw";

// Import CSS styles
import "../styles/auth/profile.css";

export function ProfilePage() {
  const container = document.createElement("div");
  container.className = "page-container";

  container.appendChild(Header());

  const main = document.createElement("main");
  main.className = "profile-main";

  const profileContainer = document.createElement("div");
  profileContainer.innerHTML = profileTemplate;
  const profileContent = profileContainer.firstElementChild;

  // Load user data
  loadUserProfile(profileContent);

  // Load booking history
  const user = authService.getCurrentUser();
  loadBookingHistory(profileContent);

  // Handle form submissions
  setupEventListeners(profileContent);

  main.appendChild(profileContent);
  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}

function loadUserProfile(container) {
  const user = authService.getCurrentUser();
  
  if (!user) {
    window.location.hash = "/login";
    return;
  }

  // Debug user data structure
  console.log("Profile page - user data:", user);
  authService.debugUserData();

  // Fill user information with better field handling
  const nameInput = container.querySelector("#fullName");
  const phoneInput = container.querySelector("#phone");
  const emailInput = container.querySelector("#email");
  const addressInput = container.querySelector("#address");
  const avatarImg = container.querySelector("#avatar-preview");
  const userNameDisplay = container.querySelector("#user-name");
  const userPhoneDisplay = container.querySelector("#user-phone");
  const pointDisplay = container.querySelector("#user-point");

  // Handle different possible field names for user data
  const userName = user.name || user.fullName || user.username || user.ten || user.ho_ten || "";
  const userPhone = user.phone || user.phoneNumber || user.sdt || user.so_dien_thoai || "";
  const userEmail = user.email || user.emailAddress || user.email_address || "";
  const userAddress = user.address || user.diachi || user.dia_chi || "";
  const userAvatar = user.avatar || user.avatarUrl || user.avatar_url || user.hinh_anh || "";
  const point = user.point || user.tich_diem || 0;

  if (nameInput) nameInput.value = userName;
  if (phoneInput) phoneInput.value = userPhone;
  if (emailInput) emailInput.value = userEmail;
  if (addressInput) addressInput.value = userAddress;
  if (userNameDisplay) userNameDisplay.textContent = userName || "Người dùng";
  if (userPhoneDisplay) userPhoneDisplay.textContent = userPhone || "";
  if (pointDisplay) pointDisplay.textContent = `${point} tích điểm` || "0 tích điểm";
  
  // Set avatar
  if (avatarImg) {
    avatarImg.src = userAvatar || "/images/default-avatar.svg";
  }
}

function setupEventListeners(container) {
  // Profile form submission
  const profileForm = container.querySelector("#profile-form");
  const successMsg = container.querySelector("#success-msg");
  const errorMsg = container.querySelector("#error-msg");

  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Show loading state
      const submitBtn = profileForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
      submitBtn.disabled = true;
      
      const formData = new FormData(profileForm);
      const userData = {
        name: formData.get("fullName"),
        email: formData.get("email"),
        address: formData.get("address")
      };

      try {
        await authService.updateProfile(userData);
        showMessage(successMsg, "Cập nhật thông tin thành công!");
        
        // Update header display
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        showMessage(errorMsg, error.message || "Có lỗi xảy ra khi cập nhật thông tin");
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Password change form
  const passwordForm = container.querySelector("#password-form");
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Show loading state
      const submitBtn = passwordForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đổi mật khẩu...';
      submitBtn.disabled = true;
      
      const currentPassword = passwordForm.currentPassword.value;
      const newPassword = passwordForm.newPassword.value;
      const confirmPassword = passwordForm.confirmPassword.value;

      if (newPassword !== confirmPassword) {
        showMessage(errorMsg, "Mật khẩu xác nhận không khớp");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
      }

      if (newPassword.length < 6) {
        showMessage(errorMsg, "Mật khẩu mới phải có ít nhất 6 ký tự");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
      }

      try {
        await authService.changePassword(currentPassword, newPassword);
        showMessage(successMsg, "Đổi mật khẩu thành công!");
        passwordForm.reset();
      } catch (error) {
        showMessage(errorMsg, error.message || "Có lỗi xảy ra khi đổi mật khẩu");
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Avatar upload with better handling
  const avatarInput = container.querySelector("#avatar-input");
  const avatarPreview = container.querySelector("#avatar-preview");
  
  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showMessage(errorMsg, "Kích thước file không được vượt quá 5MB");
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          showMessage(errorMsg, "Vui lòng chọn file hình ảnh");
          return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
          avatarPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Upload avatar
        try {
          await authService.uploadAvatar(file);
          showMessage(successMsg, "Cập nhật ảnh đại diện thành công!");
        } catch (error) {
          showMessage(errorMsg, error.message || "Có lỗi xảy ra khi tải ảnh lên");
          // Reset preview on error
          const user = authService.getCurrentUser();
          avatarPreview.src = user?.avatar || "/images/default-avatar.svg";
        }
      }
    });
  }

  // Tab switching with better UX
  const tabButtons = container.querySelectorAll(".tab-btn");
  const tabContents = container.querySelectorAll(".tab-content");

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;
      
      // Remove active class from all tabs and contents
      tabButtons.forEach(btn => btn.classList.remove("active"));
      tabContents.forEach(content => content.classList.remove("active"));
      
      // Add active class to clicked tab and corresponding content
      button.classList.add("active");
      const targetContent = container.querySelector(`#${targetTab}`);
      if (targetContent) {
        targetContent.classList.add("active");
      }

      // Clear any existing messages when switching tabs
      const allMessages = container.querySelectorAll('.alert');
      allMessages.forEach(msg => msg.style.display = 'none');
    });
  });

  // Password visibility toggle
  const toggleButtons = container.querySelectorAll('.toggle-password');
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      const icon = button.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

function showMessage(element, message) {
  if (element) {
    element.textContent = message;
    element.style.display = "block";
    
    setTimeout(() => {
      element.style.display = "none";
    }, 3000);
  }
}

async function loadBookingHistory(container) {
  const bookingList = container.querySelector('.booking-list');
  if (!bookingList) return;

  try {
    // Show loading state
    bookingList.innerHTML = `
      <div class="loading-state" style="text-align: center; padding: 2rem;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #f97316;"></i>
        <p style="margin-top: 1rem; color: #666;">Đang tải lịch sử thay lõi...</p>
      </div>
    `;

    const user = authService.getCurrentUser();
    if (!user) return;

    // Get user booking history
    const bookingHistory = await bookingService.getLastReplaceFilterCore(user.id);
    console.log('Booking history:', bookingHistory);

    // Get the first booking if exists
    if (bookingHistory && bookingHistory.length > 0) {
      const firstBooking = bookingHistory[0];
      
      // Render the first booking
      bookingList.innerHTML = `
        <div class="booking-item" data-order-id="${firstBooking.order_id}" style="cursor: pointer;">
          <div class="booking-info">
            <h4>Đơn hàng #${firstBooking.order_id}</h4>
            <p><i class="fas fa-calendar"></i> Ngày thay: ${formatDate(firstBooking.replace_date)}</p>
            <p><i class="fas fa-clock"></i> Ngày hẹn thay tiếp: ${formatDate(firstBooking.replace_date_promise)}</p>
          </div>
          <div class="booking-status pending">
            <i class="fas fa-clock"></i>
            Đang chờ
          </div>
        </div>
      `;
      
      // Add click event listener to the booking item
      const bookingItem = bookingList.querySelector('.booking-item');
      if (bookingItem) {
        bookingItem.addEventListener('click', () => {
          const orderId = bookingItem.getAttribute('data-order-id');
          window.location.hash = `/filter-history-detail/${orderId}`;
        });
      }
    } else {
      // No bookings found
      bookingList.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 3rem;">
          <i class="fas fa-calendar-times" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
          <h4 style="color: #666; margin-bottom: 0.5rem;">Chưa có lịch sử đặt lịch</h4>
          <p style="color: #999;">Bạn chưa có lịch sử thay lõi lọc nào</p>
          <a href="#/booking" class="btn btn-primary" style="margin-top: 1rem;">
            <i class="fas fa-plus"></i> Đặt lịch ngay
          </a>
        </div>
      `;
    }

  } catch (error) {
    console.error('Error loading filter history:', error);
    bookingList.innerHTML = `
      <div class="error-state" style="text-align: center; padding: 2rem;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 1rem;"></i>
        <p style="color: #666;">Có lỗi xảy ra khi tải lịch sử thay lõi</p>
        <button onclick="location.reload()" class="btn btn-secondary" style="margin-top: 1rem;">
          <i class="fas fa-redo"></i> Thử lại
        </button>
      </div>
    `;
  }
}

function formatPrice(price) {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function getFilterStatus(expireDate) {
  if (!expireDate) return 'pending';
  const expire = new Date(expireDate);
  const now = new Date();
  const diffDays = Math.ceil((expire - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'warning';
  return 'active';
}

function getFilterStatusIcon(expireDate) {
  const status = getFilterStatus(expireDate);
  switch (status) {
    case 'expired': return 'fa-times-circle';
    case 'warning': return 'fa-exclamation-circle';
    case 'active': return 'fa-check-circle';
    default: return 'fa-question-circle';
  }
}

function getFilterStatusText(expireDate) {
  const status = getFilterStatus(expireDate);
  switch (status) {
    case 'expired': return 'Đã hết hạn';
    case 'warning': return 'Sắp hết hạn';
    case 'active': return 'Còn hạn';
    default: return 'Không xác định';
  }
}

