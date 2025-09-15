import { apiClient } from "../../../3_features/api/api-client";
import {
  CreateProductIngredient,
  ProductIngredient,
} from "../types/product.dto";

export const ingredientsApi = {
  getProductIngredients: async (): Promise<ProductIngredient[]> => {
    try {
      const response = await apiClient.get("/product-ingridients");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.productIngredients || [];
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  createProductIngredient: async (ingredient: CreateProductIngredient) => {
    const response = await apiClient.post("/product-ingridients", ingredient);
    return response.data;
  },

  updateProductIngredient: async (
    id: number,
    ingredient: CreateProductIngredient
  ) => {
    const response = await apiClient.patch(
      `/product-ingridients/${id}`,
      ingredient
    );
    return response.data;
  },

  deleteProductIngredient: async (id: number) => {
    const response = await apiClient.delete(`/product-ingridients/${id}`);
    return response.data;
  },
};
