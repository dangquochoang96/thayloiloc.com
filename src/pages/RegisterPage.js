import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { Toast } from "../utils/toast.js";

// Import HTML template
import registerFormTemplate from "../templates/auth/register-form.html?raw";

// Import CSS styles
import "../styles/auth/auth-form.css";
import "../styles/toast.css";

export function RegisterPage() {
  const container = document.createElement("div");
  container.className = "page-container";

  container.appendChild(Header());

  const main = document.createElement("main");
  main.className = "container";
  main.style.minHeight = "60vh";
  main.style.display = "flex";
  main.style.alignItems = "center";
  main.style.justifyContent = "center";
  main.style.padding = "2rem 0";

  const cardContainer = document.createElement("div");
  cardContainer.innerHTML = registerFormTemplate;
  const card = cardContainer.firstElementChild;

  const form = card.querySelector("#register-form");
  const errorMsg = card.querySelector("#error-msg");
  const successMsg = card.querySelector("#success-msg");
  const technicianCheckbox = card.querySelector("#register-technician");
  const technicianFields = card.querySelector("#technician-fields");

  // Toggle technician fields visibility
  technicianCheckbox.addEventListener("change", (e) => {
    if (e.target.checked) {
      technicianFields.style.display = "block";
    } else {
      technicianFields.style.display = "none";
    }
  });

  // Image preview handlers
  const setupImagePreview = (inputId, previewId) => {
    const input = card.querySelector(`#${inputId}`);
    const preview = card.querySelector(`#${previewId}`);
    const placeholder = input.parentElement.querySelector('.upload-placeholder');

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          preview.style.display = "block";
          if (placeholder) placeholder.style.display = "none";
        };
        reader.readAsDataURL(file);
      }
    });
  };

  setupImagePreview("id_card_front", "preview_front");
  setupImagePreview("id_card_back", "preview_back");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    const submitBtn = form.querySelector(".btn-submit");
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    const name = form.name.value ? form.name.value.trim() : "";
    const phone = form.phone.value ? form.phone.value.trim() : "";
    const pass = form.password.value;
    const isTechnician = technicianCheckbox.checked;

    try {
      if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        throw new Error("Số điện thoại phải bao gồm 10 số!");
      }
      if (isTechnician) {
        // Validate technician fields
        const address = form.address.value;
        const birthday = form.birthday.value;
        const services = form.services.value;
        const idCardNumber = form.id_card_number.value;
        const idCardFront = form.id_card_front.files[0];
        const idCardBack = form.id_card_back.files[0];

        if (!address || !birthday || !services || !idCardNumber || !idCardFront || !idCardBack) {
          throw new Error("Vui lòng điền đầy đủ thông tin kỹ thuật viên");
        }

        if (idCardNumber.length !== 12) {
          throw new Error("Số CCCD phải có 12 số");
        }

        // Register as technician
        await authService.registerTechnician({
          phone,
          name,
          pass,
          type: 3,
          type_staff: 0,
          address,
          birthday,
          services,
          id_card_number: idCardNumber,
          id_card_image_front: idCardFront,
          id_card_image_back: idCardBack
        });
      } else {
        // Regular user registration
        await authService.register(phone, name, pass);
      }

      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      successMsg.textContent = isTechnician
        ? "Đăng ký kỹ thuật viên thành công! Vui lòng chờ phê duyệt..."
        : "Đăng ký thành công! Đang chuyển đến trang đăng nhập...";
      successMsg.style.display = "block";

      // Show toast notification
      Toast.success(
        isTechnician
          ? "Đăng ký kỹ thuật viên thành công! Vui lòng chờ phê duyệt."
          : "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.",
        4000
      );

      setTimeout(() => {
        window.location.hash = "/login";
      }, 2000);
    } catch (err) {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      errorMsg.textContent = err.message || "Đăng ký thất bại.";
      errorMsg.style.display = "block";
    }
  });

  main.appendChild(card);
  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}
