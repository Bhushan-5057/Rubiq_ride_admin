import axiosInstance from "./axiosInstance";
import { GetAllPagination } from "./getAllAdapter";

export type ComplaintStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type ComplaintCategory =
  | "PAYMENT"
  | "BEHAVIOUR"
  | "LATE_PICKUP"
  | "WRONG_ROUTE"
  | "APP_ISSUE"
  | "OTHER";

export interface ComplaintUser {
  _id?: string;
  $oid?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface ComplaintRide {
  _id?: string;
  $oid?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickup?: {
    address?: string;
    location?: string;
  };
  drop?: {
    address?: string;
    location?: string;
  };
  dropoff?: {
    address?: string;
    location?: string;
  };
  pickupAddress?: string;
  dropoffAddress?: string;
  dropAddress?: string;
  fare?: number;
  fareEstimate?: number;
}

export interface Complaint {
  _id: string;
  complaintId?: string;
  raisedBy?: ComplaintUser | string;
  raisedByUser?: string;
  targetType?: string;
  against?: ComplaintUser | string | null;
  againstUser?: string;
  rideId?: ComplaintRide | string | null;
  category?: ComplaintCategory | string;
  description?: string;
  status?: ComplaintStatus | string;
  adminResponse?: string;
  createdAt?: string | { $date?: string };
  updatedAt?: string | { $date?: string };
  __v?: number;
}

export interface ComplaintQuery {
  page?: number;
  limit?: number;
  status?: ComplaintStatus | string;
  category?: ComplaintCategory | string;
  rideId?: string;
}

export interface ComplaintListResult {
  complaints: Complaint[];
  pagination: GetAllPagination;
}

export interface UpdateComplaintStatusPayload {
  status: Exclude<ComplaintStatus, "PENDING">;
  adminResponse: string;
}

const pendingComplaintRequests = new Map<string, Promise<ComplaintListResult>>();

type ApiRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is ApiRecord =>
  typeof value === "object" && value !== null;

const cleanComplaintQuery = (query: ComplaintQuery = {}) =>
  Object.fromEntries(
    Object.entries({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status,
      category: query.category,
      rideId: query.rideId,
    }).filter(([, value]) => value !== undefined && value !== ""),
  );

const normalizePagination = (pagination: unknown): GetAllPagination => {
  const data = isRecord(pagination) ? pagination : {};

  return {
    total: Number(data.total) || 0,
    page: Number(data.page) || 1,
    limit: Number(data.limit) || 20,
    totalPages: Number(data.totalPages ?? data.pages) || 0,
  };
};

const normalizeComplaint = (responseData: unknown): Complaint => {
  const responseRecord = isRecord(responseData) ? responseData : {};
  const data = responseRecord.data ?? responseData;
  const dataRecord = isRecord(data) ? data : {};
  return (dataRecord.complaint ?? dataRecord.data ?? data) as Complaint;
};

export const getAllComplaints = async (
  query: ComplaintQuery = {},
): Promise<ComplaintListResult> => {
  const params = cleanComplaintQuery(query);
  const requestKey = JSON.stringify(params);
  const pendingRequest = pendingComplaintRequests.get(requestKey);
  if (pendingRequest) return pendingRequest;

  const request = axiosInstance
    .get("/admin/manage/complaints", {
      params,
      suppressGlobalFeedback: true,
    } as Parameters<typeof axiosInstance.get>[1])
    .then((response) => {
      const responseData = response.data as unknown;
      const responseRecord = isRecord(responseData) ? responseData : {};
      const dataValue = responseRecord.data || responseData || {};
      const data = isRecord(dataValue) ? dataValue : {};

      return {
        complaints: Array.isArray(data.data) ? (data.data as Complaint[]) : [],
        pagination: normalizePagination(data.meta),
      };
    })
    .finally(() => {
      pendingComplaintRequests.delete(requestKey);
    });

  pendingComplaintRequests.set(requestKey, request);
  return request;
};

export const getComplaintById = async (complaintId: string): Promise<Complaint> => {
  const response = await axiosInstance.get(
    `/admin/manage/complaints/${complaintId}`,
    {
      suppressGlobalFeedback: true,
    } as Parameters<typeof axiosInstance.get>[1],
  );
  return normalizeComplaint(response.data);
};

export const updateComplaintStatus = async (
  complaintId: string,
  payload: UpdateComplaintStatusPayload,
): Promise<Complaint> => {
  const response = await axiosInstance.put(
    `/admin/manage/complaints/status/${complaintId}`,
    payload,
  );
  return normalizeComplaint(response.data);
};
