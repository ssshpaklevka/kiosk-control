import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../api/auth-api";
import { LoginDto } from "../types/auth";

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginDto) => authApi.login(credentials),
    onSuccess: (data) => {
      if (data.auth) {
        // Сохраняем данные пользователя в localStorage
        const userData = {
          role: data.role,
          store: data.store,
          token: data.token,
          sessionId: data.sessionId,
        };
        localStorage.setItem("authUser", JSON.stringify(userData));

        // Если есть токен, сохраняем его отдельно для удобства
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        toast.success("Авторизация успешна!");
      } else {
        toast.error("Недостаточно прав для доступа");
      }
    },
    onError: (error: Error) => {
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.message || "Неверный логин или пароль";
      toast.error(message);
    },
  });
};
