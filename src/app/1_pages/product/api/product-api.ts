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
    // Создаем FormData для отправки файла
    const formData = new FormData();

    // Добавляем файл
    formData.append("image", productData.image);

    // Добавляем остальные данные
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
    formData.append("variant", productData.variant); // Отправляем как обычную строку без JSON.stringify
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
    // Создаем FormData для отправки файла
    const formData = new FormData();

    // Добавляем файл (если есть)
    if (productData.image) {
      formData.append("image", productData.image);
    }

    // Добавляем остальные данные
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", productData.price.toString());
    formData.append("type", productData.type);
    formData.append("weight", productData.weight.toString());

    console.log("🔄 Отправляем обновление продукта:", {
      idProduct,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      type: productData.type,
      weight: productData.weight,
      hasImage: !!productData.image,
    });

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
      console.log("API Response:", response.data);
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
      console.log("API Response:", response.data);
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
