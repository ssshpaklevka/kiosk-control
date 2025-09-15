import { useMutation, useQueryClient } from "@tanstack/react-query";
import { advertisingApi } from "../api/advertising-api";
import { Advertising } from "../types/adevrtising";
import { toast } from "sonner";

export const useCreateAdvertising = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (advertisingData: Advertising) =>
      advertisingApi.createAdvertising(advertisingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertising"] });
      toast.success("Реклама успешно создана!");
    },
    onError: (error) => {
      const message = error.message || "Ошибка при создании рекламы";
      toast.error(message);
    },
  });
};
