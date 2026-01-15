import { api } from "./api.js";
import { geyserecoApi } from "./api.js";

export const newsService = {
  getNewsList() {
    return api.get("/blog/list");
  },

  getNewsDetail(id) {
    return api.get(`/blog/detail/${id}`);
  },

  // Get news from Geysereco API with pagination
  async getGeyserecoNewsWithPagination(slug, page = 1, perPage = 8) {
    try {
      const response = await geyserecoApi.get(`/blogs/category/${slug}?page=${page}&per_page=${perPage}`);

      if (response.code === 200) {
        return {
          data: response.data.data || [],
          current_page: response.data.current_page || page,
          last_page: response.data.last_page || 1,
          total: response.data.total || 0,
          per_page: response.data.per_page || perPage,
          from: response.data.from || 0,
          to: response.data.to || 0
        };
      } else {
        throw new Error(response.message || 'Lỗi tin tức');
      }
    } catch (error) {
      console.error('Lỗi tin tức:', error);
      throw error;
    }
  },

  // Get news detail from Geysereco API
  async getGeyserecoNewsDetail(id) {
    try {
      console.log('Calling getGeyserecoNewsDetail with id:', id);
      const response = await geyserecoApi.get(`/blogs/detail/${id}`);
      console.log('API response:', response);
      
      if (response.code === 200) {
        return response.data;
      } else {
        throw new Error(response.message || 'Lỗi chi tiết tin tức');
      }
    } catch (error) {
      console.error('Lỗi chi tiết tin tức:', error);
      throw error;
    }
  }
};