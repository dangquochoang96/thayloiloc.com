import { api } from "../services/api.js";
import { CacheStrategies } from "../utils/cacheManager.js";
import { prefetchData, warmCache } from "../utils/cacheHelpers.js";

export function CacheDemoPage() {
  const container = document.createElement("div");
  container.className = "cache-demo-page";

  container.innerHTML = `
    <div class="demo-container">
      <h1>Cache System Demo</h1>
      
      <div class="demo-section">
        <h2>1. Cache Stats</h2>
        <div id="cache-stats" class="stats-box">
          <p>Total: <span id="stat-total">0</span></p>
          <p>Valid: <span id="stat-valid">0</span></p>
          <p>Expired: <span id="stat-expired">0</span></p>
          <p>Max Size: <span id="stat-max">100</span></p>
          <p>Hit Rate: <span id="stat-hitrate">0%</span></p>
        </div>
        <button id="refresh-stats">Refresh Stats</button>
        <button id="clear-cache">Clear All Cache</button>
      </div>

      <div class="demo-section">
        <h2>2. Test Cache Hit/Miss</h2>
        <input type="text" id="endpoint-input" placeholder="/news?page=1" value="/news?page=1&limit=5">
        <button id="test-cache">Fetch (with cache)</button>
        <button id="test-fresh">Fetch (force fresh)</button>
        <div id="cache-result" class="result-box"></div>
      </div>

      <div class="demo-section">
        <h2>3. Custom TTL Test</h2>
        <label>
          TTL (seconds):
          <input type="number" id="ttl-input" value="60" min="1">
        </label>
        <button id="test-ttl">Fetch with Custom TTL</button>
        <div id="ttl-result" class="result-box"></div>
      </div>

      <div class="demo-section">
        <h2>4. Cache Invalidation</h2>
        <button id="test-post">POST Request (invalidates cache)</button>
        <button id="test-put">PUT Request (invalidates cache)</button>
        <button id="test-delete">DELETE Request (invalidates cache)</button>
        <div id="invalidation-result" class="result-box"></div>
      </div>

      <div class="demo-section">
        <h2>5. Prefetch Data</h2>
        <button id="test-prefetch">Prefetch Top News</button>
        <div id="prefetch-result" class="result-box"></div>
      </div>

      <div class="demo-section">
        <h2>6. Cache Warming</h2>
        <button id="test-warm">Warm Cache</button>
        <div id="warm-result" class="result-box"></div>
      </div>

      <div class="demo-section">
        <h2>7. Performance Comparison</h2>
        <label>
          Number of requests:
          <input type="number" id="perf-count" value="10" min="1" max="50">
        </label>
        <button id="test-performance">Run Performance Test</button>
        <div id="performance-result" class="result-box"></div>
      </div>

      <div class="demo-section">
        <h2>8. Real-time Monitor</h2>
        <button id="start-monitor">Start Monitoring</button>
        <button id="stop-monitor">Stop Monitoring</button>
        <div id="monitor-log" class="log-box"></div>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .cache-demo-page {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .demo-container h1 {
      color: #333;
      margin-bottom: 30px;
    }

    .demo-section {
      background: #f5f5f5;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
    }

    .demo-section h2 {
      color: #555;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
    }

    .stats-box {
      background: white;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 10px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    }

    .stats-box p {
      margin: 5px 0;
      font-family: monospace;
    }

    .stats-box span {
      font-weight: bold;
      color: #007bff;
    }

    .result-box, .log-box {
      background: white;
      padding: 15px;
      border-radius: 4px;
      margin-top: 10px;
      max-height: 300px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 12px;
    }

    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;
      margin-top: 10px;
    }

    button:hover {
      background: #0056b3;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    input[type="text"],
    input[type="number"] {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-right: 10px;
      width: 300px;
    }

    label {
      display: block;
      margin-bottom: 10px;
      color: #555;
    }

    .log-entry {
      padding: 5px;
      border-bottom: 1px solid #eee;
    }

    .log-entry.hit {
      color: #4CAF50;
    }

    .log-entry.miss {
      color: #FF9800;
    }

    .log-entry.invalidate {
      color: #f44336;
    }

    .log-entry.info {
      color: #2196F3;
    }

    .highlight {
      background: #fff3cd;
      padding: 2px 4px;
      border-radius: 2px;
    }
  `;
  document.head.appendChild(style);

  // State
  let monitoringInterval = null;
  let requestCount = 0;
  let cacheHits = 0;

  // Event handlers
  container.querySelector("#refresh-stats").addEventListener("click", () => {
    updateStats();
  });

  container.querySelector("#clear-cache").addEventListener("click", () => {
    api.clearCache();
    addLog("invalidate", "All cache cleared");
    updateStats();
  });

  container.querySelector("#test-cache").addEventListener("click", async () => {
    const endpoint = container.querySelector("#endpoint-input").value;
    const resultDiv = container.querySelector("#cache-result");
    const button = container.querySelector("#test-cache");

    button.disabled = true;
    resultDiv.innerHTML = "<p>Fetching...</p>";

    const startTime = performance.now();
    try {
      const data = await api.get(endpoint);
      const duration = (performance.now() - startTime).toFixed(2);

      resultDiv.innerHTML = `
        <p class="highlight">✓ Success in ${duration}ms</p>
        <p>Endpoint: ${endpoint}</p>
        <p>Data: ${JSON.stringify(data).substring(0, 200)}...</p>
        <p><em>Try clicking again to see cache hit!</em></p>
      `;

      requestCount++;
      updateStats();
    } catch (error) {
      resultDiv.innerHTML = `<p style="color: red;">✗ Error: ${error.message}</p>`;
    }

    button.disabled = false;
  });

  container.querySelector("#test-fresh").addEventListener("click", async () => {
    const endpoint = container.querySelector("#endpoint-input").value;
    const resultDiv = container.querySelector("#cache-result");
    const button = container.querySelector("#test-fresh");

    button.disabled = true;
    resultDiv.innerHTML = "<p>Fetching fresh data...</p>";

    const startTime = performance.now();
    try {
      const data = await api.getFresh(endpoint);
      const duration = (performance.now() - startTime).toFixed(2);

      resultDiv.innerHTML = `
        <p class="highlight">✓ Fresh data fetched in ${duration}ms</p>
        <p>Endpoint: ${endpoint}</p>
        <p>Data: ${JSON.stringify(data).substring(0, 200)}...</p>
        <p><em>Cache was bypassed</em></p>
      `;

      addLog("miss", `Fresh fetch: ${endpoint} (${duration}ms)`);
    } catch (error) {
      resultDiv.innerHTML = `<p style="color: red;">✗ Error: ${error.message}</p>`;
    }

    button.disabled = false;
  });

  container.querySelector("#test-ttl").addEventListener("click", async () => {
    const ttl = parseInt(container.querySelector("#ttl-input").value) * 1000;
    const resultDiv = container.querySelector("#ttl-result");
    const button = container.querySelector("#test-ttl");

    button.disabled = true;
    resultDiv.innerHTML = "<p>Fetching with custom TTL...</p>";

    try {
      const data = await api.getCached("/news?page=1&limit=3", ttl);

      resultDiv.innerHTML = `
        <p class="highlight">✓ Data cached with TTL: ${ttl / 1000}s</p>
        <p>Data will expire in ${ttl / 1000} seconds</p>
        <p>Try fetching again within ${ttl / 1000}s to see cache hit</p>
      `;

      addLog("info", `Custom TTL set: ${ttl / 1000}s`);
    } catch (error) {
      resultDiv.innerHTML = `<p style="color: red;">✗ Error: ${error.message}</p>`;
    }

    button.disabled = false;
  });

  container.querySelector("#test-post").addEventListener("click", async () => {
    const resultDiv = container.querySelector("#invalidation-result");
    const button = container.querySelector("#test-post");

    button.disabled = true;
    resultDiv.innerHTML = "<p>Sending POST request...</p>";

    try {
      // This will fail but will invalidate cache
      await api.post("/news", { title: "Test" }).catch(() => {});

      resultDiv.innerHTML = `
        <p class="highlight">✓ POST request sent</p>
        <p>Cache for /news/* has been invalidated</p>
        <p>Try fetching /news again - it will be a cache miss</p>
      `;

      addLog("invalidate", "POST /news - cache invalidated");
      updateStats();
    } catch (error) {
      resultDiv.innerHTML = `<p>Request sent, cache invalidated</p>`;
    }

    button.disabled = false;
  });

  container.querySelector("#test-put").addEventListener("click", async () => {
    const resultDiv = container.querySelector("#invalidation-result");
    const button = container.querySelector("#test-put");

    button.disabled = true;

    try {
      await api.put("/news/123", { title: "Updated" }).catch(() => {});

      resultDiv.innerHTML = `
        <p class="highlight">✓ PUT request sent</p>
        <p>Cache for /news/* has been invalidated</p>
      `;

      addLog("invalidate", "PUT /news/123 - cache invalidated");
      updateStats();
    } catch (error) {
      resultDiv.innerHTML = `<p>Request sent, cache invalidated</p>`;
    }

    button.disabled = false;
  });

  container.querySelector("#test-delete").addEventListener("click", async () => {
    const resultDiv = container.querySelector("#invalidation-result");
    const button = container.querySelector("#test-delete");

    button.disabled = true;

    try {
      await api.delete("/news/123").catch(() => {});

      resultDiv.innerHTML = `
        <p class="highlight">✓ DELETE request sent</p>
        <p>Cache for /news/* has been invalidated</p>
      `;

      addLog("invalidate", "DELETE /news/123 - cache invalidated");
      updateStats();
    } catch (error) {
      resultDiv.innerHTML = `<p>Request sent, cache invalidated</p>`;
    }

    button.disabled = false;
  });

  container.querySelector("#test-prefetch").addEventListener("click", async () => {
    const resultDiv = container.querySelector("#prefetch-result");
    const button = container.querySelector("#test-prefetch");

    button.disabled = true;
    resultDiv.innerHTML = "<p>Prefetching...</p>";

    const endpoints = [
      "/news?page=1&limit=5",
      "/news?page=2&limit=5",
      "/news?page=3&limit=5",
    ];

    const startTime = performance.now();
    await prefetchData(api, endpoints, CacheStrategies.LONG);
    const duration = (performance.now() - startTime).toFixed(2);

    resultDiv.innerHTML = `
      <p class="highlight">✓ Prefetched ${endpoints.length} endpoints in ${duration}ms</p>
      <p>Endpoints:</p>
      ${endpoints.map((e) => `<p>• ${e}</p>`).join("")}
      <p><em>These are now cached and will load instantly</em></p>
    `;

    addLog("info", `Prefetched ${endpoints.length} endpoints`);
    updateStats();
    button.disabled = false;
  });

  container.querySelector("#test-warm").addEventListener("click", async () => {
    const resultDiv = container.querySelector("#warm-result");
    const button = container.querySelector("#test-warm");

    button.disabled = true;
    resultDiv.innerHTML = "<p>Warming cache...</p>";

    const startTime = performance.now();
    await warmCache(api, {
      critical: ["/news?page=1&limit=5"],
      frequent: ["/news?page=2&limit=5", "/news?page=3&limit=5"],
    });
    const duration = (performance.now() - startTime).toFixed(2);

    resultDiv.innerHTML = `
      <p class="highlight">✓ Cache warmed in ${duration}ms</p>
      <p>Critical and frequent data cached</p>
    `;

    addLog("info", "Cache warmed successfully");
    updateStats();
    button.disabled = false;
  });

  container.querySelector("#test-performance").addEventListener("click", async () => {
    const count = parseInt(container.querySelector("#perf-count").value);
    const resultDiv = container.querySelector("#performance-result");
    const button = container.querySelector("#test-performance");

    button.disabled = true;
    resultDiv.innerHTML = "<p>Running performance test...</p>";

    // Test without cache
    api.clearCache();
    const startNoCache = performance.now();
    for (let i = 1; i <= count; i++) {
      await api.get(`/news?page=${i}&limit=1`);
    }
    const durationNoCache = (performance.now() - startNoCache).toFixed(2);

    // Test with cache
    const startWithCache = performance.now();
    for (let i = 1; i <= count; i++) {
      await api.get(`/news?page=${i}&limit=1`);
    }
    const durationWithCache = (performance.now() - startWithCache).toFixed(2);

    const improvement = (
      ((durationNoCache - durationWithCache) / durationNoCache) *
      100
    ).toFixed(2);

    resultDiv.innerHTML = `
      <p class="highlight">Performance Test Results (${count} requests)</p>
      <p>Without cache: ${durationNoCache}ms</p>
      <p>With cache: ${durationWithCache}ms</p>
      <p>Improvement: ${improvement}% faster</p>
      <p>Average per request:</p>
      <p>• No cache: ${(durationNoCache / count).toFixed(2)}ms</p>
      <p>• With cache: ${(durationWithCache / count).toFixed(2)}ms</p>
    `;

    button.disabled = false;
  });

  container.querySelector("#start-monitor").addEventListener("click", () => {
    if (monitoringInterval) return;

    const logDiv = container.querySelector("#monitor-log");
    logDiv.innerHTML = "<p>Monitoring started...</p>";

    monitoringInterval = setInterval(() => {
      const stats = api.getCacheStats();
      if (stats) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement("div");
        entry.className = "log-entry info";
        entry.textContent = `[${timestamp}] Total: ${stats.total}, Valid: ${stats.valid}, Expired: ${stats.expired}`;
        logDiv.insertBefore(entry, logDiv.firstChild);

        while (logDiv.children.length > 20) {
          logDiv.removeChild(logDiv.lastChild);
        }
      }
    }, 2000);
  });

  container.querySelector("#stop-monitor").addEventListener("click", () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
      addLog("info", "Monitoring stopped");
    }
  });

  // Helper functions
  function updateStats() {
    const stats = api.getCacheStats();
    if (stats) {
      container.querySelector("#stat-total").textContent = stats.total;
      container.querySelector("#stat-valid").textContent = stats.valid;
      container.querySelector("#stat-expired").textContent = stats.expired;
      container.querySelector("#stat-max").textContent = stats.maxSize;

      const hitRate =
        stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(2) : 0;
      container.querySelector("#stat-hitrate").textContent = `${hitRate}%`;
    }
  }

  function addLog(type, message) {
    const logDiv = container.querySelector("#monitor-log");
    if (logDiv) {
      const timestamp = new Date().toLocaleTimeString();
      const entry = document.createElement("div");
      entry.className = `log-entry ${type}`;
      entry.textContent = `[${timestamp}] ${message}`;
      logDiv.insertBefore(entry, logDiv.firstChild);
    }
  }

  // Initial stats
  updateStats();

  return container;
}
