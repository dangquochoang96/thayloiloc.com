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
  main.className = "container";
  main.style.padding = "3rem 0";
  main.style.minHeight = "60vh";

  if (!authService.isAuthenticated()) {
    main.innerHTML = loginRequiredTemplate;
    container.appendChild(main);
    container.appendChild(Footer());
    return container;
  }

  const user = authService.getUser();

  const title = document.createElement("h1");
  title.textContent = "Đặt Lịch Dịch Vụ";
  title.style.marginBottom = "2rem";
  main.appendChild(title);

  const formContainer = document.createElement("div");
  formContainer.innerHTML = bookingFormTemplate;
  const form = formContainer.querySelector("#booking-form");

  main.appendChild(form);

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
