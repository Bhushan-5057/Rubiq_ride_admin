import axiosInstance from "./axiosInstance";
import { GetAllPagination } from "./getAllAdapter";

export interface FeedbackUser {
  name?: string;
  profileImage?: string;
}

export interface FeedbackRide {
  _id?: string;
  rideId?: string;
  pickup?: {
    address?: string;
  };
  drop?: {
    address?: string;
  };
  status?: string;
  fareEstimate?: number;
  createdAt?: string;
}

export interface Feedback {
  _id: string;
  ride?: FeedbackRide | string;
  givenBy?: "driver" | "passenger" | string;
  givenByUser?: FeedbackUser;
  givenTo?: "driver" | "passenger" | string;
  givenToUser?: FeedbackUser;
  rating?: number;
  comment?: string;
  createdAt?: string;
}

export interface FeedbackQuery {
  page?: number;
  limit?: number;
  rating?: string | number;
  givenBy?: string;
  givenTo?: string;
  rideId?: string;
  startDate?: string;
  endDate?: string;
}

export interface FeedbackListResult {
  feedbacks: Feedback[];
  pagination: GetAllPagination;
}

const pendingFeedbackRequests = new Map<string, Promise<FeedbackListResult>>();

const cleanFeedbackQuery = (query: FeedbackQuery = {}) =>
  Object.fromEntries(
    Object.entries({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      rating: query.rating,
      givenBy: query.givenBy,
      givenTo: query.givenTo,
      rideId: query.rideId,
      startDate: query.startDate,
      endDate: query.endDate,
    }).filter(([, value]) => value !== undefined && value !== ""),
  );

const normalizePagination = (pagination: any): GetAllPagination => ({
  total: Number(pagination?.total) || 0,
  page: Number(pagination?.page) || 1,
  limit: Number(pagination?.limit) || 20,
  totalPages: Number(pagination?.totalPages ?? pagination?.pages) || 0,
});

export const getAllFeedback = async (
  query: FeedbackQuery = {},
): Promise<FeedbackListResult> => {
  const params = cleanFeedbackQuery(query);
  const requestKey = JSON.stringify(params);
  const pendingRequest = pendingFeedbackRequests.get(requestKey);
  if (pendingRequest) return pendingRequest;

  const request = axiosInstance
    .get("/feedback", {
      params,
      suppressGlobalFeedback: true,
    } as any)
    .then((response) => {
      const data = response.data?.data || response.data || {};

      return {
        feedbacks: Array.isArray(data.feedbacks) ? data.feedbacks : [],
        pagination: normalizePagination(data.pagination),
      };
    })
    .finally(() => {
      pendingFeedbackRequests.delete(requestKey);
    });

  pendingFeedbackRequests.set(requestKey, request);
  return request;
};
