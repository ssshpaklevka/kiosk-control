import { apiClient } from "@/app/3_features/api/api-client";
import { Store } from "../types/adevrtising";

export const storeApi = {
  // Получение всех магазинов
  getStores: async (): Promise<Store[]> => {
    const response = await apiClient.get("/stores");
    return response.data;
  },

  // Получение магазина по id
  getStoreById: async (id: string): Promise<Store> => {
    const response = await apiClient.get(`/stores/${id}`);
    return response.data;
  },
};
