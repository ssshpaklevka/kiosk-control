import { apiClient } from "../../../3_features/api/api-client";

export const extrasApi = {
  getExtras: async () => {
    try {
      const response = await apiClient.get("/product-extras");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.productExtras || [];
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getExtrasById: async (id: number) => {
    const response = await apiClient.get(`/product-extras/${id}`);
    return response.data;
  },

  deleteExtras: async (id: number) => {
    const response = await apiClient.delete(`/product-extras/${id}`);
    return response.data;
  },
};
