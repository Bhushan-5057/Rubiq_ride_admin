export type GetAllModule = "drivers" | "passengers" | "rides";

export interface GetAllQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  approvalStatus?: string;
  driverStatus?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetAllPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NormalizedGetAllResponse<T = any> {
  rows: T[];
  pagination: GetAllPagination;
}

export const defaultPagination: GetAllPagination = {
  total: 0,
  page: 1,
  limit: 5,
  totalPages: 0,
};

export function cleanGetAllQuery(query: GetAllQuery = {}) {
  return Object.fromEntries(
    Object.entries({
      page: query.page ?? 1,
      limit: query.limit ?? 5,
      search: query.search,
      sortBy: query.sortBy ?? "createdAt",
      sortOrder: query.sortOrder ?? "desc",
      status: query.status,
      approvalStatus: query.approvalStatus,
      driverStatus: query.driverStatus,
      startDate: query.startDate,
      endDate: query.endDate,
    }).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export function normalizeGetAllResponse<T = any>(
  module: GetAllModule,
  response: any,
): NormalizedGetAllResponse<T> {
  const body =
    response?.config || response?.headers || response?.request
      ? response?.data
      : response;

  const pagination =
    body?.pagination ??
    body?.data?.pagination ??
    body?.data?.data?.pagination ??
    defaultPagination;

  if (module === "drivers") {
    return {
      rows:
        (Array.isArray(body?.data?.drivers) && body.data.drivers) ||
        (Array.isArray(body?.drivers) && body.drivers) ||
        (Array.isArray(body?.data?.data?.drivers) && body.data.data.drivers) ||
        (Array.isArray(body?.data) && body.data) ||
        [],
      pagination,
    };
  }

  const moduleRows = body?.[module] ?? body?.data?.[module];

  return {
    rows:
      (Array.isArray(body?.data) && body.data) ||
      (Array.isArray(moduleRows) && moduleRows) ||
      (Array.isArray(body?.data?.data) && body.data.data) ||
      (Array.isArray(body) && body) ||
      [],
    pagination,
  };
}
