import { api } from './api.js';

export const productService = {
  async getListProduct(userId) {
    try {
      const response = await api.get(`/user/listProduct/${userId}`);
      
      if (response.code === 200) {
        return response.data.listProducts;
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching product list:', error);
      throw error;
    }
  }
};
