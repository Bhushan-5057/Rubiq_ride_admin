import axiosInstance from "./axiosInstance";

export interface Passenger {
  createdAt: string | number | Date;
  city?: string;
  _id: string;
  name: string;
  profileImage?: string;
  contactNumber: string;
  email?: string;
  status: "active" | "suspended";
  id?: string;
}

export const fetchAllPassengers = async () => {
  const response = await axiosInstance.get("/admin/manage/passengers/get-all");
  return response.data;
};

export const fetchPassengerById = async (id: string) => {
  const response = await axiosInstance.get(
    `/admin/manage/passengers/get/${id}`
  );
  return response.data;
};


export interface UpdatePassengerPayload {
  id: string;
  name?: string;
  contactNumber?: string;
  email?: string;
  status?: "active" | "suspended";
}

export const updatePassengerStatus = async (
  id: string,
  status: "active" | "suspended"
) => {
  const response = await axiosInstance.put(
    `/admin/manage/passengers/update-status/${id}`,
    {
      status,
    }
  );
  return response.data;
};
