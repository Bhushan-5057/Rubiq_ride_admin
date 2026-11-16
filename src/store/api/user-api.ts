import axiosInstance from "./axiosInstance";

// Fetch all users with optional filters
export const fetchAllUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  department?: string;
} = {}) => {
  const defaultParams = {
    page: params.page || 1,
    limit: params.limit || 100,
    ...params,
  };
  const response = await axiosInstance.get("/admin/manage/get-all", {
    params: defaultParams,
  });
  return response.data; // { data: [...], total: number, ... }
};

// Fetch single user by ID
export const fetchUserById = async (id: string) => {
  const response = await axiosInstance.get(`/admin/manage/get/${id}`);
  return response.data;
};

// Create new user
interface CreateUserPayload {
  email: string;
  name: string;
  status?: string;
  password: string;
}

export const createUser = async (payload: CreateUserPayload) => {
  const response = await axiosInstance.post("/admin/manage/create", payload);
  return response.data;
};

// Update existing user
interface UpdateUserPayload {
  id: string;
  email?: string;
  status?: string;
  name?: string;
  password?: string;
}

export const updateUser = async (payload: UpdateUserPayload) => {
  const { id, ...userData } = payload;
  const response = await axiosInstance.put(`/admin/manage/update/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id: string) => {
  const response = await axiosInstance.delete(`/admin/manage/delete/${id}`);
  return response.data;
};

// Update user status
export const updateUserStatus = async (id: string, status: string) => {
  const response = await axiosInstance.put(`/admin/manage/update-status/${id}`, { status });
  return response.data;
};
