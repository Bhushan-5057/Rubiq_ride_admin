import axiosInstance from "./axiosInstance";
import { cleanGetAllQuery, GetAllQuery } from "./getAllAdapter";

// Document interface for nested structure
export interface DriverDocuments {
  aadhaarNumber?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
  aadhaarStatus: "incomplete" | "pending" | "approved" | "rejected";
  panNumber?: string;
  panFront?: string;
  panBack?: string;
  panStatus: "incomplete" | "pending" | "approved" | "rejected";
  licenseNumber?: string;
  licenseFront?: string;
  licenseBack?: string;
  licenseStatus: "incomplete" | "pending" | "approved" | "rejected";
  rcNumber?: string;
  rcFront?: string;
  rcBack?: string;
  rcStatus: "incomplete" | "pending" | "approved" | "rejected";
  insuranceNumber?: string;
  insurance?: string;
  insuranceStatus?: "incomplete" | "pending" | "approved" | "rejected";
  _id?: string;
}

interface RatingSummary {
  average?: number;
  count?: number;
}

interface DriverEarnings {
  totalDriverPayout?: number;
  totalEarnings?: number;
  totalPlatformFee?: number;
}

interface DriverRideStats {
  completed?: number;
  cancelled?: number;
  missed?: number;
}
export interface RiskAssessment {
  level?: "normal" | "warning" | "high";
  complaintsCount?: number;
  cancellationRate?: number;
  missedRides?: number;
  eligibleForBlockReview?: boolean;
  blockReviewReasons?: unknown[];
}

export type DriverAccountStatus = "pending" | "active" | "inactive" | "blocked";
export type DriverApprovalStatus =
  | "incompleted"
  | "pending"
  | "approved"
  | "rejected";
export type DriverAvailabilityStatus = "available" | "unavailable" | "on_trip";

// Main driver interface
export interface Driver {
  _id: string;
  id?: string;
  name?: string;
  email?: string;
  contactNumber: string;
  city?: string;
  gender?: string;
  dateOfBirth?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  profileImage?: string;
  approvalStatus: DriverApprovalStatus;
  verificationStatus?: "pending" | "approved" | "rejected";
  documentsVerified?: boolean;
  remarks?: string;
  verificationRemarks?: string;
  otpVerified?: boolean;
  profileCompleted?: boolean;
  isOnline?: boolean;
  driverStatus?: DriverAvailabilityStatus;
  lastOnline?: string;
  lastOffline?: string;
  latitude?: number;
  longitude?: number;
  rating?: RatingSummary;
  earnings?: DriverEarnings;
  rideStats?: DriverRideStats;
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
  status: DriverAccountStatus;
  createdAt?: string;
  updatedAt?: string;
  documents?: DriverDocuments | null;
}

// ===== API CALLS =====

// Get all drivers
export const fetchAllDrivers = async (query: GetAllQuery = {}) => {
  const response = await axiosInstance.get("/admin/manage/drivers/get-all", {
    params: cleanGetAllQuery(query),
  });
  return response.data;
};

// Get single driver by ID
export const fetchDriverById = async (id: string) => {
  const response = await axiosInstance.get(`/admin/manage/drivers/get/${id}`);
  return response.data; // { success, driver }
};

// Create a driver (if admin adds manually)
export interface CreateDriverPayload {
  name: string;
  contactNumber: string;
  email?: string;
  password: string;
}

export interface UpdateDriverPayload {
  id: string;
  name?: string;
  email?: string;
  contactNumber?: string;
  status?: DriverAccountStatus;
  adminComment?: string;
}

// Update driver account status
export const updateDriverStatus = async (
  id: string,
  status: DriverAccountStatus,
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
    `/admin/manage/drivers/update-status/${id}`,
    payload
  );

  return response.data;
};

// Delete driver
export const deleteDriver = async (id: string) => {
  const response = await axiosInstance.delete(`/v2/drivers/manage/delete/${id}`);
  return response.data;
};
