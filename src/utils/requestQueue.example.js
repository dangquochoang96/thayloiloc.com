/**
 * VÍ DỤ SỬ DỤNG REQUEST QUEUE VÀ BATCH REQUEST
 */

import { api } from "../services/api.js";
import { RequestQueue } from "./requestQueue.js";
import {
  batchRequestWithLimit,
  batchRequestWithLimitSafe,
  batchRequestInChunks,
  retryRequest,
  batchRequestWithProgress,
} from "./batchRequest.js";

// ============================================
// VÍ DỤ 1: Sử dụng API với queue tự động
// ============================================
async function example1_AutoQueue() {
    
  // API đã tự động sử dụng queue với limit 3 concurrent requests
  const promises = [];
  for (let i = 1; i <= 10; i++) {
    promises.push(api.get(`/news/${i}`));
  }
  
  // Tất cả 10 requests sẽ được queue và chỉ 3 requests chạy cùng lúc
  const results = await Promise.all(promises);
    
  // Xem trạng thái queue
  }

// ============================================
// VÍ DỤ 2: Tạo queue riêng với custom limit
// ============================================
async function example2_CustomQueue() {
    
  // Tạo queue riêng với limit 5
  const customQueue = new RequestQueue(5);
  
  const tasks = Array.from({ length: 20 }, (_, i) => i + 1);
  
  const results = await Promise.all(
    tasks.map((id) =>
      customQueue.enqueue(async () => {
                const response = await fetch(`https://api.example.com/item/${id}`);
                return response.json();
      })
    )
  );
  
  }

// ============================================
// VÍ DỤ 3: Batch request với limit
// ============================================
async function example3_BatchWithLimit() {
    
  const productIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // Chỉ 3 requests chạy cùng lúc
  const results = await batchRequestWithLimit(
    productIds,
    async (id) => {
            return api.get(`/products/${id}`);
    },
    3 // concurrency limit
  );
  
  }

// ============================================
// VÍ DỤ 4: Batch request với error handling
// ============================================
async function example4_BatchWithErrorHandling() {
    
  const urls = [
    "/valid-endpoint",
    "/invalid-endpoint",
    "/another-valid",
    "/error-endpoint",
  ];
  
  const results = await batchRequestWithLimitSafe(
    urls,
    async (url) => {
      return api.get(url);
    },
    2 // concurrency limit
  );
  
  // Xử lý kết quả
  results.forEach((result, index) => {
    if (result.success) {
          } else {
      console.error(`✗ Request ${index + 1} failed:`, result.error);
    }
  });
  
  const successCount = results.filter((r) => r.success).length;
  }

// ============================================
// VÍ DỤ 5: Batch request theo chunks
// ============================================
async function example5_BatchInChunks() {
    
  const imageIds = Array.from({ length: 50 }, (_, i) => i + 1);
  
  // Xử lý 10 images mỗi lần, delay 2s giữa các batch
  const results = await batchRequestInChunks(
    imageIds,
    async (id) => {
            return api.get(`/images/${id}`);
    },
    10, // chunk size
    2000 // delay between chunks (ms)
  );
  
  }

// ============================================
// VÍ DỤ 6: Upload nhiều files với progress
// ============================================
async function example6_UploadWithProgress() {
    
  const files = []; // Array of File objects
  
  const results = await batchRequestWithProgress(
    files,
    async (file) => {
      return api.uploadImage(file);
    },
    (completed, total, result) => {
      const percent = Math.round((completed / total) * 100);
            
      // Cập nhật UI progress bar
      // updateProgressBar(percent);
    },
    3 // concurrency limit
  );
  
  }

// ============================================
// VÍ DỤ 7: Retry request với exponential backoff
// ============================================
async function example7_RetryRequest() {
    
  try {
    const result = await retryRequest(
      async () => {
        // Request có thể fail
        return api.get("/unstable-endpoint");
      },
      3, // max retries
      1000 // initial delay (ms)
    );
    
      } catch (error) {
    console.error("Request failed after retries:", error);
  }
}

// ============================================
// VÍ DỤ 8: Thay đổi concurrency limit động
// ============================================
async function example8_DynamicConcurrency() {
    
  // Ban đầu limit 3
    
  // Tăng lên 5 khi cần xử lý nhanh
  api.setMaxConcurrent(5);
    
  // Giảm xuống 2 khi muốn tiết kiệm tài nguyên
  api.setMaxConcurrent(2);
  }

// ============================================
// VÍ DỤ 9: Upload nhiều images (real use case)
// ============================================
async function example9_RealUploadImages(fileInputElement) {
    
  const files = Array.from(fileInputElement.files);
  
  if (files.length === 0) {
        return;
  }
  
    
  // Hiển thị progress
  const progressDiv = document.getElementById("upload-progress");
  
  const imageUrls = await batchRequestWithProgress(
    files,
    async (file) => {
      const result = await api.uploadImage(file);
      return result.data?.image_link || result.image_link;
    },
    (completed, total) => {
      const percent = Math.round((completed / total) * 100);
      progressDiv.textContent = `Uploading: ${completed}/${total} (${percent}%)`;
    },
    3 // Chỉ upload 3 files cùng lúc
  );
  
    progressDiv.textContent = "Upload complete!";
  
  return imageUrls;
}

// ============================================
// VÍ DỤ 10: Fetch nhiều booking history
// ============================================
async function example10_FetchBookingHistory(userIds) {
    
  const results = await batchRequestWithLimitSafe(
    userIds,
    async (userId) => {
      return api.get(`/bookings/history?user_id=${userId}`);
    },
    3 // concurrency limit
  );
  
  // Xử lý kết quả
  const allBookings = [];
  const errors = [];
  
  results.forEach((result) => {
    if (result.success) {
      allBookings.push(...result.data.data);
    } else {
      errors.push(result);
    }
  });
  
    if (errors.length > 0) {
    console.error(`${errors.length} requests failed`);
  }
  
  return { bookings: allBookings, errors };
}

// Export examples
export {
  example1_AutoQueue,
  example2_CustomQueue,
  example3_BatchWithLimit,
  example4_BatchWithErrorHandling,
  example5_BatchInChunks,
  example6_UploadWithProgress,
  example7_RetryRequest,
  example8_DynamicConcurrency,
  example9_RealUploadImages,
  example10_FetchBookingHistory,
};
