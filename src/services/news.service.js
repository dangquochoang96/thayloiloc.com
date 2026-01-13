import { api } from "./api.js";

export const newsService = {
  getNewsList() {
    return api.get("/blog/list");
  },

  getNewsDetail(id) {
    return api.get(`/blog/detail/${id}`);
  },
};
