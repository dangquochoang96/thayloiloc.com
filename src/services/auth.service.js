import { api } from "./api.js";

export const authService = {
  async login(phone, pass) {
    try {
      const response = await api.post("/user/login", { phone, pass });
      if (response.code === 1 && response.data) {
        console.log(response.data);
        localStorage.setItem("user_info", JSON.stringify(response.data));
        return response;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      throw error;
    }
  },

  async register(phone, name, pass) {
    try {
      return api.post("/user/register", { phone, name, pass });
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("user_info");
    window.location.hash = "/login";
  },

  isAuthenticated() {
    return !!localStorage.getItem("user_info");
  },

  getUser() {
    const user = localStorage.getItem("user_info");
    console.log(user);
    return user ? JSON.parse(user) : null;
  },

  getCurrentUser() {
    return this.getUser();
  },

  getUserFromServer(id) {
    return api.get(`/user/${id}`);
  },

  getUserDisplayName() {
    const user = this.getUser();
    if (!user) return "Người dùng";

    // Try different possible field names for user name
    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.ten ||
      user.ho_ten ||
      "Người dùng"
    );
  },

  // Debug method to check user data structure
  debugUserData() {
    const userInfo = localStorage.getItem("user_info");
    console.log("Raw user_info from localStorage:", userInfo);

    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        console.log("Parsed user data:", parsed);
        console.log("Available fields:", Object.keys(parsed));
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

  async changePassword(currentPassword, newPassword) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await api.put("/user/change-password", {
        id: user.id,
        currentPassword,
        newPassword,
      });

      if (response.code === 1) {
        return response;
      } else {
        throw new Error(response.message || "Change password failed");
      }
    } catch (error) {
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
