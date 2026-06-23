import axiosInstance from "./axiosInstance";
import { cleanGetAllQuery, GetAllQuery } from "./getAllAdapter";

export type PassengerAccountStatus = "active" | "inactive" | "blocked" | "pending";

export interface RiskAssessment {
  level?: "normal" | "warning" | "high";
  complaintsCount?: number;
  cancellationRate?: number;
  missedRides?: number;
  eligibleForBlockReview?: boolean;
  blockReviewReasons?: unknown[];
}

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
    missed?: number;
  };
  complaints?: {
    total?: number;
    open?: number;
    resolved?: number;
  };
  riskAssessment?: RiskAssessment;
  blockedReason?: string;
  adminComment?: string;
  blockedAt?: string | number | Date;
  blockedBy?: unknown;
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
  adminComment?: string;
}

export const updatePassengerStatus = async (
  id: string,
  status: PassengerAccountStatus,
  blockedReason?: string,
  adminComment?: string,
  forceBlock?: boolean
) => {
  const payload: Record<string, unknown> = { status };

  if (status === "blocked") {
    if (blockedReason) payload.blockedReason = blockedReason;
    if (adminComment) payload.adminComment = adminComment;
    if (forceBlock) payload.forceBlock = forceBlock;
  } else if (status === "inactive") {
    if (adminComment) payload.adminComment = adminComment;
  }

  const response = await axiosInstance.put(
    `/admin/manage/passengers/update-status/${id}`,
    payload
  );

  return response.data;
};
