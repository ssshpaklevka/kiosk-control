export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  auth: boolean;
  role: string;
  store: {
    idStore: number;
    name: string;
  };
  token?: string; // Токен может возвращаться при авторизации
  sessionId?: string; // Или ID сессии
}

export interface AuthUser {
  role: string;
  store: {
    idStore: number;
    name: string;
  };
  token?: string;
  sessionId?: string;
}
