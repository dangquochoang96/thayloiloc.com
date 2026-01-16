import { api } from "./api.js";

export const feedbacksService = {
  getFeedbacksList() {
    return api.get("/feedbacks");
  },

  addFeedback(formData) {
    return api.post(`/feedbacks`, formData);
  },
}