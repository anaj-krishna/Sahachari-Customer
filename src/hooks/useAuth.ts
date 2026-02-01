import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { loginApi, registerApi, getProfile } from "../services/auth.api";
import { useAuthStore } from "../store/auth.store";
import { ApiError } from "../types/api";
import { AuthResponse } from "../types/auth";
import { Role } from "../types/user";
import { jwtDecode } from "jwt-decode";


export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    AuthResponse,
    AxiosError<ApiError>,
    Parameters<typeof loginApi>[0]
  >({
    mutationFn: loginApi,
    onSuccess: async ({ accessToken: token, user }) => {
      if (user) {
        // ensure persistence completes
        await setAuth(token, user);
        return;
      }

      try {
        const profile = await getProfile(token);
        await setAuth(token, profile);
        return;
      } catch (err: any) {
        console.error("Profile fetch failed:", err?.response ?? err);

        const d: any = jwtDecode(token);
        const id = d.userId ?? d.sub;
        if (!id || d.role !== Role.USER) {
          throw new Error(
            err?.response?.status
              ? `Login ok, profile failed (${err.response.status})`
              : "Login ok, profile failed"
          );
        }

        await setAuth(token, {
          id,
          role: d.role,
          email: d.email ?? "",
          name: d.name,
        });
        return;
      }
    },
  });
};

export const useRegister = () =>
  useMutation<
    AuthResponse,
    AxiosError<ApiError>,
    Parameters<typeof registerApi>[0]
  >({ mutationFn: registerApi });
