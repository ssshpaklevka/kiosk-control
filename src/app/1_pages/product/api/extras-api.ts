import { apiClient } from "../../../3_features/api/api-client";
import { UpdateProductExtras } from "../types/extras.dto";

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

  updateExtras: async (id: number, extras: UpdateProductExtras) => {
    const formData = new FormData();

    if (extras.name) formData.append("name", extras.name);
    if (extras.description) formData.append("description", extras.description);
    if (extras.price !== undefined)
      formData.append("price", extras.price.toString());
    if (extras.type) formData.append("type", extras.type);
    if (extras.weight !== undefined)
      formData.append("weight", extras.weight.toString());

    if (extras.image) {
      formData.append("image", extras.image);
    }

    const response = await apiClient.patch(`/product-extras/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
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
