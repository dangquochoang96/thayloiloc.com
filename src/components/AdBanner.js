import "../styles/ad-banner.css";

const STORAGE_KEY = "adBanner_hiddenUntil";
const HIDE_DAYS = 1; // After clicking "don't show again", hide for this many days

/**
 * Show the promotional ad banner popup.
 * - Will NOT show if user previously checked "don't show again" (within HIDE_DAYS).
 * - Clicking the image or CTA button navigates to the promo page.
 * - Auto-dismisses after 15 seconds.
 */
export function showAdBanner() {
  // Check if user opted out
  const hiddenUntil = localStorage.getItem(STORAGE_KEY);
  if (hiddenUntil && Date.now() < Number(hiddenUntil)) {
    return; // Respect user preference
  }

  // Build overlay
  const overlay = document.createElement("div");
  overlay.className = "ad-banner-overlay";
  overlay.id = "adBannerOverlay";

  overlay.innerHTML = `
    <div class="ad-banner-modal" id="adBannerModal" role="dialog" aria-modal="true" aria-label="Chương trình khuyến mãi">
      <!-- Close button -->
      <button class="ad-banner-close" id="adBannerClose" aria-label="Đóng">
        <i class="fas fa-times"></i>
      </button>

      <!-- Banner image — clickable -->
      <img
        src="/images/promo-banner-ads.png"
        alt="Chương trình khuyến mãi: Thay 3 lõi tặng 1 lõi"
        class="ad-banner-image"
        id="adBannerImage"
        loading="eager"
      />

      <!-- CTA strip over bottom of image -->
      <div class="ad-banner-cta">
        <a href="#/promo-register/17751" class="ad-banner-btn-primary" id="adBannerCTA">
          <i class="fas fa-gift"></i>
          Đăng Ký Ngay
        </a>
      </div>

      <!-- Footer: dont-show + dismiss -->
      <div class="ad-banner-footer">
        <label class="ad-banner-dont-show" for="adDontShow">
        </label>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // ── Event helpers ──────────────────────────────────────────────

  function closeWithAnimation(dontShowAgain = false) {
    if (dontShowAgain) {
      const expiry = Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, String(expiry));
    }
    overlay.classList.add("hiding");
    overlay.addEventListener("animationend", () => overlay.remove(), { once: true });
  }

  // Close on backdrop click (outside modal)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      const dontShow = overlay.querySelector("#adDontShow")?.checked;
      closeWithAnimation(dontShow);
    }
  });

  // Close button
  overlay.querySelector("#adBannerClose").addEventListener("click", () => {
    const dontShow = overlay.querySelector("#adDontShow")?.checked;
    closeWithAnimation(dontShow);
  });

  // Dismiss button
  overlay.querySelector("#adBannerDismiss").addEventListener("click", () => {
    const dontShow = overlay.querySelector("#adDontShow")?.checked;
    closeWithAnimation(dontShow);
  });

  // Image click — navigate to promo page then close
  overlay.querySelector("#adBannerImage").addEventListener("click", () => {
    closeWithAnimation(false);
    window.location.hash = "/promo-register/17751";
  });

  // CTA button also closes the modal
  overlay.querySelector("#adBannerCTA").addEventListener("click", () => {
    const dontShow = overlay.querySelector("#adDontShow")?.checked;
    closeWithAnimation(dontShow);
  });

  // Keyboard: Escape to close
  function handleKeydown(e) {
    if (e.key === "Escape") {
      const dontShow = overlay.querySelector("#adDontShow")?.checked;
      closeWithAnimation(dontShow);
      document.removeEventListener("keydown", handleKeydown);
    }
  }
  document.addEventListener("keydown", handleKeydown);

  // Auto-dismiss after 15s
  const autoTimer = setTimeout(() => {
    if (document.getElementById("adBannerOverlay")) {
      closeWithAnimation(false);
    }
  }, 15000);

  // Cancel auto-dismiss if user interacts
  overlay.querySelector("#adBannerModal").addEventListener("mouseenter", () => {
    clearTimeout(autoTimer);
  });
}
