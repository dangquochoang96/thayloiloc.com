import { api } from './api.js';

export const authService = {
  async login(phone, pass) {
    try {
      const response = await api.post('/user/login', { phone, pass });
      if (response.code === 1 && response.data) {
        console.log(response.data);
        localStorage.setItem('user_info', JSON.stringify(response.data));
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  },

  async register(phone, name, pass) {
    try {
      const response = await api.post('/user/register', { phone, name, pass });
      if (response.code === 1 && response.data) {
        console.log(response.data);
        return response;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('user_info');
    window.location.hash = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('user_info');
  },

  getUser() {
    const user = localStorage.getItem('user_info');
    console.log(user);
    return user ? JSON.parse(user) : null;
  },

  // getUserId() {
  //   const user = this.getUser();
  //   return user ? user.id : null;
  // }
};
