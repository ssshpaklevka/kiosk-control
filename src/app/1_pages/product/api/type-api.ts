import { apiClient } from "../../../3_features/api/api-client";
import { UpdateProductType } from "../types/type.dto";

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

  updateTypes: async (id: number, type: UpdateProductType) => {
    const formData = new FormData();

    if (type.name) formData.append("name", type.name);
    if (type.description) formData.append("description", type.description);
    if (type.price !== undefined)
      formData.append("price", type.price.toString());
    if (type.type) formData.append("type", type.type);
    if (type.weight !== undefined)
      formData.append("weight", type.weight.toString());

    // Добавляем изображение только если оно было выбрано
    if (type.image) {
      formData.append("image", type.image);
    }

    const response = await apiClient.patch(`/product-type/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteTypes: async (id: number) => {
    const response = await apiClient.delete(`/product-type/${id}`);
    return response.data;
  },
};
