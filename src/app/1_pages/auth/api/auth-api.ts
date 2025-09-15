import { apiClient } from "@/app/3_features/api/api-client";
import { LoginDto, AuthResponse } from "../types/auth";

export const authApi = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },
};
