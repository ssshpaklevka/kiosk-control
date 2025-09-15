import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ingredientsApi } from "../api/ingredients-api";
import {
  CreateProductIngredient,
  ProductIngredient,
} from "../types/product.dto";

export const useGetProductIngredients = (enabled: boolean = true) => {
  return useQuery<ProductIngredient[]>({
    queryKey: ["product-ingredients"],
    queryFn: ingredientsApi.getProductIngredients,
    placeholderData: [],
    enabled,
  });
};

export const useCreateProductIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingredientsApi.createProductIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-ingredients"] });
      toast.success("Ингредиент успешно создан");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при создании ингредиента");
    },
  });
};

export const useUpdateProductIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ProductIngredient,
    Error,
    { id: number; ingredient: CreateProductIngredient }
  >({
    mutationFn: ({ id, ingredient }) =>
      ingredientsApi.updateProductIngredient(id, ingredient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-ingredients"] });
      toast.success("Ингредиент успешно обновлен");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при обновлении ингредиента");
    },
  });
};

export const useDeleteProductIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation<ProductIngredient, Error, number>({
    mutationFn: ingredientsApi.deleteProductIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-ingredients"] });
      toast.success("Ингредиент успешно удален");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при удалении ингредиента");
    },
  });
};
