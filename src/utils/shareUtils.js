export function showShareModal(postContent) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay share-modal-overlay";
  modal.innerHTML = `
    <div class="modal-content share-modal-content" style="max-width: 400px; text-align: center; border-radius: 12px; padding: 20px;">
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 1.2rem;">Chia sẻ bài viết</h2>
        <button class="close-modal-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
      </div>
      <div class="share-options" style="display: flex; justify-content: space-around; padding: 10px 0 20px;">
        <div class="share-option" data-platform="facebook" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div class="share-icon" style="background: #1877F2; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </div>
          <span style="font-size: 14px; font-weight: 500;">Facebook</span>
        </div>
        <div class="share-option" data-platform="instagram" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div class="share-icon" style="background: #E4405F; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <span style="font-size: 14px; font-weight: 500;">Instagram</span>
        </div>
        <div class="share-option" data-platform="youtube" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div class="share-icon" style="background: #FF0000; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"></polygon>
            </svg>
          </div>
          <span style="font-size: 14px; font-weight: 500;">YouTube</span>
        </div>
        <div class="share-option" data-platform="tiktok" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div class="share-icon" style="background: #000000; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
            </svg>
          </div>
          <span style="font-size: 14px; font-weight: 500;">TikTok</span>
        </div>
      </div>
      <p style="font-size: 13px; color: #666; margin-top: 10px; line-height: 1.5;">
        Nội dung sẽ được tự động sao chép.<br/>Hãy dán (Ctrl+V) vào bài đăng của bạn.
      </p>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector(".close-modal-btn");
  closeBtn.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  const options = modal.querySelectorAll(".share-option");
  options.forEach(option => {
    option.addEventListener("click", () => {
      const platform = option.dataset.platform;
      
      const textToCopy = postContent || window.location.href;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        showShareToast("Đã sao chép nội dung bài viết!", "success");
        
        let url = "";
        if (platform === "facebook") url = "https://www.facebook.com/";
        else if (platform === "instagram") url = "https://www.instagram.com/";
        else if (platform === "youtube") url = "https://www.youtube.com/";
        else if (platform === "tiktok") url = "https://www.tiktok.com/";

        if (url) {
          setTimeout(() => {
            window.open(url, "_blank");
          }, 1500);
        }
        
        modal.remove();
      }).catch(err => {
        console.error("Copy failed", err);
        showShareToast("Không thể sao chép nội dung", "error");
      });
    });
  });
}

function showShareToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
