import {api} from "./api";

export async function getUserProfile() {
  const response = await api.get("/users/me");
  return response.data;
}

export async function updateUserProfile(data: Partial<any>) {
  const response = await api.patch("/users/update-me", data);
  return response.data;
}