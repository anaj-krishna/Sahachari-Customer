import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { loginApi, registerApi, getProfile } from "../services/auth.api";
import { useAuthStore } from "../store/auth.store";
import { ApiError } from "../types/api";
import { AuthResponse } from "../types/auth";
import { User, Role } from "../types/user";
import {jwtDecode} from "jwt-decode";
export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    AuthResponse, 
    AxiosError<ApiError>,
    Parameters<typeof loginApi>[0]
  >({
    mutationFn: loginApi,
    onSuccess: async (res) => {
      const token = res.accessToken;

      // If backend already returned user, use it; otherwise fetch /users/me with token
      if (res.user) {
        setAuth(token, res.user);
        return;
      }

      try {
        const user = await getProfile(token);
        setAuth(token, user);
      } catch (err: any) {
        // Log detailed debug information so we can see why /users/me returns 401
        console.error("Failed to fetch profile after login:", {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        });

        // If profile fetch failed due to authorization, try to decode token and use claims as a fallback
        try {
          const decoded: any = jwtDecode(token);
          const id = decoded.userId ?? decoded.sub;
          const role = decoded.role as Role | undefined;

          if (!id || !role) {
            throw new Error("Decoded token missing required claims");
          }

          if (role !== Role.USER) {
            throw new Error("Invalid role for customer app");
          }

          const fallbackUser: User = {
            id,
            email: decoded.email ?? "",
            role,
            name: decoded.name ?? undefined,
          };

          // Persist minimal user from token claims to avoid /users/me dependency
          setAuth(token, fallbackUser);
          return;
        } catch (decodeErr: any) {
          const status = err?.response?.status;
          const serverMsg = err?.response?.data?.message;
          const msg = status
            ? `Login succeeded but fetching profile failed (${status}): ${serverMsg || err.message}`
            : `Login succeeded but fetching profile failed: ${err.message}`;

          // Throw a clearer error so the UI shows it
          throw new Error(msg);
        }
      }
    },
  });
};

export const useRegister = () => {
  // Registration no longer automatically sets auth; backend redirects to login.
  return useMutation<
    AuthResponse,
    AxiosError<ApiError>,
    Parameters<typeof registerApi>[0]
  >({
    mutationFn: registerApi,
  });
};