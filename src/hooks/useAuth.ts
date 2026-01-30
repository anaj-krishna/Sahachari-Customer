import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { loginApi, registerApi } from "../services/auth.api";
import { useAuthStore } from "../store/auth.store";
import { ApiError } from "../types/api";
import { AuthResponse } from "../types/auth";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    AuthResponse,
    AxiosError<ApiError>,
    Parameters<typeof loginApi>[0]
  >({
    mutationFn: loginApi,
    onSuccess: (res) => {
      setAuth(res.accessToken, res.user);
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    AuthResponse,
    AxiosError<ApiError>,
    Parameters<typeof registerApi>[0]
  >({
    mutationFn: registerApi,
    onSuccess: (res) => {
      setAuth(res.accessToken, res.user);
    },
  });
};