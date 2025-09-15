import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bannerMainApi } from "../api/banner-main-api";
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

export const useGetBannersMain = () => {
  return useQuery<BannerMain[], Error>({
    queryKey: ["banner-main"],
    queryFn: bannerMainApi.getBanners,
  });
};

export const useGetBannerMain = (id: number) => {
  return useQuery<BannerMain, Error>({
    queryKey: ["banner-main", id],
    queryFn: () => bannerMainApi.getBannerById(id),
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerData: CreateBanner) =>
      bannerMainApi.createBanner(bannerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-main"] });
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

export const useUpdateBannerMain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBannerMainDto }) =>
      bannerMainApi.updateBanner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["banner-main"] });
      queryClient.invalidateQueries({
        queryKey: ["banner-main", variables.id],
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

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bannerMainApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-main"] });
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
