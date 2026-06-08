import axiosInstance from "./axiosInstance";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerAdmin = async (payload: RegisterPayload) => {
  const response = await axiosInstance.post("/admin/auth/register", payload);
  return response.data;
};

export const login = async (payload: LoginPayload) => {
  const response = await axiosInstance.post("/admin/auth/login", payload);
  return response.data;
};
