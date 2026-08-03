/**
 * Batch Request Utilities
 * Các helper function để xử lý nhiều request với concurrency control
 */

/**
 * Thực hiện nhiều request với giới hạn concurrency
 * @param {Array} items - Mảng items cần xử lý
 * @param {Function} requestFn - Function nhận item và return Promise
 * @param {Number} concurrency - Số request tối đa chạy đồng thời
 * @returns {Promise<Array>} - Mảng kết quả
 */
export async function batchRequestWithLimit(items, requestFn, concurrency = 3) {
  const results = [];
  const executing = [];

  for (const [index, item] of items.entries()) {
    const promise = Promise.resolve().then(() => requestFn(item, index));
    results.push(promise);

    if (concurrency <= items.length) {
      const executing_promise = promise.then(() => {
        executing.splice(executing.indexOf(executing_promise), 1);
      });
      executing.push(executing_promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(results);
}

/**
 * Thực hiện nhiều request với giới hạn concurrency và xử lý lỗi
 * @param {Array} items - Mảng items cần xử lý
 * @param {Function} requestFn - Function nhận item và return Promise
 * @param {Number} concurrency - Số request tối đa chạy đồng thời
 * @returns {Promise<Array>} - Mảng kết quả {success, data, error}
 */
export async function batchRequestWithLimitSafe(items, requestFn, concurrency = 3) {
  const wrappedFn = async (item, index) => {
    try {
      const data = await requestFn(item, index);
      return { success: true, data, item, index };
    } catch (error) {
      return { success: false, error: error.message, item, index };
    }
  };

  return batchRequestWithLimit(items, wrappedFn, concurrency);
}

/**
 * Chia mảng thành các chunks và xử lý từng chunk
 * @param {Array} items - Mảng items cần xử lý
 * @param {Function} requestFn - Function nhận item và return Promise
 * @param {Number} chunkSize - Kích thước mỗi chunk
 * @param {Number} delayBetweenChunks - Delay giữa các chunk (ms)
 * @returns {Promise<Array>} - Mảng kết quả
 */
export async function batchRequestInChunks(
  items,
  requestFn,
  chunkSize = 5,
  delayBetweenChunks = 1000
) {
  const results = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map((item, index) => requestFn(item, i + index))
    );
    results.push(...chunkResults);

    // Delay giữa các chunk (trừ chunk cuối)
    if (i + chunkSize < items.length && delayBetweenChunks > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenChunks));
    }
  }

  return results;
}

/**
 * Retry request với exponential backoff
 * @param {Function} requestFn - Function thực hiện request
 * @param {Number} maxRetries - Số lần retry tối đa
 * @param {Number} initialDelay - Delay ban đầu (ms)
 * @returns {Promise} - Kết quả request
 */
export async function retryRequest(
  requestFn,
  maxRetries = 3,
  initialDelay = 1000
) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries) {
        const delay = initialDelay * Math.pow(2, i);
                await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Progress callback wrapper cho batch requests
 * @param {Array} items - Mảng items cần xử lý
 * @param {Function} requestFn - Function nhận item và return Promise
 * @param {Function} onProgress - Callback nhận (completed, total, result)
 * @param {Number} concurrency - Số request tối đa chạy đồng thời
 * @returns {Promise<Array>} - Mảng kết quả
 */
export async function batchRequestWithProgress(
  items,
  requestFn,
  onProgress,
  concurrency = 3
) {
  let completed = 0;
  const total = items.length;

  const wrappedFn = async (item, index) => {
    const result = await requestFn(item, index);
    completed++;
    if (onProgress) {
      onProgress(completed, total, result);
    }
    return result;
  };

  return batchRequestWithLimit(items, wrappedFn, concurrency);
}
