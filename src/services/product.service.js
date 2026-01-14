import { api } from './api.js';

export const productService = {
  // Get all products (for home page - no login required)
  async getProductList() {
    try {
      const response = await api.get('/product/list');
      console.log('Product list response:', response);
      
      // Handle different response structures
      if (response.code === 200 || response.status === 'success' || response.success) {
        return response.data || response.products || [];
      } else if (Array.isArray(response)) {
        // If response is directly an array
        return response;
      } else if (response.message === 'success' && response.data) {
        // Handle case where message is "success"
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching product list:', error);
      throw error;
    }
  },

  // Get products for a specific user (for booking page)
  async getListProduct(userId) {
    try {
      const response = await api.get(`/user/listProduct/${userId}`);
      
      if (response.code === 200) {
        return response.data.listProducts || [];
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching user product list:', error);
      throw error;
    }
  }
};
