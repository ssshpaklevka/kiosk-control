import { apiClient } from "@/app/3_features/api/api-client";
import { CreateGroup, UpdateGroup } from "../types/group.dto";

export const groupsApi = {
  getGroups: async () => {
    try {
      const response = await apiClient.get("/groups/get-all-group");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.groups || [];
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  createGroup: async (group: CreateGroup) => {
    const formData = new FormData();

    formData.append("name", group.name);
    formData.append("image", group.image);
    formData.append("idStore", JSON.stringify(group.store));

    const response = await apiClient.post("/groups/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateGroup: async (id: number, group: UpdateGroup) => {
    const formData = new FormData();

    formData.append("name", group.name);

    formData.append("idStore", JSON.stringify(group.store));

    if (group.image) {
      formData.append("image", group.image);
    }

    const response = await apiClient.patch(`/groups/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteGroup: async (id: number) => {
    const response = await apiClient.delete(`/groups/${id}`);
    return response.data;
  },
};
