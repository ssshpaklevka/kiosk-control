import axios from "axios";

export const apiClient = axios.create({
  // baseURL: "https://statosphera.ru/api/foodcord/",
  baseURL: "http://localhost:3006/api/foodcord",
  timeout: 10000,
  withCredentials: true, // Включаем отправку cookies с запросами
  headers: {
    "Content-Type": "application/json",
  },
});
