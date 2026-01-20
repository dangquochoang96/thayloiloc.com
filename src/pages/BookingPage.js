import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { servicesService } from "../services/services.service.js";
import { productService } from "../services/product.service.js";
import { api } from "../services/api.js";

// Import HTML templates
import loginRequiredTemplate from "../templates/booking/login-required.html?raw";
import bookingFormTemplate from "../templates/booking/booking-form.html?raw";

// Import CSS styles
import "../styles/booking/booking-form.css";

export function BookingPage() {
  const container = document.createElement("div");

  container.appendChild(Header());

  const main = document.createElement("main");
  main.className = "booking-main";
  main.style.cssText = `
    padding: 100px 0 60px;
    min-height: 70vh;
    background: #f8f9fa;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  `;

  // Create centered container
  const centeredContainer = document.createElement("div");
  centeredContainer.className = "booking-container";
  centeredContainer.style.cssText = `
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    padding: 0 20px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 40px;
  `;

  if (!authService.isAuthenticated()) {
    centeredContainer.innerHTML = loginRequiredTemplate;
    main.appendChild(centeredContainer);
    container.appendChild(main);
    container.appendChild(Footer());
    return container;
  }

  const user = authService.getUser();

  // Check for service selection from URL parameters
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const selectedServiceId = urlParams.get('service_id');
  const selectedServiceName = urlParams.get('service_name');

  const title = document.createElement("h1");
  title.textContent = selectedServiceName ? `Đặt Lịch - ${decodeURIComponent(selectedServiceName)}` : "Đặt Lịch Dịch Vụ";
  title.style.cssText = `
    margin-bottom: 2rem;
    text-align: center;
    color: #1a1a2e;
    font-size: 2.2rem;
    font-weight: 700;
  `;
  centeredContainer.appendChild(title);

  // Show selected service info if available
  if (selectedServiceId && selectedServiceName) {
    const serviceInfo = document.createElement("div");
    serviceInfo.className = "selected-service-info";
    serviceInfo.style.cssText = `
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      padding: 20px;
      border-radius: 15px;
      margin-bottom: 30px;
      border-left: 5px solid #f97316;
      text-align: center;
    `;
    serviceInfo.innerHTML = `
      <h3 style="color: #f97316; margin-bottom: 10px;">
        <i class="fas fa-check-circle"></i> Dịch vụ đã chọn
      </h3>
      <p style="color: #333; font-weight: 500; margin: 0;">
        ${decodeURIComponent(selectedServiceName)}
      </p>
    `;
    centeredContainer.appendChild(serviceInfo);
  }

  const formContainer = document.createElement("div");
  formContainer.innerHTML = bookingFormTemplate;
  const form = formContainer.querySelector("#booking-form");

  centeredContainer.appendChild(form);

  // Add responsive styles
  const style = document.createElement("style");
  style.textContent = `
    .booking-main {
      padding: 100px 0 60px !important;
      min-height: 70vh !important;
      background: #f8f9fa !important;
      display: flex !important;
      justify-content: center !important;
      align-items: flex-start !important;
    }

    .booking-container {
      max-width: 800px !important;
      width: 100% !important;
      margin: 0 auto !important;
      background: white !important;
      border-radius: 20px !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
      padding: 40px !important;
    }

    .booking-container h1 {
      text-align: center !important;
      color: #1a1a2e !important;
      font-size: 2.2rem !important;
      font-weight: 700 !important;
      margin-bottom: 2rem !important;
    }

    .selected-service-info {
      text-align: center !important;
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9) !important;
      padding: 20px !important;
      border-radius: 15px !important;
      margin-bottom: 30px !important;
      border-left: 5px solid #f97316 !important;
    }
    
    /* Image upload styles */
    .preview-item {
      position: relative;
      display: inline-block;
      margin: 5px;
      width: 100px;
      height: 100px;
    }
    
    .preview-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 2px solid #d1d5db;
    }
    
    .remove-image {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    
    .image-upload-container {
      border: 2px dashed #d1d5db;
      border-radius: var(--radius-md);
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.3s ease;
    }
    
    .image-upload-container.drag-over {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .booking-main {
        padding: 80px 0 40px !important;
      }
      
      .booking-container {
        margin: 0 15px !important;
        padding: 25px !important;
        border-radius: 15px !important;
      }
      
      .booking-container h1 {
        font-size: 1.8rem !important;
      }
    }

    @media (max-width: 480px) {
      .booking-container {
        margin: 0 10px !important;
        padding: 20px !important;
      }
      
      .booking-container h1 {
        font-size: 1.6rem !important;
      }
    }
  `;
  container.appendChild(style);

  // Add the centered container to main
  main.appendChild(centeredContainer);

  // Load danh sách sản phẩm
  const productSelect = form.querySelector("#product_id");
  const addressInput = form.querySelector("#address");
  let productsData = []; // Store products data with addresses

  productService
    .getListProduct(user.id)
    .then((products) => {
      productSelect.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';

      if (products && products.length > 0) {
        productsData = products; // Store the products data
        products.forEach((product) => {
          const option = document.createElement("option");
          option.value = product.id;
          option.textContent = `${product.product.name || "Sản phẩm"}`;
          productSelect.appendChild(option);
          console.log(product);
        });
      } else {
        productSelect.innerHTML =
          '<option value="">Chưa mua sản phẩm nào</option>';
      }
    })
    .catch((error) => {
      console.error("Error loading products:", error);
      productSelect.innerHTML =
        '<option value="">Lỗi khi tải sản phẩm</option>';
    });

  // Auto-fill address when product is selected
  productSelect.addEventListener("change", (e) => {
    const selectedProductId = e.target.value;
    if (selectedProductId && productsData.length > 0) {
      const selectedProduct = productsData.find(
        (p) => p.id === parseInt(selectedProductId)
      );
      if (selectedProduct && selectedProduct.address) {
        addressInput.value = selectedProduct.address;
      }
    }
  });

  // Preview images
  const imageInput = form.querySelector("#images");
  const imagePreview = form.querySelector("#image-preview");
  
  // Store selected files at function scope level
  let selectedFiles = [];

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
  const uploadContainer = form.querySelector('.image-upload-container');
  if (uploadContainer) {
    uploadContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadContainer.classList.add('drag-over');
    });
    
    uploadContainer.addEventListener('dragleave', () => {
      uploadContainer.classList.remove('drag-over');
    });
    
    uploadContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadContainer.classList.remove('drag-over');
      
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      
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
  const errorMsg = form.querySelector("#error-msg");
  const successMsg = form.querySelector("#success-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";
    successMsg.style.display = "none";
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    submitBtn.disabled = true;

    try {
      // Upload images first and get URLs
      const imageFiles = imageInput.files;
      let imageUrls = [];
      
      if (imageFiles.length > 0) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải ảnh...';
        try {
          imageUrls = await api.uploadMultipleImages(imageFiles);
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          errorMsg.textContent = "Không thể tải ảnh lên. Vui lòng thử lại.";
          errorMsg.style.display = "block";
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          return;
        }
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đặt lịch...';
      }

      // Format datetime to "DD/MM/YYYY HH:mm"
      const formatDateTime = (datetimeLocal) => {
        const date = new Date(datetimeLocal);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      };

      // Prepare booking data
      const bookingData = {
        customer: user.id,
        time_star: formatDateTime(form.time_star.value),
        time_end: formatDateTime(form.time_end.value),
        type_task: form.type_task.value,
        des: form.des.value || "",
        status: "1",
        priority: "1",
        staff: "",
        user_create: "161",
        product_id: form.product_id.value,
        images: imageUrls, // Use uploaded image URLs
        address: form.address.value,
      };

      const response = await servicesService.bookingService(bookingData);

      successMsg.textContent =
        "Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.";
      successMsg.style.display = "block";
      
      // Reset form and image preview
      form.reset();
      imagePreview.innerHTML = "";
      imageInput.value = ""; // Clear the image input
      
      setTimeout(() => {
        successMsg.style.display = "none";
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 2000);
    } catch (error) {
      console.error("Error submitting booking:", error);
      errorMsg.textContent =
        error.message || "Đặt lịch thất bại. Vui lòng thử lại.";
      errorMsg.style.display = "block";
    } finally {
      // Ensure button is re-enabled in case of error
      if (submitBtn.disabled) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    }
  });

  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}
