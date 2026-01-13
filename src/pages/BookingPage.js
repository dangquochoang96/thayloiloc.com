import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { servicesService } from "../services/services.service.js";
import { productService } from "../services/product.service.js";

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

  imageInput.addEventListener("change", (e) => {
    imagePreview.innerHTML = "";
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target.result;
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "var(--radius-sm)";
        img.style.border = "2px solid #d1d5db";
        imagePreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

  // Form submission
  const errorMsg = form.querySelector("#error-msg");
  const successMsg = form.querySelector("#success-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

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
      images: [], // TODO: Upload images to server first and get URLs
      address: form.address.value,
    };

    try {
      const response = await servicesService.bookingService(bookingData);

      successMsg.textContent =
        "Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.";
      successMsg.style.display = "block";

      // Reset form after 2 seconds
      setTimeout(() => {
        form.reset();
        imagePreview.innerHTML = "";
        successMsg.style.display = "none";
      }, 2000);
    } catch (error) {
      errorMsg.textContent =
        error.message || "Đặt lịch thất bại. Vui lòng thử lại.";
      errorMsg.style.display = "block";
    }
  });

  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}
