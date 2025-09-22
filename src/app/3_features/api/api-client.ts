import axios from "axios";

const API_DOMAIN = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
  // baseURL: "https://statosphera.ru/api/foodcord/",
  baseURL: API_DOMAIN,
  withCredentials: true, // Включаем отправку cookies с запросами
  headers: {
    "Content-Type": "application/json",
  },
});
