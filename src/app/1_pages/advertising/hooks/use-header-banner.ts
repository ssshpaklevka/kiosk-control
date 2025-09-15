import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { headerBannerApi } from "../api/header-banner-api";
import {
  BannerMain,
  CreateBanner,
  UpdateBannerMainDto,
} from "../types/adevrtising";

interface AxiosError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Хук для получения всех баннеров в шапке заказа
export const useHeaderBanners = () => {
  return useQuery<BannerMain[], Error>({
    queryKey: ["banner-menu"],
    queryFn: headerBannerApi.getBanners,
  });
};

// Хук для получения баннера по id
export const useHeaderBanner = (id: number) => {
  return useQuery<BannerMain, Error>({
    queryKey: ["banner-menu", id],
    queryFn: () => headerBannerApi.getBannerById(id),
  });
};

// Хук для создания баннера в шапке заказа
export const useCreateHeaderBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerData: CreateBanner) =>
      headerBannerApi.createBanner(bannerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-menu"] });
      toast.success("Баннер в шапке заказа успешно создан!");
    },
    onError: (error: Error) => {
      const message =
        (error as AxiosError).response?.data?.message ||
        error.message ||
        "Ошибка при создании баннера в шапке заказа";
      toast.error(message);
    },
  });
};

// Хук для обновления баннера в шапке заказа
export const useUpdateHeaderBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBannerMainDto }) =>
      headerBannerApi.updateBanner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["banner-menu"] });
      queryClient.invalidateQueries({
        queryKey: ["banner-menu", variables.id],
      });
      toast.success("Баннер в шапке заказа успешно обновлен!");
    },
    onError: (error: Error) => {
      const message =
        (error as AxiosError).response?.data?.message ||
        error.message ||
        "Ошибка при обновлении баннера в шапке заказа";
      toast.error(message);
    },
  });
};

// Хук для удаления баннера в шапке заказа
export const useDeleteHeaderBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => headerBannerApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-menu"] });
      toast.success("Баннер в шапке заказа успешно удален!");
    },
    onError: (error: Error) => {
      const message =
        (error as AxiosError).response?.data?.message ||
        error.message ||
        "Ошибка при удалении баннера в шапке заказа";
      toast.error(message);
    },
  });
};
