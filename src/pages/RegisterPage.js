import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";

// Import HTML template
import registerFormTemplate from "../templates/auth/register-form.html?raw";

// Import CSS styles
import "../styles/auth/auth-form.css";

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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    const name = form.name.value;
    const phone = form.phone.value;
    const pass = form.password.value;

    try {
      await authService.register(phone, name, pass);
      successMsg.style.display = "block";
      setTimeout(() => {
        window.location.hash = "/login";
      }, 1500);
    } catch (err) {
      errorMsg.textContent = err.message || "Registration failed.";
      errorMsg.style.display = "block";
    }
  });

  main.appendChild(card);
  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}
