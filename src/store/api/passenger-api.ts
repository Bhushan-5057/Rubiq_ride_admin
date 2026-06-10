import axiosInstance from "./axiosInstance";
import { cleanGetAllQuery, GetAllQuery } from "./getAllAdapter";

export type PassengerAccountStatus = "active" | "inactive" | "blocked" | "pending";

export interface Passenger {
  createdAt: string | number | Date;
  city?: string;
  _id: string;
  name: string;
  profileImage?: string;
  contactNumber: string;
  email?: string;
  dateOfBirth?: string | number | Date;
  gender?: string;
  otpVerified?: boolean;
  profileCompleted?: boolean;
  updatedAt?: string | number | Date;
  lastLogoutAt?: string | number | Date;
  location?: {
    type?: string;
    coordinates?: number[];
  };
  rating?: {
    average?: number;
    count?: number;
  };
  rideStats?: {
    completed?: number;
    cancelled?: number;
  };
  status: PassengerAccountStatus;
  id?: string;
}

export const fetchAllPassengers = async (query: GetAllQuery = {}) => {
  const response = await axiosInstance.get("/admin/manage/passengers/get-all", {
    params: cleanGetAllQuery(query),
  });
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
  status?: PassengerAccountStatus;
}

export const updatePassengerStatus = async (
  id: string,
  status: PassengerAccountStatus
) => {
  const response = await axiosInstance.put(
    `/admin/manage/passengers/update-status/${id}`,
    {
      status,
    }
  );
  return response.data;
};
