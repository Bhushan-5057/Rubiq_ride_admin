import axiosInstance from "./axiosInstance";

export interface Ride {
  rideId: string;
  status: "pending" | "accepted" | "completed" | "canceled";
   distance: number;
  fareEstimate: number;
  pickup: {
    address: string;
    coordinates: [number, number];
  };
  drop: {
    address: string;
    coordinates: [number, number];
  };
  passenger: {
    id: string;
    name: string;
    contactNumber: string;
    email: string;
  };
  driver?: {
    id: string;
    name: string;
    vehicleNumber: string;
    vehicleType: string;
    contactNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const fetchAllRides = async () => {
  const response = await axiosInstance.get("/admin/manage/rides/get-all");
  return response.data;
};

export const fetchRideById = async (id: string) => {
  const response = await axiosInstance.get(`/admin/manage/rides/${id}`);
  return response.data;
};

export const deleteRideById = async (id: string) => {
  const response = await axiosInstance.delete(`/admin/manage/rides/${id}`);
  return response.data;
};

export const deleteAllRidesApi = async () => {
  const response = await axiosInstance.delete(`/admin/manage/rides/delete-all`);
  return response.data;
};
