import { apiClient } from "@/app/3_features/api/api-client";
import { Advertising } from "../types/adevrtising";

export const advertisingApi = {
  createAdvertising: async (advertising: Advertising) => {
    const formData = new FormData();

    formData.append("file", advertising.file);

    formData.append("name", advertising.name);
    formData.append("seconds", advertising.seconds.toString());
    formData.append("is_active", advertising.is_active.toString());

    formData.append("storage", JSON.stringify(advertising.storage));

    const response = await apiClient.post("/advertising", formData);
    return response.data;
  },
};
