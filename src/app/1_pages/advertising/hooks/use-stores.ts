import { useQuery } from "@tanstack/react-query";
import { storeApi } from "../api/store-api";
import { Store } from "../types/adevrtising";

// Хук для получения всех магазинов
export const useStores = () => {
  return useQuery<Store[], Error>({
    queryKey: ["stores"],
    queryFn: storeApi.getStores,
  });
};

// Хук для получения магазина по id
export const useStore = (id: string, enabled = true) => {
  return useQuery<Store, Error>({
    queryKey: ["stores", id],
    queryFn: () => storeApi.getStoreById(id),
    enabled: enabled && !!id,
  });
};
