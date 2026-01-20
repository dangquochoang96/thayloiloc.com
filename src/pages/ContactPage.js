import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { contactService } from "../services/contact.service.js";

// Import HTML template and CSS
import contactTemplate from "../templates/contact.html?raw";
import "../styles/contact.css";

export function ContactPage() {
  const container = document.createElement("div");

  // Add Header
  const header = Header();
  container.appendChild(header);

  // Add Main Content
  const main = document.createElement("main");
  const contactSection = document.createElement("div");
  contactSection.innerHTML = contactTemplate;
  main.appendChild(contactSection.firstElementChild);
  container.appendChild(main);

  // Add Footer
  container.appendChild(Footer());

  // Initialize form after DOM is ready
  setTimeout(() => {
    initializeContactForm();
  }, 0);

  return container;
}

/**
 * Initialize contact form with validation and submission handling
 */
function initializeContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) {
    console.error("Contact form not found");
    return;
  }

  // Get form elements
  const nameInput = document.getElementById("customerName");
  const phoneInput = document.getElementById("customerPhone");
  const messageInput = document.getElementById("customerMessage");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoader = submitBtn.querySelector(".btn-loader");
  const successMessage = document.getElementById("successMessage");
  const errorMessage = document.getElementById("errorMessage");
  const errorMessageText = document.getElementById("errorMessageText");

  // Error display elements
  const nameError = document.getElementById("nameError");
  const phoneError = document.getElementById("phoneError");
  const messageError = document.getElementById("messageError");

  // Add input event listeners for real-time validation
  nameInput.addEventListener("input", () => validateName());
  phoneInput.addEventListener("input", () => validatePhone());
  messageInput.addEventListener("input", () => validateMessage());

  // Form submission handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Hide previous messages
    hideMessages();

    // Validate all fields
    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isMessageValid = validateMessage();

    if (!isNameValid || !isPhoneValid || !isMessageValid) {
      return;
    }

    // Prepare contact data
    const contactData = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      message: messageInput.value.trim(),
    };

    // Show loading state
    setLoadingState(true);

    try {
      // Send to Telegram
      const result = await contactService.sendContactMessage(contactData);

      if (result.success) {
        // Show success message
        showSuccessMessage();

        // Clear form
        form.reset();

        // Clear any validation errors
        clearValidationErrors();
      } else {
        // Show error message
        showErrorMessage(result.message);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showErrorMessage("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      // Hide loading state
      setLoadingState(false);
    }
  });

  /**
   * Validate customer name
   */
  function validateName() {
    const name = nameInput.value.trim();
    const formGroup = nameInput.closest(".form-group");

    if (!name) {
      nameError.textContent = "Vui lòng nhập họ và tên";
      formGroup.classList.add("error");
      return false;
    }

    if (name.length < 2) {
      nameError.textContent = "Họ và tên phải có ít nhất 2 ký tự";
      formGroup.classList.add("error");
      return false;
    }

    if (name.length > 100) {
      nameError.textContent = "Họ và tên không được quá 100 ký tự";
      formGroup.classList.add("error");
      return false;
    }

    nameError.textContent = "";
    formGroup.classList.remove("error");
    return true;
  }

  /**
   * Validate phone number
   */
  function validatePhone() {
    const phone = phoneInput.value.trim();
    const formGroup = phoneInput.closest(".form-group");

    if (!phone) {
      phoneError.textContent = "Vui lòng nhập số điện thoại";
      formGroup.classList.add("error");
      return false;
    }

    if (!contactService.validatePhone(phone)) {
      phoneError.textContent = "Số điện thoại không hợp lệ (VD: 0963456911)";
      formGroup.classList.add("error");
      return false;
    }

    phoneError.textContent = "";
    formGroup.classList.remove("error");
    return true;
  }

  /**
   * Validate message content
   */
  function validateMessage() {
    const message = messageInput.value.trim();
    const formGroup = messageInput.closest(".form-group");

    if (!message) {
      messageError.textContent = "Vui lòng nhập nội dung tin nhắn";
      formGroup.classList.add("error");
      return false;
    }

    if (message.length < 10) {
      messageError.textContent = "Nội dung phải có ít nhất 10 ký tự";
      formGroup.classList.add("error");
      return false;
    }

    if (message.length > 1000) {
      messageError.textContent = "Nội dung không được quá 1000 ký tự";
      formGroup.classList.add("error");
      return false;
    }

    messageError.textContent = "";
    formGroup.classList.remove("error");
    return true;
  }

  /**
   * Set loading state for submit button
   */
  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.style.display = "none";
      btnLoader.style.display = "inline-flex";
    } else {
      submitBtn.disabled = false;
      btnText.style.display = "inline-flex";
      btnLoader.style.display = "none";
    }
  }

  /**
   * Show success message
   */
  function showSuccessMessage() {
    successMessage.style.display = "flex";
    errorMessage.style.display = "none";

    // Auto-hide after 5 seconds
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 5000);
  }

  /**
   * Show error message
   */
  function showErrorMessage(message) {
    errorMessageText.textContent = message;
    errorMessage.style.display = "flex";
    successMessage.style.display = "none";

    // Auto-hide after 7 seconds
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 7000);
  }

  /**
   * Hide all messages
   */
  function hideMessages() {
    successMessage.style.display = "none";
    errorMessage.style.display = "none";
  }

  /**
   * Clear all validation errors
   */
  function clearValidationErrors() {
    nameError.textContent = "";
    phoneError.textContent = "";
    messageError.textContent = "";

    document.querySelectorAll(".form-group").forEach((group) => {
      group.classList.remove("error");
    });
  }
}
