import { apiClient } from "../../../3_features/api/api-client";
import {
  BannerMain,
  CreateBanner,
  UpdateBannerMainDto,
} from "../types/adevrtising";

export const bannerLoyalityApi = {
  createBannerLoyality: async (
    bannerData: CreateBanner
  ): Promise<BannerMain> => {
    const formData = new FormData();

    // Добавляем файл
    formData.append("file", bannerData.file);

    // Добавляем остальные данные как строки (FormData требует строки)
    formData.append("name", bannerData.name);
    formData.append("seconds", bannerData.seconds.toString());
    formData.append("is_active", bannerData.is_active.toString());

    // Добавляем store только если он есть
    if (bannerData.store && bannerData.store.length > 0) {
      bannerData.store.forEach((storeId, index) => {
        formData.append(`store[${index}]`, storeId);
      });
    }

    console.log("🔄 Отправляем данные баннера:", {
      name: bannerData.name,
      seconds: bannerData.seconds,
      is_active: bannerData.is_active,
      store: bannerData.store,
      hasFile: !!bannerData.file,
    });

    const response = await apiClient.post("/banner-loyality", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // Увеличиваем таймаут до 60 секунд для загрузки файлов
    });
    return response.data;
  },

  updateBannerLoyality: async (
    id: number,
    bannerData: UpdateBannerMainDto
  ): Promise<BannerMain> => {
    const formData = new FormData();

    // Добавляем только те поля, которые были переданы
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

    if (bannerData.store !== undefined) {
      bannerData.store.forEach((storeId, index) => {
        formData.append(`store[${index}]`, storeId);
      });
      // Или альтернативный вариант:
      // formData.append('store', JSON.stringify(bannerData.store));
    }

    const response = await apiClient.patch(`/banner-loyality/${id}`, formData);
    return response.data;
  },

  getBanners: async () => {
    try {
      const response = await apiClient.get("/banner-loyality");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.bannerLoyality || [];
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  getBannerById: async (id: number) => {
    const response = await apiClient.get(`/banner-loyality/${id}`);
    return response.data;
  },

  deleteBannerLoyality: async (id: number): Promise<void> => {
    await apiClient.delete(`/banner-loyality/${id}`);
  },
};
