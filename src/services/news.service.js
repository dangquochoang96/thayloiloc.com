import { api } from "./api.js";
import { geyserecoApi } from "./api.js";


export const newsService = {
  getNewsList() {
    return api.get("/blog/list");
  },

  getNewsDetail(id) {
    return api.get(`/blog/detail/${id}`);
  },

  getGeyserecoNewsList(slug) {
    return geyserecoApi.get(`/blogs/category/${slug}`);
  },
};
