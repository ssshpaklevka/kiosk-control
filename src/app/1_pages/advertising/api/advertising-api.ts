import { apiClient } from "@/app/3_features/api/api-client";
import { Advertising } from "../types/adevrtising";

export const advertisingApi = {
  createAdvertising: async (advertising: Advertising) => {
    // Создаем FormData для отправки файла
    const formData = new FormData();

    // Добавляем файл
    formData.append("file", advertising.file);

    // Добавляем остальные данные
    formData.append("name", advertising.name);
    formData.append("seconds", advertising.seconds.toString());
    formData.append("is_active", advertising.is_active.toString());

    // Добавляем массив storage как JSON строку
    formData.append("storage", JSON.stringify(advertising.storage));

    const response = await apiClient.post("/advertising", formData);
    return response.data;
  },
};
