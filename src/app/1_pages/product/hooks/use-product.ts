import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productsApi } from "../api/product-api";
import {
  CreateProduct,
  Product,
  ProductIngredient,
  ProductOriginal,
  ProductType,
  UpdateProduct,
} from "../types/product.dto";

export const useGetProduct = () => {
  return useQuery<Product[]>({
    queryKey: ["product-main"],
    queryFn: productsApi.getProduct,
    refetchOnMount: "always",
  });
};

export const useGetProductById = (id: number) => {
  return useQuery<Product>({
    queryKey: ["product-main", id],
    queryFn: () => productsApi.getProductById(id),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: CreateProduct) =>
      productsApi.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-main"] });
      toast.success("Продукт успешно создан!");
    },
    onError: (error) => {
      const message = error.message || "Ошибка при создании продукта";
      toast.error(message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ProductOriginal,
    Error,
    { productData: UpdateProduct; idProduct: number }
  >({
    mutationFn: ({ productData, idProduct }) =>
      productsApi.updateProduct(productData, idProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-main"] });
      toast.success("Продукт успешно обновлен!");
    },
    onError: (error) => {
      const message = error.message || "Ошибка при обновлении продукта";
      toast.error(message);
    },
  });
};

export const useGetGroupOriginal = () => {
  return useQuery({
    queryKey: ["group-original"],
    queryFn: productsApi.getGroupOriginal,
  });
};

export const useGetProductOriginal = (groupCode: string) => {
  return useQuery<ProductOriginal[]>({
    queryKey: ["product-original", groupCode],
    queryFn: () => productsApi.getProductOriginal(groupCode),
    enabled: !!groupCode,
  });
};

export const useGetProductExtras = (enabled: boolean = true) => {
  return useQuery<ProductIngredient[]>({
    queryKey: ["product-extras"],
    queryFn: productsApi.getProductExtras,
    placeholderData: [],
    enabled,
  });
};

export const useGetProductType = (enabled: boolean = true) => {
  return useQuery<ProductType[]>({
    queryKey: ["product-type"],
    queryFn: productsApi.getProductType,
    placeholderData: [],
    enabled,
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-main"] });
      toast.success("Продукт успешно удален!");
    },
    onError: (error) => {
      const message = error.message || "Ошибка при удалении продукта";
      toast.error(message);
    },
  });
};
