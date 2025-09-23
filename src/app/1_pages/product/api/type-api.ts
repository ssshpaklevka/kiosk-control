import { apiClient } from "../../../3_features/api/api-client";

export const typeApi = {
  getTypes: async () => {
    try {
      const response = await apiClient.get("/product-type");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.productType || [];
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getTypesById: async (id: number) => {
    const response = await apiClient.get(`/product-type/${id}`);
    return response.data;
  },

  deleteTypes: async (id: number) => {
    const response = await apiClient.delete(`/product-type/${id}`);
    return response.data;
  },
};
