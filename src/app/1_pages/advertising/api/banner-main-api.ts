import { apiClient } from "@/app/3_features/api/api-client";
import {
  BannerMain,
  CreateBanner,
  UpdateBannerMainDto,
} from "../types/adevrtising";

export const bannerMainApi = {
  getBanners: async (): Promise<BannerMain[]> => {
    try {
      const response = await apiClient.get("/banner-main");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.bannerMain || [];
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getBannerById: async (id: number): Promise<BannerMain> => {
    const response = await apiClient.get(`/banner-main/${id}`);
    return response.data;
  },

  createBanner: async (bannerData: CreateBanner): Promise<BannerMain> => {
    const formData = new FormData();

    formData.append("file", bannerData.file);

    formData.append("name", bannerData.name);
    formData.append("seconds", bannerData.seconds.toString());
    formData.append("is_active", bannerData.is_active.toString());

    if (bannerData.store && bannerData.store.length > 0) {
      bannerData.store.forEach((storeId, index) => {
        formData.append(`store[${index}]`, storeId);
      });
    }

    const response = await apiClient.post("/banner-main", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    });
    return response.data;
  },

  updateBanner: async (
    id: number,
    bannerData: UpdateBannerMainDto
  ): Promise<BannerMain> => {
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

    const response = await apiClient.patch(`/banner-main/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    });
    return response.data;
  },

  deleteBanner: async (id: number): Promise<void> => {
    await apiClient.delete(`/banner-main/${id}`);
  },
};
