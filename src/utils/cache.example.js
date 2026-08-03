/**
 * VÍ DỤ SỬ DỤNG CACHE SYSTEM
 */

import { api } from "../services/api.js";
import { CacheStrategies } from "./cacheManager.js";
import {
  memoize,
  StaleWhileRevalidateCache,
  DependencyCache,
  MultiLevelCache,
  prefetchData,
  warmCache,
  AutoRefreshCache,
} from "./cacheHelpers.js";

// ============================================
// VÍ DỤ 1: Sử dụng cache tự động với API
// ============================================
async function example1_AutoCache() {
  
  // Lần 1: Gọi API thật
    const data1 = await api.get("/news?page=1&limit=10");
  
  // Lần 2: Lấy từ cache (trong vòng 5 phút)
    const data2 = await api.get("/news?page=1&limit=10");
  
  // Kiểm tra cache stats
  }

// ============================================
// VÍ DỤ 2: Custom cache TTL
// ============================================
async function example2_CustomTTL() {
  
  // Cache ngắn hạn (1 phút) - cho dữ liệu thay đổi nhanh
  const realtimeData = await api.getCached(
    "/bookings/active",
    CacheStrategies.SHORT
  );

  // Cache dài hạn (30 phút) - cho dữ liệu ít thay đổi
  const staticData = await api.getCached(
    "/services/list",
    CacheStrategies.LONG
  );

  // Cache rất dài (1 giờ) - cho dữ liệu static
  const configData = await api.getCached(
    "/config/app",
    CacheStrategies.VERY_LONG
  );

  }

// ============================================
// VÍ DỤ 3: Force fresh data (bỏ qua cache)
// ============================================
async function example3_ForceFresh() {
  
  // Lấy từ cache nếu có
  const cachedData = await api.get("/news/123");

  // Force fetch mới (bỏ qua cache)
  const freshData = await api.getFresh("/news/123");

  }

// ============================================
// VÍ DỤ 4: Cache invalidation khi update
// ============================================
async function example4_CacheInvalidation() {
  
  // Fetch và cache
  const news = await api.get("/news?page=1");
  
  // Update data - tự động invalidate cache liên quan
  await api.post("/news", { title: "New Article" });
  
  // Fetch lại sẽ gọi API mới
  const updatedNews = await api.get("/news?page=1");
  }

// ============================================
// VÍ DỤ 5: Memoize function
// ============================================
const fetchUserProfile = memoize(
  async (userId) => {
        return api.get(`/users/${userId}`);
  },
  { ttl: CacheStrategies.LONG }
);

async function example5_Memoize() {
  
  // Lần 1: Fetch thật
  const profile1 = await fetchUserProfile(123);
  
  // Lần 2: Từ cache
  const profile2 = await fetchUserProfile(123);
  
  // User khác: Fetch mới
  const profile3 = await fetchUserProfile(456);
  }

// ============================================
// VÍ DỤ 6: Stale-While-Revalidate
// ============================================
async function example6_StaleWhileRevalidate() {
  
  const swrCache = new StaleWhileRevalidateCache();

  // Lần 1: Fetch mới
  const data1 = await swrCache.get(
    "news-list",
    () => api.get("/news?page=1"),
    CacheStrategies.SHORT
  );
  
  // Đợi gần hết TTL
  await new Promise((resolve) => setTimeout(resolve, 50000)); // 50s

  // Lần 2: Trả về cache cũ ngay, fetch mới ở background
  const data2 = await swrCache.get(
    "news-list",
    () => api.get("/news?page=1"),
    CacheStrategies.SHORT
  );
  }

// ============================================
// VÍ DỤ 7: Dependency Cache
// ============================================
async function example7_DependencyCache() {
  
  const depCache = new DependencyCache();

  // Cache user với dependencies
  const user = await api.get("/users/123");
  depCache.set("user:123", user, CacheStrategies.MEDIUM, ["users"]);

  // Cache user posts với dependencies
  const posts = await api.get("/users/123/posts");
  depCache.set("user:123:posts", posts, CacheStrategies.MEDIUM, [
    "users",
    "user:123",
  ]);

  // Invalidate user -> tự động invalidate posts
  depCache.invalidate("user:123");
  }

// ============================================
// VÍ DỤ 8: Multi-level Cache
// ============================================
async function example8_MultiLevelCache() {
  
  const mlCache = new MultiLevelCache();

  // Cache ở memory (nhanh nhất, mất khi reload)
  mlCache.set("temp-data", { value: 123 }, CacheStrategies.SHORT, "memory");

  // Cache ở session (mất khi đóng tab)
  mlCache.set("session-data", { value: 456 }, CacheStrategies.MEDIUM, "session");

  // Cache ở localStorage (persistent)
  mlCache.set("persistent-data", { value: 789 }, CacheStrategies.LONG, "local");

  // Cache ở tất cả levels
  mlCache.set("important-data", { value: 999 }, CacheStrategies.LONG, "all");

  // Get sẽ tự động promote từ slow -> fast cache
  const data = mlCache.get("persistent-data");
  }

// ============================================
// VÍ DỤ 9: Prefetch Data
// ============================================
async function example9_Prefetch() {
  
  // Prefetch dữ liệu quan trọng khi app load
  const endpoints = [
    "/services/list",
    "/news?page=1&limit=10",
    "/config/app",
    "/products/featured",
  ];

  await prefetchData(api, endpoints, CacheStrategies.LONG);
  
  // Khi user navigate, data đã có sẵn trong cache
  const services = await api.get("/services/list");
  }

// ============================================
// VÍ DỤ 10: Cache Warming
// ============================================
async function example10_CacheWarming() {
  
  // Warm cache khi app khởi động
  await warmCache(api, {
    critical: [
      "/config/app",
      "/services/list",
    ],
    frequent: [
      "/news?page=1&limit=10",
      "/products/featured",
      "/technicians/available",
    ],
  });

  }

// ============================================
// VÍ DỤ 11: Auto Refresh Cache
// ============================================
async function example11_AutoRefresh() {
  
  const autoCache = new AutoRefreshCache();

  // Cache với auto refresh mỗi 30s
  const initialData = await api.get("/bookings/active");
  autoCache.setWithAutoRefresh(
    "active-bookings",
    initialData,
    CacheStrategies.SHORT,
    () => api.get("/bookings/active"),
    30000 // refresh every 30s
  );

  
  // Data luôn fresh mà không cần manual refresh
  setInterval(() => {
    const data = autoCache.get("active-bookings");
      }, 10000);
}

// ============================================
// VÍ DỤ 12: Real Use Case - News Page
// ============================================
async function example12_NewsPage() {
  
  // Load news list với cache
  const newsList = await api.getCached(
    "/news?page=1&limit=20",
    CacheStrategies.MEDIUM
  );

  // Prefetch detail pages cho top 5 news
  const topNewsIds = newsList.data.slice(0, 5).map((n) => n.id);
  await prefetchData(
    api,
    topNewsIds.map((id) => `/news/${id}`),
    CacheStrategies.LONG
  );

  
  // Khi user click vào news, load instant từ cache
  const newsDetail = await api.get("/news/123");
  }

// ============================================
// VÍ DỤ 13: Real Use Case - Booking History
// ============================================
async function example13_BookingHistory() {
  
  const userId = localStorage.getItem("user_id");

  // Load booking history với cache dài
  const bookings = await api.getCached(
    `/bookings/history?user_id=${userId}`,
    CacheStrategies.LONG
  );

  
  // Khi user tạo booking mới, invalidate cache
  await api.post("/bookings", { /* booking data */ });
  
  // Fetch lại để có data mới
  const updatedBookings = await api.getFresh(
    `/bookings/history?user_id=${userId}`
  );
  }

// ============================================
// VÍ DỤ 14: Clear Cache
// ============================================
async function example14_ClearCache() {
  
  // Clear toàn bộ cache
  api.clearCache();
  
  // Hoặc clear cache khi user logout
  function handleLogout() {
    api.clearCache();
    localStorage.removeItem("auth_token");
      }
}

// ============================================
// VÍ DỤ 15: Monitor Cache Performance
// ============================================
async function example15_MonitorCache() {
  
  // Gọi nhiều requests
  for (let i = 1; i <= 10; i++) {
    await api.get(`/news?page=${i}`);
  }

  // Gọi lại (sẽ hit cache)
  for (let i = 1; i <= 10; i++) {
    await api.get(`/news?page=${i}`);
  }

  // Xem stats
  const stats = api.getCacheStats();
    }

// Export examples
export {
  example1_AutoCache,
  example2_CustomTTL,
  example3_ForceFresh,
  example4_CacheInvalidation,
  example5_Memoize,
  example6_StaleWhileRevalidate,
  example7_DependencyCache,
  example8_MultiLevelCache,
  example9_Prefetch,
  example10_CacheWarming,
  example11_AutoRefresh,
  example12_NewsPage,
  example13_BookingHistory,
  example14_ClearCache,
  example15_MonitorCache,
};
