# Request Queue & Concurrency Control

Hệ thống quản lý hàng đợi request với giới hạn số lượng request chạy đồng thời.

## Tính năng

✅ Giới hạn số request chạy song song (concurrency limit)  
✅ Tự động xếp hàng các request vượt quá giới hạn  
✅ Batch processing với progress tracking  
✅ Error handling và retry mechanism  
✅ Chunk processing với delay  
✅ Thay đổi concurrency limit động  

## Cài đặt mặc định

API client đã được tích hợp sẵn request queue với:
- **Concurrency limit mặc định**: 3 requests cùng lúc
- **Tự động bật**: Tất cả API calls đều đi qua queue

## Sử dụng cơ bản

### 1. Sử dụng API với queue tự động

```javascript
import { api } from "./services/api.js";

// Tất cả requests tự động được queue
const promises = [];
for (let i = 1; i <= 10; i++) {
  promises.push(api.get(`/news/${i}`));
}

// Chỉ 3 requests chạy cùng lúc, 7 requests còn lại đợi trong queue
const results = await Promise.all(promises);
```

### 2. Xem trạng thái queue

```javascript
const status = api.getQueueStatus();
console.log(status);
// { running: 3, queued: 7, maxConcurrent: 3 }
```

### 3. Thay đổi concurrency limit

```javascript
// Tăng lên 5 concurrent requests
api.setMaxConcurrent(5);

// Giảm xuống 2 concurrent requests
api.setMaxConcurrent(2);
```

## Batch Request Utilities

### 1. Batch với limit

```javascript
import { batchRequestWithLimit } from "./utils/batchRequest.js";

const productIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const results = await batchRequestWithLimit(
  productIds,
  async (id) => api.get(`/products/${id}`),
  3 // chỉ 3 requests cùng lúc
);
```

### 2. Batch với error handling

```javascript
import { batchRequestWithLimitSafe } from "./utils/batchRequest.js";

const results = await batchRequestWithLimitSafe(
  urls,
  async (url) => api.get(url),
  3
);

// Xử lý kết quả
results.forEach((result) => {
  if (result.success) {
    console.log("Success:", result.data);
  } else {
    console.error("Error:", result.error);
  }
});
```

### 3. Batch theo chunks với delay

```javascript
import { batchRequestInChunks } from "./utils/batchRequest.js";

// Xử lý 10 items mỗi lần, delay 2s giữa các batch
const results = await batchRequestInChunks(
  items,
  async (item) => api.get(`/items/${item.id}`),
  10,   // chunk size
  2000  // delay (ms)
);
```

### 4. Batch với progress tracking

```javascript
import { batchRequestWithProgress } from "./utils/batchRequest.js";

const results = await batchRequestWithProgress(
  files,
  async (file) => api.uploadImage(file),
  (completed, total, result) => {
    const percent = Math.round((completed / total) * 100);
    console.log(`Progress: ${completed}/${total} (${percent}%)`);
    // Cập nhật UI progress bar
  },
  3 // concurrency limit
);
```

### 5. Retry với exponential backoff

```javascript
import { retryRequest } from "./utils/batchRequest.js";

const result = await retryRequest(
  async () => api.get("/unstable-endpoint"),
  3,    // max retries
  1000  // initial delay (ms)
);
```

## Use Cases thực tế

### Upload nhiều images

```javascript
async function uploadImages(fileInput) {
  const files = Array.from(fileInput.files);
  
  const imageUrls = await batchRequestWithProgress(
    files,
    async (file) => {
      const result = await api.uploadImage(file);
      return result.data?.image_link;
    },
    (completed, total) => {
      updateProgressBar(completed, total);
    },
    3 // Chỉ upload 3 files cùng lúc
  );
  
  return imageUrls;
}
```

### Fetch nhiều booking history

```javascript
async function fetchAllBookings(userIds) {
  const results = await batchRequestWithLimitSafe(
    userIds,
    async (userId) => api.get(`/bookings/history?user_id=${userId}`),
    3
  );
  
  const bookings = results
    .filter(r => r.success)
    .flatMap(r => r.data.data);
  
  return bookings;
}
```

### Load nhiều news articles

```javascript
async function loadNewsArticles(newsIds) {
  return batchRequestWithLimit(
    newsIds,
    async (id) => api.get(`/news/${id}`),
    5 // 5 concurrent requests
  );
}
```

## Tạo queue riêng

Nếu cần queue riêng với cấu hình khác:

```javascript
import { RequestQueue } from "./utils/requestQueue.js";

const customQueue = new RequestQueue(5); // limit 5

const results = await Promise.all(
  items.map((item) =>
    customQueue.enqueue(async () => {
      return fetch(`/api/items/${item.id}`).then(r => r.json());
    })
  )
);
```

## API Reference

### RequestQueue

```javascript
const queue = new RequestQueue(maxConcurrent);

// Thêm request vào queue
await queue.enqueue(async () => { /* request logic */ });

// Thay đổi limit
queue.setMaxConcurrent(5);

// Xem trạng thái
const status = queue.getStatus();

// Clear queue
queue.clear();
```

### Batch Functions

```javascript
// Batch với limit
batchRequestWithLimit(items, requestFn, concurrency)

// Batch với error handling
batchRequestWithLimitSafe(items, requestFn, concurrency)

// Batch theo chunks
batchRequestInChunks(items, requestFn, chunkSize, delay)

// Batch với progress
batchRequestWithProgress(items, requestFn, onProgress, concurrency)

// Retry request
retryRequest(requestFn, maxRetries, initialDelay)
```

## Best Practices

1. **Sử dụng concurrency limit phù hợp**
   - API calls: 3-5 concurrent requests
   - File uploads: 2-3 concurrent uploads
   - Heavy operations: 1-2 concurrent

2. **Sử dụng error handling**
   - Dùng `batchRequestWithLimitSafe` cho batch có thể fail
   - Dùng `retryRequest` cho requests không ổn định

3. **Progress tracking cho UX tốt**
   - Hiển thị progress bar khi upload/download
   - Thông báo số lượng items đã xử lý

4. **Chunk processing cho large datasets**
   - Chia nhỏ khi xử lý hàng trăm/ngàn items
   - Thêm delay để tránh overload server

5. **Monitor queue status**
   - Check `getQueueStatus()` để debug
   - Điều chỉnh limit dựa trên performance

## Troubleshooting

### Request bị chậm?
- Tăng `maxConcurrent` limit
- Check network throttling
- Xem queue status để debug

### Server bị overload?
- Giảm `maxConcurrent` limit
- Thêm delay giữa các chunks
- Sử dụng chunk processing

### Một số request fail?
- Dùng `batchRequestWithLimitSafe`
- Implement retry logic
- Check error messages

## Ví dụ đầy đủ

Xem file `requestQueue.example.js` để có 10 ví dụ chi tiết về cách sử dụng.
