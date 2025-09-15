import { apiClient } from "@/app/3_features/api/api-client";
import { CreateGroupSub } from "../types/groups-sub.dto";

export const groupsSubApi = {
  getGroupsSub: async () => {
    try {
      const response = await apiClient.get("/groups-sub");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.groups || [];
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  createGroupSub: async (groupSub: CreateGroupSub) => {
    const response = await apiClient.post("/groups-sub/create", groupSub);
    return response.data;
  },

  updateGroupSub: async (id: number, groupSub: CreateGroupSub) => {
    const response = await apiClient.patch(`/groups-sub/${id}`, groupSub);
    return response.data;
  },

  deleteGroupSub: async (id: number) => {
    const response = await apiClient.delete(`/groups-sub/${id}`);
    return response.data;
  },
};
