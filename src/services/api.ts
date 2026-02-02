import axios from "axios";
import { useAuthStore } from "../store/auth.store";

export const api = axios.create({
  baseURL: "http://192.168.2.241:3000",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (__DEV__) {
    // Don't print the full token, only presence and length for safety
    console.debug(
      "[api.request]",
      `${config.method?.toUpperCase()} ${config.url}`,
      {
        hasToken: Boolean(token),
        tokenLength: token ? token.length : 0,
        headers: {
          Authorization: config.headers?.Authorization,
        },
      },
    );
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (__DEV__) {
      console.debug(
        "[api.response.error]",
        error?.response?.status,
        error?.response?.data,
      );
    }

    if (error?.response?.status === 401) {
      // Helpful warning during development
      console.warn("API 401 Unauthorized — token may be missing or invalid.");
    }
    return Promise.reject(error);
  },
);
