import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { mobileApi } from "../services/api.js";

import "../styles/feedback/feedback-page.css";

export function FeedbackPage() {
  const container = document.createElement("div");
  container.className = "page-container";

  container.appendChild(Header());

  const main = document.createElement("main");
  main.className = "feedback-main";

  // Check if user is logged in
  const user = authService.getCurrentUser();
  if (!user) {
    main.innerHTML = `
      <div class="feedback-container">
        <div class="login-required">
          <i class="fas fa-lock"></i>
          <h2>Vui lòng đăng nhập</h2>
          <p>Bạn cần đăng nhập để gửi phản hồi</p>
          <a href="#/login" class="btn-login">
            <i class="fas fa-sign-in-alt"></i> Đăng nhập ngay
          </a>
        </div>
      </div>
    `;
    container.appendChild(main);
    container.appendChild(Footer());
    return container;
  }

  main.innerHTML = `
    <div class="feedback-container">
      <div class="feedback-header">
        <h1><i class="fas fa-comment-dots"></i> Gửi Phản Hồi</h1>
        <p>Chúng tôi luôn lắng nghe ý kiến của bạn để cải thiện dịch vụ</p>
      </div>

      <div class="feedback-content">
        <form id="feedback-form" class="feedback-form">
          <div class="form-group">
            <label for="order_id"><i class="fas fa-receipt"></i> Chọn đơn hàng</label>
            <select id="order_id" name="order_id" required>
              <option value="">-- Đang tải đơn hàng... --</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description"><i class="fas fa-comment-alt"></i> Nội dung phản hồi</label>
            <textarea id="description" name="description" rows="6" placeholder="Nhập nội dung phản hồi của bạn..." required></textarea>
          </div>

          <div class="form-group">
            <label for="images"><i class="fas fa-images"></i> Hình ảnh đính kèm</label>
            <div class="image-upload-container">
              <input type="file" id="images" name="images" accept="image/*" multiple>
              <div class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Chọn hoặc kéo thả hình ảnh vào đây</span>
              </div>
            </div>
            <div class="image-preview" id="image-preview"></div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit">
              <i class="fas fa-paper-plane"></i> Gửi Phản Hồi
            </button>
          </div>
        </form>

        <div class="feedback-info">
          <div class="info-card">
            <i class="fas fa-clock"></i>
            <h3>Thời gian phản hồi</h3>
            <p>Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc</p>
          </div>
          <div class="info-card">
            <i class="fas fa-shield-alt"></i>
            <h3>Bảo mật thông tin</h3>
            <p>Thông tin của bạn được bảo mật tuyệt đối</p>
          </div>
          <div class="info-card">
            <i class="fas fa-headset"></i>
            <h3>Hỗ trợ 24/7</h3>
            <p>Hotline: 0963456911</p>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(main);
  container.appendChild(Footer());

  // Setup event listeners after DOM is ready
  setTimeout(() => setupFeedbackEvents(container, user), 0);

  return container;
}

async function loadUserOrders(container, user) {
  const orderSelect = container.querySelector("#order_id");
  if (!orderSelect) return;

  try {
    const userId = user.id || user.user_id || user.userId;
    const result = await mobileApi.get(`/order/list-order-by-customer/${userId}`);
    
    const orders = result.data || [];

    if (orders.length === 0) {
      orderSelect.innerHTML = `<option value="">-- Không có đơn hàng nào --</option>`;
    } else {
      orderSelect.innerHTML = `<option value="">-- Chọn đơn hàng --</option>`;
      orders.forEach(order => {
        const orderId = order.id;
        const productName = order.product || '';
        const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : '';
        orderSelect.innerHTML += `<option value="${orderId}">${productName} ${orderDate ? `(${orderDate})` : ''}</option>`;
      });
    }
  } catch (error) {
    console.error("Error loading orders:", error);
    orderSelect.innerHTML = `<option value="">-- Không thể tải đơn hàng --</option>`;
  }
}

function setupFeedbackEvents(container, user) {
  const form = container.querySelector("#feedback-form");
  const imageInput = container.querySelector("#images");
  const imagePreview = container.querySelector("#image-preview");

  // Load user orders
  loadUserOrders(container, user);

  // Image preview functionality
  if (imageInput) {
    imageInput.addEventListener("change", (e) => {
      imagePreview.innerHTML = "";
      const files = e.target.files;
      
      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const previewItem = document.createElement("div");
            previewItem.className = "preview-item";
            previewItem.innerHTML = `
              <img src="${e.target.result}" alt="Preview ${index + 1}">
              <button type="button" class="remove-image" data-index="${index}">
                <i class="fas fa-times"></i>
              </button>
            `;
            imagePreview.appendChild(previewItem);
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }

  // Form submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector(".btn-submit");
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
      submitBtn.disabled = true;

      try {
        const orderId = form.querySelector("#order_id").value;
        const description = form.querySelector("#description").value;
        const customerId = user.id || user.user_id || user.userId;

        if (!orderId) {
          showErrorMessage(container, "Vui lòng chọn đơn hàng");
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          return;
        }

        // Upload images first and get URLs
        const imageFiles = form.querySelector("#images").files;
        let imageUrls = [];
        
        if (imageFiles.length > 0) {
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải ảnh...';
          try {
            imageUrls = await mobileApi.uploadMultipleImages(imageFiles);
          } catch (uploadError) {
            console.error("Error uploading images:", uploadError);
            showErrorMessage(container, "Không thể tải ảnh lên. Vui lòng thử lại.");
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
          }
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        }

        // Send feedback with FormData
        const formData = new FormData();
        formData.append("order_id", orderId);
        formData.append("description", description);
        formData.append("customer_id", customerId);
        
        // Add image URLs individually
        if (imageUrls.length > 0) {
          imageUrls.forEach(url => {
            formData.append("images[]", url);
          });
        }

        await mobileApi.postFormData("/feedbacks", formData);

        showSuccessMessage(container);
        form.reset();
        imagePreview.innerHTML = "";
        // Reload orders dropdown
        loadUserOrders(container, user);
      } catch (error) {
        console.error("Error submitting feedback:", error);
        showErrorMessage(container, error.message || "Có lỗi xảy ra khi gửi phản hồi");
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

function showSuccessMessage(container) {
  const existingMsg = container.querySelector(".feedback-message");
  if (existingMsg) existingMsg.remove();

  const msg = document.createElement("div");
  msg.className = "feedback-message success";
  msg.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ liên hệ lại sớm nhất.</span>
  `;
  
  const form = container.querySelector(".feedback-form");
  form.insertBefore(msg, form.firstChild);

  setTimeout(() => msg.remove(), 5000);
}

function showErrorMessage(container, message) {
  const existingMsg = container.querySelector(".feedback-message");
  if (existingMsg) existingMsg.remove();

  const msg = document.createElement("div");
  msg.className = "feedback-message error";
  msg.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;
  
  const form = container.querySelector(".feedback-form");
  form.insertBefore(msg, form.firstChild);

  setTimeout(() => msg.remove(), 5000);
}
