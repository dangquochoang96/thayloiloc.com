import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";

// Import HTML template
import loginFormTemplate from "../templates/auth/login-form.html?raw";

// Import CSS styles
import "../styles/auth/auth-form.css";

export function LoginPage() {
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
  cardContainer.innerHTML = loginFormTemplate;
  const card = cardContainer.firstElementChild;

  const form = card.querySelector("#login-form");
  const errorMsg = card.querySelector("#error-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";
    
    const submitBtn = form.querySelector(".btn-submit");
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    
    const phone = form.phone.value;
    const pass = form.password.value;

    try {
      await authService.login(phone, pass);
      // If login successful, redirect to home/dashboard
      window.location.hash = "/";
      window.location.reload(); // To update header state
    } catch (err) {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      errorMsg.textContent =
        err.message || "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập của bạn.";
      errorMsg.style.display = "block";
    }
  });

  main.appendChild(card);
  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}
