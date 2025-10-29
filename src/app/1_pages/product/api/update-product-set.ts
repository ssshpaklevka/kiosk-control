import { apiClient } from "../../../3_features/api/api-client";
import { UpdateProductSet } from "../types/update-product-set.dto";

export const updateProductSetApi = {
  updateProductSet: async (): Promise<UpdateProductSet> => {
    const response = await apiClient.get(
      "/product-original/update-product-set"
    );
    return response.data;
  },
};
