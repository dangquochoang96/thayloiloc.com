/**
 * Request Queue Manager
 * Quản lý hàng đợi request với giới hạn số lượng request chạy đồng thời
 */
export class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent; // Số request tối đa chạy cùng lúc
    this.running = 0; // Số request đang chạy
    this.queue = []; // Hàng đợi các request chờ
  }

  /**
   * Thêm request vào queue
   * @param {Function} requestFn - Function thực hiện request (phải return Promise)
   * @returns {Promise} - Promise của request
   */
  async enqueue(requestFn) {
    // Nếu đã đạt giới hạn, đợi trong queue
    if (this.running >= this.maxConcurrent) {
      await new Promise((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.running++;

    try {
      const result = await requestFn();
      return result;
    } finally {
      this.running--;
      
      // Xử lý request tiếp theo trong queue
      if (this.queue.length > 0) {
        const resolve = this.queue.shift();
        resolve();
      }
    }
  }

  /**
   * Thay đổi giới hạn concurrency
   */
  setMaxConcurrent(max) {
    this.maxConcurrent = max;
  }

  /**
   * Lấy thông tin trạng thái queue
   */
  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Clear toàn bộ queue
   */
  clear() {
    this.queue.forEach((resolve) => resolve());
    this.queue = [];
  }
}

// Tạo instance mặc định với limit 3 concurrent requests
export const defaultRequestQueue = new RequestQueue(3);
