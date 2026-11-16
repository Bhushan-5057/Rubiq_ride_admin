import axiosInstance from "./axiosInstance";

export interface AdminProfile {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface ApiResponseShape {
  message?: string;
  user?: AdminProfile;
  data?: {
    message?: string;
    user?: AdminProfile;
    admin?: AdminProfile;
  };
}

const pickProfile = (response: ApiResponseShape): AdminProfile | null =>
  response?.user ?? response?.data?.user ?? response?.data?.admin ?? null;

const pickMessage = (response: ApiResponseShape, fallback: string): string =>
  response?.message ?? response?.data?.message ?? fallback;

export const fetchAdminProfileApi = async () => {
  const response = await axiosInstance.get("/admin/profile");
  return {
    raw: response.data as ApiResponseShape,
    user: pickProfile(response.data) ?? {},
    message: pickMessage(response.data, "Profile fetched successfully"),
  };
};

export const updateAdminProfileApi = async (payload: { name: string }) => {
  const response = await axiosInstance.put("/admin/profile", payload);
  const data = response.data as ApiResponseShape;

  return {
    raw: data,
    user: pickProfile(data),
    message: pickMessage(data, "Profile updated successfully"),
  };
};

export const changeAdminPasswordApi = async (payload: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await axiosInstance.put("/admin/profile", payload);
  const data = response.data as ApiResponseShape;

  return {
    raw: data,
    message: pickMessage(data, "Password changed successfully"),
  };
};
