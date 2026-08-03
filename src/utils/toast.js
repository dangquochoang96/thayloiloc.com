// Toast notification utility
export class Toast {
  static show(message, type = 'success', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    // Icon based on type
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    
    const icon = icons[type] || icons.info;
    
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas ${icon}"></i>
        <span class="toast-message">${message}</span>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }, duration);
    }
    
    return toast;
  }
  
  static success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }
  
  static error(message, duration = 3000) {
    return this.show(message, 'error', duration);
  }
  
  static warning(message, duration = 3000) {
    return this.show(message, 'warning', duration);
  }
  
  static info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
}

// Store login success flag in sessionStorage
export function setLoginSuccessFlag() {
  sessionStorage.setItem('loginSuccess', 'true');
}

export function checkAndShowLoginSuccess() {
  if (sessionStorage.getItem('loginSuccess') === 'true') {
    sessionStorage.removeItem('loginSuccess');
    
    // Get user info for personalized message
    const userStr = localStorage.getItem('user');
    let userName = 'bạn';
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userName = user.username || user.name || 'bạn';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    Toast.success(`Chào mừng ${userName}! Đăng nhập thành công.`, 4000);
    return true;
  }
  return false;
}
