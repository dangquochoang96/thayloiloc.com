import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { historyService } from "../services/history.service.js";
import { mobileApi } from "../services/api.js";

import "../styles/feedback/feedback-page.css";

export function FeedbackPage() {
  const container = document.createElement("div");
  container.className = "page-container";

  container.appendChild(Header());

  const main = document.createElement("main");
  main.className = "feedback-main";

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
  const user = authService.getCurrentUser();
  setTimeout(() => setupFeedbackEvents(container, user), 0);

  return container;
}

async function loadUserOrders(container, user) {
  const orderSelect = container.querySelector("#order_id");
  if (!orderSelect) return;

  try {
    const userId = user.id || user.user_id || user.userId;
    const result = await historyService.getListOrderByCustomer(userId);
    
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
  
  // Store selected files at function scope level
  let selectedFiles = [];

  // Load user orders
  loadUserOrders(container, user);

  // Image preview functionality
  if (imageInput) {
    
    imageInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      
      // Add new files, but limit to 4 total
      files.forEach(file => {
        if (file.type.startsWith("image/") && selectedFiles.length < 4) {
          selectedFiles.push(file);
        }
      });
      
      // Refresh the preview
      renderImagePreviews();
    });
    
    // Function to render image previews
    function renderImagePreviews() {
      imagePreview.innerHTML = "";
      
      selectedFiles.forEach((file, index) => {
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
          
          // Add event listener to remove button
          const removeButton = previewItem.querySelector(".remove-image");
          removeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            // Remove the file from selectedFiles array using the data-index attribute
            const currentIndex = parseInt(removeButton.getAttribute("data-index"));
            selectedFiles.splice(currentIndex, 1);
            
            // Update the file input value to reflect removed files
            const dt = new DataTransfer();
            selectedFiles.forEach(file => dt.items.add(file));
            imageInput.files = dt.files;
            
            // Re-render previews
            renderImagePreviews();
          });
          
          imagePreview.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
      });
      
      // Update the file input to reflect current selected files
      const dt = new DataTransfer();
      selectedFiles.forEach(file => dt.items.add(file));
      imageInput.files = dt.files;
    }
    
    // Handle drag and drop
    const uploadContainer = container.querySelector(".image-upload-container");
    uploadContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadContainer.classList.add("drag-over");
    });
    
    uploadContainer.addEventListener("dragleave", () => {
      uploadContainer.classList.remove("drag-over");
    });
    
    uploadContainer.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadContainer.classList.remove("drag-over");
      
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith("image/"));
      
      // Add new files, but limit to 4 total
      files.forEach(file => {
        if (selectedFiles.length < 4) {
          selectedFiles.push(file);
        }
      });
      
      // Refresh the preview
      renderImagePreviews();
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
        const imageFiles = imageInput.files;
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

        const res = await mobileApi.postFormData("/feedbacks", formData);
        console.log(res);
        
        showSuccessMessage(container);
        form.reset();
        imagePreview.innerHTML = "";
        // Clear the image input
        imageInput.value = "";
        // Reset selected files array
        selectedFiles = [];
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
