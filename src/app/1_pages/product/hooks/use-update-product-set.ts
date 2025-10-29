import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProductSetApi } from "../api/update-product-set";
import { UpdateProductSet } from "../types/update-product-set.dto";

export const useUpdateProductSet = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateProductSet, Error, void>({
    mutationFn: () => updateProductSetApi.updateProductSet(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["group-original"] });
      toast.success(data.message || "Список продуктов успешно обновлен!");
    },
    onError: (error) => {
      const message = error.message || "Ошибка при обновлении списка продуктов";
      toast.error(message);
    },
  });
};
