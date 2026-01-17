// Telegram Contact Service
// Handles sending contact form submissions to Telegram Bot

// ============================================
// Configuration
// ============================================
// TODO: Update these values with your actual Telegram bot credentials

// ============================================
// Service Class
// ============================================
class ContactService {
  constructor() {
    this.telegramApiUrl = `https://api.telegram.org/bot${import.meta.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  }

  /**
   * Send contact message to Telegram
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - Customer name
   * @param {string} contactData.phone - Customer phone number
   * @param {string} contactData.message - Customer message
   * @returns {Promise<Object>} Response from Telegram API
   */
  async sendContactMessage(contactData) {
    try {
      // Validate input
      if (!contactData.name || !contactData.phone || !contactData.message) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      // Format message for Telegram
      const formattedMessage = this.formatMessage(contactData);

      // Prepare request payload
      const payload = {
        chat_id: import.meta.env.TELEGRAM_CHAT_ID,
        text: formattedMessage,
        parse_mode: "HTML", // Enable HTML formatting
      };

      // Send request to Telegram API
      const response = await fetch(this.telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Parse response
      const data = await response.json();

      // Check if request was successful
      if (!response.ok || !data.ok) {
        throw new Error(
          data.description || "Không thể gửi tin nhắn đến Telegram",
        );
      }

      return {
        success: true,
        message: "Tin nhắn đã được gửi thành công",
        data: data,
      };
    } catch (error) {
      console.error("Telegram API Error:", error);

      // Return user-friendly error message
      return {
        success: false,
        message: this.getErrorMessage(error),
        error: error.message,
      };
    }
  }

  /**
   * Format contact data into a nice Telegram message
   * @param {Object} contactData - Contact form data
   * @returns {string} Formatted message
   */
  formatMessage(contactData) {
    const timestamp = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
      🔔 <b>LIÊN HỆ MỚI TỪ Thayloiloc.com</b>

      👤 <b>Họ và Tên:</b> ${this.escapeHtml(contactData.name)}
      📱 <b>Số Điện Thoại:</b> ${this.escapeHtml(contactData.phone)}

      💬 <b>Nội Dung:</b>
        ${this.escapeHtml(contactData.message)}

      ⏰ <b>Thời Gian:</b> ${timestamp}
    `.trim();
  }

  /**
   * Escape HTML special characters to prevent injection
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage(error) {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.";
    }

    if (
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("token")
    ) {
      return "Cấu hình Telegram Bot chưa đúng. Vui lòng liên hệ quản trị viên.";
    }

    if (errorMessage.includes("chat not found")) {
      return "Không tìm thấy chat Telegram. Vui lòng liên hệ quản trị viên.";
    }

    return "Đã có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau hoặc liên hệ trực tiếp qua hotline.";
  }

  /**
   * Validate phone number (Vietnamese format)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   */
  validatePhone(phone) {
    // Remove spaces and special characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // Vietnamese phone number: starts with 0, 10-11 digits
    const phoneRegex = /^0\d{9,10}$/;

    return phoneRegex.test(cleanPhone);
  }

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// ============================================
// Export Service Instance
// ============================================
export const contactService = new ContactService();
