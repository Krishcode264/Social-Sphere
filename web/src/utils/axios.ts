import axios from "axios";

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const token = window.sessionStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    } catch {
      // If sessionStorage is not available, silently ignore
    }
  }
  return config;
});
