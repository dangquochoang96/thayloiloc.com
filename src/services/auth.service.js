import { api } from "./api.js";

export const authService = {
  async login(phone, pass) {
    try {
      // Clear any existing session and cache first to avoid data contamination
      localStorage.removeItem("user_info");
      localStorage.removeItem("auth_token");
      api.clearCache();

      const response = await api.post("/user/login", { phone, pass });
            
      // Check for success with flexible code comparison
      const isSuccess = 
        response.code === 1 || 
        response.code === "1" || 
        response.success === true ||
        response.message === "success" ||
        response.msg === "success";
      
      if (isSuccess) {
        // Handle different response structures
        const userData = response.data || response.user || response;
                
        // Save user info
        if (userData && typeof userData === 'object') {
          localStorage.setItem("user_info", JSON.stringify(userData));
        }
        
        // Save Bearer token - check multiple possible locations
        const token = response.token || response.access_token || userData?.token || userData?.access_token;
        if (token) {
          localStorage.setItem("auth_token", token);
                  } else {
          console.warn("No token found in response");
        }
        
        return response;
      } else {
        throw new Error(response.message || response.msg || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async register(phone, name, pass) {
    try {
      const response = await api.post("/user/register", { phone, name, pass });
      if (response.code == 1) {
        return response;
      } else {
        throw new Error(response.message || response.msg || response.messenger || "Đăng ký thất bại");
      }
    } catch (error) {
      throw error;
    }
  },

  async registerTechnician(data) {
    try {
      const formData = new FormData();
      formData.append("phone", data.phone);
      formData.append("name", data.name);
      formData.append("pass", data.pass);
      formData.append("type", data.type);
      formData.append("type_staff", data.type_staff);
      formData.append("address", data.address);
      formData.append("birthday", data.birthday);
      formData.append("id_card_number", data.id_card_number);
      formData.append("id_card_image_front", data.id_card_image_front);
      formData.append("id_card_image_back", data.id_card_image_back);
      
      // Add services as array with single value
      formData.append("services[0]", data.services);

      const response = await api.postFormData("/user/register", formData);
      if (response.code == 1) {
        return response;
      } else {
        throw new Error(response.message || response.msg || response.messenger || "Đăng ký kỹ thuật viên thất bại");
      }
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("user_info");
    localStorage.removeItem("auth_token");
    window.location.hash = "/login";
  },

  isAuthenticated() {
    return !!localStorage.getItem("user_info");
  },

  getUser() {
    const user = localStorage.getItem("user_info");
        return user ? JSON.parse(user) : null;
  },

  getCurrentUser() {
    return this.getUser();
  },

  async getUserFromServer() {
    try {
      // Debug: Check if token exists
      const token = localStorage.getItem('auth_token');
            if (token) {
              }
      
      // Try both possible endpoints
      let response;
      try {
        // Try without v1.0 prefix first
        response = await api.get(`/user`);
      } catch (err) {
        // If that fails, try with v1.0 prefix
                response = await api.get(`/v1.0/user`);
      }
      
            
      // Handle response structure
      if (response && response.code === 1 && response.data) {
        return response.data;
      } else if (response && response.username) {
        // Direct user object
        return response;
      }
      
      throw new Error(response?.message || "Không thể lấy thông tin người dùng");
    } catch (error) {
      console.error("Get user from server error:", error);
      throw error;
    }
  },

  async refreshUserData() {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        // Silently return if no user in localStorage
        return null;
      }
      
      // Call API to get fresh user data (API uses Bearer token, no ID needed)
      const freshUserData = await this.getUserFromServer();
            
      if (freshUserData) {
        // Update localStorage with fresh data
        localStorage.setItem("user_info", JSON.stringify(freshUserData));
        return freshUserData;
      }
      
      // If API call failed, return cached user
            return user;
    } catch (error) {
      console.error("Refresh user data error:", error);
      // Don't throw, return cached user to allow page to continue
      return this.getCurrentUser();
    }
  },

  getUserDisplayName() {
    const user = this.getUser();
    if (!user) return "Người dùng";

    // Prioritize fields to find a display name, ignoring "Người dùng" placeholder if possible
    const fields = [
      user.username,
      user.name,
      user.fullName,
      user.ten,
      user.ho_ten,
      user.phone
    ];

    for (const val of fields) {
      if (val !== undefined && val !== null) {
        const strVal = String(val).trim();
        if (strVal && strVal !== "Người dùng") {
          return strVal;
        }
      }
    }

    return "Người dùng";
  },

  // Debug method to check user data structure
  debugUserData() {
    const userInfo = localStorage.getItem("user_info");
    
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
                        return parsed;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  },

  async updateProfile(userData) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await api.put("/user/profile", {
        ...userData,
        id: user.id,
      });

      if (response.code === 1) {
        // Update local storage with new user data
        const updatedUser = { ...user, ...userData };
        localStorage.setItem("user_info", JSON.stringify(updatedUser));
        return response;
      } else {
        throw new Error(response.message || "Update profile failed");
      }
    } catch (error) {
      throw error;
    }
  },

  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error("Bạn chưa đăng nhập");
      }

                  
      // Use geyserecoApi instead of api
      const { geyserecoApi } = await import('./api.js');
      
      const endpoint = `/user/${user.id}/changePassWord`;
                  
      const response = await geyserecoApi.post(endpoint, {
        password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });

      
      if (response.code === 1) {
        return response;
      } else {
        throw new Error(response.message || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  },

  async uploadAvatar(file) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("id", user.id);

      const response = await api.post("/user/upload-avatar", formData);

      if (response.code === 1) {
        // Update local storage with new avatar URL
        const updatedUser = { ...user, avatar: response.data.avatar };
        localStorage.setItem("user_info", JSON.stringify(updatedUser));
        return response;
      } else {
        throw new Error(response.message || "Upload avatar failed");
      }
    } catch (error) {
      throw error;
    }
  },
};
