import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { typeApi } from "../api/type-api";
import { ProductType } from "../types/type.dto";

export const useGetTypes = () => {
  return useQuery<ProductType[]>({
    queryKey: ["product-type"],
    queryFn: typeApi.getTypes,
  });
};

export const useGetTypesById = (id: number) => {
  return useQuery<ProductType>({
    queryKey: ["product-type", id],
    queryFn: () => typeApi.getTypesById(id),
  });
};

export const useDeleteTypes = () => {
  const queryClient = useQueryClient();
  return useMutation<ProductType, Error, number>({
    mutationFn: (id) => typeApi.deleteTypes(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-type"] });
      toast.success("Тип продукта успешно удален");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при удалении типа продукта");
    },
  });
};
