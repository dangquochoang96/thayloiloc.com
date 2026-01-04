import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { servicesService } from "../services/services.service.js";
import { productService } from "../services/product.service.js";

export function BookingPage() {
  const container = document.createElement("div");

  container.appendChild(Header());

  const main = document.createElement("main");
  main.className = "container";
  main.style.padding = "3rem 0";
  main.style.minHeight = "60vh";

  if (!authService.isAuthenticated()) {
    main.innerHTML = `
       <div style="text-align: center; margin-top: 3rem;">
         <h2>Please Login to Book a Service</h2>
         <p style="margin-bottom: 2rem; color: var(--text-muted);">You need an account to schedule appointments.</p>
         <a href="#/login" class="btn btn-primary">Login Now</a>
       </div>
     `;
    container.appendChild(main);
    container.appendChild(Footer());
    return container;
  }

  const user = authService.getUser();

  const title = document.createElement("h1");
  title.textContent = "Đặt Lịch Dịch Vụ";
  title.style.marginBottom = "2rem";
  main.appendChild(title);

  const form = document.createElement("form");
  form.className = "card";
  form.style.maxWidth = "700px";
  form.id = "booking-form";

  form.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <!-- Loại dịch vụ -->
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Loại Dịch Vụ <span style="color: red;">*</span></label>
        <select id="type_task" name="type_task" required style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
          <option value="">-- Chọn loại dịch vụ --</option>
          <option value="1">[VS Bảo dưỡng]</option>
          <option value="2">[Thay lõi + VS]</option>
          <option value="3">[Sửa máy + VS]</option>
          <option value="4">[Lắp máy]</option>
          <option value="5">[Chuyển máy]</option>
        </select>
      </div>

      <!-- Sản phẩm -->
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Sản Phẩm <span style="color: red;">*</span></label>
        <select id="product_id" name="product_id" required style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
          <option value="">Đang tải...</option>
        </select>
      </div>

      <!-- Thời gian bắt đầu -->
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Thời Gian Bắt Đầu <span style="color: red;">*</span></label>
        <input type="datetime-local" id="time_star" name="time_star" required style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
      </div>

      <!-- Thời gian kết thúc -->
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Thời Gian Kết Thúc <span style="color: red;">*</span></label>
        <input type="datetime-local" id="time_end" name="time_end" required style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
      </div>

      <!-- Địa chỉ -->
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Địa Chỉ <span style="color: red;">*</span></label>
        <input type="text" id="address" name="address" required placeholder="Nhập địa chỉ của bạn" style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
      </div>

      <!-- Mô tả -->
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Mô Tả</label>
        <textarea id="des" name="des" rows="4" placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn..." style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);"></textarea>
      </div>

      <!-- Upload ảnh -->
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Hình Ảnh (Tùy chọn)</label>
        <input type="file" id="images" name="images" multiple accept="image/*" style="width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm);">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">Bạn có thể upload nhiều ảnh để mô tả vấn đề</p>
        <div id="image-preview" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;"></div>
      </div>

      <!-- Error/Success Messages -->
      <div id="error-msg" style="color: red; font-size: 0.9rem; display: none;"></div>
      <div id="success-msg" style="color: green; font-size: 0.9rem; display: none;"></div>

      <!-- Submit Button -->
      <button type="submit" class="btn btn-primary" style="padding: 0.75rem;">
        Xác Nhận Đặt Lịch
      </button>
    </div>
  `;

  main.appendChild(form);

  // Load danh sách sản phẩm
  const productSelect = form.querySelector("#product_id");
  productService
    .getListProduct(user.id)
    .then((products) => {
      productSelect.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';

      if (products && products.length > 0) {
        products.forEach((product) => {
          const option = document.createElement("option");
          option.value = product.id;
          option.textContent = `${product.product.name || "Sản phẩm"}`;
          productSelect.appendChild(option);
          console.log(product);
        });
      } else {
        productSelect.innerHTML =
          '<option value="">Không có sản phẩm nào</option>';
      }
    })
    .catch((error) => {
      console.error("Error loading products:", error);
      productSelect.innerHTML =
        '<option value="">Lỗi khi tải sản phẩm</option>';
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
