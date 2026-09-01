import apiClient from "./client";

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const response = await apiClient.post(
    "/auth/register",
    data
  );

  return response.data;
}

export async function loginUser(data: LoginData) {
  const response = await apiClient.post(
    "/auth/login",
    data
  );

  return response.data;
}