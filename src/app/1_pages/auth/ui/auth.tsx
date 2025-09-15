"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLogin } from "../hooks/use-auth";
import { useAuth } from "@/app/providers/auth-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Заполните все поля");
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({ email, password });
      if (response.auth && response.role === "admin") {
        login({
          role: response.role,
          store: response.store,
          token: response.token,
          sessionId: response.sessionId,
        });
      }
    } catch (error) {
      // Ошибка уже обработана в хуке
    }
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-medium">Авторизация</h1>
      <div className="w-[700px]">
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <div className="flex flex-col gap-2">
            <p>Email</p>
            <Input
              type="email"
              placeholder="Введите почту"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loginMutation.isPending}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p>Пароль</p>
            <Input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginMutation.isPending}
            />
          </div>
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Авторизация..." : "Авторизоваться"}
          </Button>
        </form>
      </div>
    </div>
  );
};
