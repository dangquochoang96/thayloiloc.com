export class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add Auth Token if exists
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // POST with FormData (for file uploads)
  async postFormData(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {};

    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // Upload single image file
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    return this.postFormData("/order/upload-image", formData);
  }

  // Upload multiple images and return array of URLs
  async uploadMultipleImages(files) {
    const uploadPromises = Array.from(files).map(file => this.uploadImage(file));
    const results = await Promise.all(uploadPromises);
    // Extract image_link from responses
    return results.map(result => result.data?.image_link || result.image_link);
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient("https://api.chothuetatca.com/api");
export const geyserecoApi = new ApiClient("https://geysereco.com/api");
export const mobileApi = new ApiClient("http://mobile.chothuetatca.com/api");
