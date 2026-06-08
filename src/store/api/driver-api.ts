import axiosInstance from "./axiosInstance";

// Document interface for nested structure
export interface DriverDocuments {
  aadhaarFront?: string;
  aadhaarBack?: string;
  aadhaarStatus: "incomplete" | "pending" | "approved" | "rejected";
  panFront?: string;
  panBack?: string;
  panStatus: "incomplete" | "pending" | "approved" | "rejected";
  licenseFront?: string;
  licenseBack?: string;
  licenseStatus: "incomplete" | "pending" | "approved" | "rejected";
  rcFront?: string;
  rcBack?: string;
  rcStatus: "incomplete" | "pending" | "approved" | "rejected";
  _id?: string;
}

// Main driver interface
export interface Driver {
  _id: string;
  id?: string;
  name?: string;
  email?: string;
  contactNumber: string;
  city?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  profileImage?: string;
  approvalStatus: "incompleted" | "pending" | "approved" | "rejected";
  verificationStatus?: "pending" | "approved" | "rejected";
  documentsVerified?: boolean;
  remarks?: string;
  verificationRemarks?: string;
  otpVerified?: boolean;
  profileCompleted?: boolean;
  status: "active" | "suspended";
  createdAt?: string;
  updatedAt?: string;
  documents?: DriverDocuments | null;
}

// ===== API CALLS =====

// Get all drivers
export const fetchAllDrivers = async () => {
  const response = await axiosInstance.get("/admin/manage/drivers/get-all");
  return response.data; // { success, drivers }
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
  status?: "active" | "suspended";
}

// Update driver status (active/suspended)
export const updateDriverStatus = async (
  id: string,
  status: "active" | "suspended"
) => {
  const response = await axiosInstance.put(`/admin/manage/drivers/update-status/${id}`, {
    status,
  });
  return response.data;
};

// Delete driver
export const deleteDriver = async (id: string) => {
  const response = await axiosInstance.delete(`/v2/drivers/manage/delete/${id}`);
  return response.data;
};
