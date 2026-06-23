import axiosInstance from "./axiosInstance";
import { GetAllQuery } from "./getAllAdapter";

export interface ReportListParams {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}

export type ReportRecord = Record<string, unknown>;

export interface ReportResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: {
    meta?: ReportRecord;
    data?: T;
  } | T;
}

const cleanReportParams = (params: ReportListParams = {}) =>
  Object.fromEntries(
    Object.entries({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      fromDate: params.fromDate ?? "",
      toDate: params.toDate ?? "",
    }).filter(([, value]) => value !== undefined),
  );

export const toReportListParams = (query: GetAllQuery): ReportListParams => ({
  page: query.page ?? 1,
  limit: query.limit ?? 10,
  fromDate: query.startDate ?? "",
  toDate: query.endDate ?? "",
});

export const getSummaryReport = async () => {
  const response = await axiosInstance.get<ReportResponse<ReportRecord>>(
    "/admin/reports/summary",
  );
  return response.data;
};

export const getDriverReport = async (params: ReportListParams = {}) => {
  const response = await axiosInstance.get<ReportResponse<ReportRecord[]>>(
    "/admin/reports/drivers",
    { params: cleanReportParams(params) },
  );
  return response.data;
};

export const getDriverReportById = async (id: string) => {
  const response = await axiosInstance.get<ReportResponse<ReportRecord>>(
    `/admin/reports/drivers/${id}`,
  );
  return response.data;
};

export const getPassengerReport = async (params: ReportListParams = {}) => {
  const response = await axiosInstance.get<ReportResponse<ReportRecord[]>>(
    "/admin/reports/passengers",
    { params: cleanReportParams(params) },
  );
  return response.data;
};

export const getPassengerReportById = async (id: string) => {
  const response = await axiosInstance.get<ReportResponse<ReportRecord>>(
    `/admin/reports/passengers/${id}`,
  );
  return response.data;
};

export const getRevenueReport = async () => {
  const response = await axiosInstance.get<ReportResponse<ReportRecord>>(
    "/admin/reports/revenue",
  );
  return response.data;
};

export const getRideReport = async () => {
  const response = await axiosInstance.get<ReportResponse<ReportRecord>>(
    "/admin/reports/rides",
  );
  return response.data;
};
