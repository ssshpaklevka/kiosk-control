import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bannerTvApi } from "../api/banner-tv-api";
import {
  BannerTv,
  CreateBannerTv,
  UpdateBannerTvDto,
} from "../types/adevrtising";

interface AxiosError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useGetBannersTv = () => {
  return useQuery<BannerTv[], Error>({
    queryKey: ["banner-tv"],
    queryFn: bannerTvApi.getBanners,
  });
};

export const useGetBannerTv = (id: number) => {
  return useQuery<BannerTv, Error>({
    queryKey: ["banner-tv", id],
    queryFn: () => bannerTvApi.getBannerById(id),
  });
};

export const useCreateBannerTv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerData: CreateBannerTv) =>
      bannerTvApi.createBanner(bannerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-tv"] });
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

export const useUpdateBannerTv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBannerTvDto }) =>
      bannerTvApi.updateBanner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["banner-tv"] });
      queryClient.invalidateQueries({
        queryKey: ["banner-tv", variables.id],
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

export const useDeleteBannerTv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bannerTvApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-tv"] });
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
