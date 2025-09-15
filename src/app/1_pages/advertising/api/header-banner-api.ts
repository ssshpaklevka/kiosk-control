import { apiClient } from "@/app/3_features/api/api-client";
import {
  BannerMain,
  CreateBanner,
  UpdateBannerMainDto,
} from "../types/adevrtising";

export const headerBannerApi = {
  // Получение всех баннеров в шапке заказа
  getBanners: async (): Promise<BannerMain[]> => {
    try {
      const response = await apiClient.get("/banner-menu");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.bannerMenu || [];
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Получение баннера по id
  getBannerById: async (id: number): Promise<BannerMain> => {
    const response = await apiClient.get(`/banner-menu/${id}`);
    return response.data;
  },

  // Создание нового баннера
  createBanner: async (bannerData: CreateBanner): Promise<BannerMain> => {
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

    console.log("🔄 Отправляем данные баннера в шапке:", {
      name: bannerData.name,
      seconds: bannerData.seconds,
      is_active: bannerData.is_active,
      store: bannerData.store,
      hasFile: !!bannerData.file,
    });

    const response = await apiClient.post("/banner-menu", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // Увеличиваем таймаут до 60 секунд для загрузки файлов
    });
    return response.data;
  },

  // Обновление существующего баннера
  updateBanner: async (
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
    }

    const response = await apiClient.patch(`/banner-menu/${id}`, formData);
    return response.data;
  },

  // Удаление баннера (если понадобится)
  deleteBanner: async (id: number): Promise<void> => {
    await apiClient.delete(`/banner-menu/${id}`);
  },
};
