import { apiClient } from "../../../3_features/api/api-client";
import {
  BannerTv,
  CreateBannerTv,
  UpdateBannerTvDto,
} from "../types/adevrtising";

export const bannerTvApi = {
  getBanners: async (): Promise<BannerTv[]> => {
    try {
      const response = await apiClient.get("/banner-tv");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.bannerTv || [];
    } catch (error) {
      throw error;
    }
  },

  getBannerById: async (id: number): Promise<BannerTv> => {
    const response = await apiClient.get(`/banner-tv/${id}`);
    return response.data;
  },

  createBanner: async (bannerData: CreateBannerTv): Promise<BannerTv> => {
    const formData = new FormData();

    formData.append("file", bannerData.file);

    formData.append("name", bannerData.name);
    formData.append("seconds", bannerData.seconds.toString());
    formData.append("is_active", bannerData.is_active.toString());

    if (bannerData.store && bannerData.store.length > 0) {
      bannerData.store.forEach((storeId, index) => {
        formData.append(`store[${index}]`, storeId.toString());
      });
    }

    const response = await apiClient.post("/banner-tv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    });
    return response.data;
  },

  updateBanner: async (
    id: number,
    bannerData: UpdateBannerTvDto
  ): Promise<BannerTv> => {
    const formData = new FormData();

    if (bannerData.file) {
      formData.append("file", bannerData.file);
    }

    if (bannerData.name !== undefined) {
      formData.append("name", bannerData.name);
    }

    if (bannerData.seconds !== undefined) {
      formData.append("seconds", bannerData.seconds.toString());
    }

    if (bannerData.is_active !== undefined) {
      formData.append("is_active", bannerData.is_active.toString());
    }

    if (bannerData.store !== undefined && Array.isArray(bannerData.store)) {
      bannerData.store.forEach((storeId, index) => {
        if (storeId !== undefined && storeId !== null) {
          formData.append(`store[${index}]`, storeId.toString());
        }
      });
    }

    if (bannerData.tv_number !== undefined) {
      formData.append("tv_number", bannerData.tv_number.toString());
    }

    const response = await apiClient.patch(`/banner-tv/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    });
    return response.data;
  },

  deleteBanner: async (id: number): Promise<void> => {
    await apiClient.delete(`/banner-tv/${id}`);
  },
};
