export function Footer() {
  const footer = document.createElement("footer");
  footer.style.backgroundColor = "var(--secondary-color)";
  footer.style.color = "var(--text-light)";
  footer.style.padding = "3rem 0 1rem";
  footer.style.marginTop = "auto";

  footer.innerHTML = ` 
    <div class="container">
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div>
          <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Thayloiloc</h3>
          <p style="color: #94a3b8;">Professional home services at your doorstep. Reliable, fast, and affordable.</p>
        </div>
        <div>
          <h4 style="margin-bottom: 1rem;">Quick Links</h4>
          <ul style="display: flex; flex-direction: column; gap: 0.5rem;">
            <li><a href="#/" style="color: inherit; text-decoration: none;">Home</a></li>
            <li><a href="#/services" style="color: inherit; text-decoration: none;">Services</a></li>
            <li><a href="#/contact" style="color: inherit; text-decoration: none;">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 style="margin-bottom: 1rem;">Contact</h4>
          <p>Email: support@chothuetatca.com</p>
          <p>Phone: 1900 xxxx</p>
        </div>
      </div>
      <div style="margin-top: 3rem; pt: 2rem; border-top: 1px solid #334155; text-align: center; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} Thayloiloc. All rights reserved.
      </div>
    </div>
  `;

  return footer;
}
