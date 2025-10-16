import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extrasApi } from "../api/extras-api";
import { ProductExtras, UpdateProductExtras } from "../types/extras.dto";

export const useGetExtras = () => {
  return useQuery<ProductExtras[]>({
    queryKey: ["product-extras"],
    queryFn: extrasApi.getExtras,
  });
};

export const useGetExtrasById = (id: number) => {
  return useQuery<ProductExtras>({
    queryKey: ["product-extras", id],
    queryFn: () => extrasApi.getExtrasById(id),
  });
};

export const useUpdateExtras = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ProductExtras,
    Error,
    { id: number; extras: UpdateProductExtras }
  >({
    mutationFn: ({ id, extras }) => extrasApi.updateExtras(id, extras),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-extras"] });
      toast.success("Дополнительный продукт успешно обновлен");
    },
    onError: (error) => {
      toast.error(
        error.message || "Ошибка при обновлении дополнительного продукта"
      );
    },
  });
};

export const useDeleteExtras = () => {
  const queryClient = useQueryClient();
  return useMutation<ProductExtras, Error, number>({
    mutationFn: (id) => extrasApi.deleteExtras(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-extras"] });
      toast.success("Дополнительный продукт успешно удален");
    },
    onError: (error) => {
      toast.error(
        error.message || "Ошибка при удалении дополнительного продукта"
      );
    },
  });
};
