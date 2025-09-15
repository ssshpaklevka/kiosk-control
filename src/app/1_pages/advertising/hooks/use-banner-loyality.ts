import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bannerLoyalityApi } from "../api/banner-loyality";
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

// Хук для получения всех баннеров
export const useGetBannersLoyality = () => {
  return useQuery<BannerMain[], Error>({
    queryKey: ["banner-loyality"],
    queryFn: bannerLoyalityApi.getBanners,
  });
};

// Хук для получения баннера по id
export const useGetBannerLoyality = (id: number) => {
  return useQuery<BannerMain, Error>({
    queryKey: ["banner-loyality", id],
    queryFn: () => bannerLoyalityApi.getBannerById(id),
  });
};

// Хук для создания баннера
export const useCreateBannerLoyality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerData: CreateBanner) =>
      bannerLoyalityApi.createBannerLoyality(bannerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-loyality"] });
      toast.success("Баннер успешно создан!");
    },
    onError: (error: Error) => {
      const message =
        (error as AxiosError).response?.data?.message ||
        error.message ||
        "Ошибка при создании баннера";
      toast.error(message);
    },
  });
};

// Хук для обновления баннера
export const useUpdateBannerLoyality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBannerMainDto }) =>
      bannerLoyalityApi.updateBannerLoyality(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["banner-loyality"] });
      queryClient.invalidateQueries({
        queryKey: ["banner-loyality", variables.id],
      });
      toast.success("Баннер успешно обновлен!");
    },
    onError: (error: Error) => {
      const message =
        (error as AxiosError).response?.data?.message ||
        error.message ||
        "Ошибка при обновлении баннера";
      toast.error(message);
    },
  });
};

// Хук для удаления баннера
export const useDeleteBannerLoyality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bannerLoyalityApi.deleteBannerLoyality(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-loyality"] });
      toast.success("Баннер успешно удален!");
    },
    onError: (error: Error) => {
      const message =
        (error as AxiosError).response?.data?.message ||
        error.message ||
        "Ошибка при удалении баннера";
      toast.error(message);
    },
  });
};
