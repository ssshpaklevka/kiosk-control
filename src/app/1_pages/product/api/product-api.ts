import { apiClient } from "@/app/3_features/api/api-client";
import {
  CreateProduct,
  GroupOriginal,
  Product,
  ProductIngredient,
  ProductOriginal,
  ProductType,
  UpdateProduct,
} from "../types/product.dto";

export const productsApi = {
  getProduct: async (): Promise<Product[]> => {
    const response = await apiClient.get(`product-main`);
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`product-main/${id}`);
    return response.data;
  },

  createProduct: async (
    productData: CreateProduct
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const formData = new FormData();

    formData.append("image", productData.image);

    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("composition", productData.composition);
    formData.append("calories", productData.calories.toString());
    formData.append("proteins", productData.proteins.toString());
    formData.append("fats", productData.fats.toString());
    formData.append("carbohydrates", productData.carbohydrates.toString());
    formData.append("color", productData.color);

    formData.append("groups", JSON.stringify(productData.groups));
    formData.append("subgroups", JSON.stringify(productData.subGroups));
    formData.append("extras", JSON.stringify(productData.extras));
    formData.append("variant", productData.variant);
    formData.append("type", JSON.stringify(productData.type));
    formData.append("ingredients", JSON.stringify(productData.ingredients));
    const response = await apiClient.post(`product-main`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateProduct: async (productData: UpdateProduct, idProduct: number) => {
    const formData = new FormData();

    if (productData.image) {
      formData.append("image", productData.image);
    }

    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", productData.price.toString());
    formData.append("type", productData.type);
    formData.append("weight", productData.weight.toString());

    const response = await apiClient.post(
      `product-original/update-product/${idProduct}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getGroupOriginal: async (): Promise<GroupOriginal[]> => {
    const response = await apiClient.get(`group-original`);
    return response.data;
  },

  getProductOriginal: async (groupCode: string): Promise<ProductOriginal[]> => {
    const response = await apiClient.get(`product-original`, {
      params: { groupCode },
    });
    return response.data;
  },

  getProductExtras: async (): Promise<ProductIngredient[]> => {
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

  getProductType: async (): Promise<ProductType[]> => {
    try {
      const response = await apiClient.get("/product-type");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.productTypes || [];
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  deleteProduct: async (id: number): Promise<void> => {
    const response = await apiClient.delete(`product-main/${id}`);
    return response.data;
  },
};
