import axiosInstance from "./axiosInstance";
import {
  PricingResponse,
  UpdatePricingPayload,
} from "../../types/pricing";

export const fetchPricing = async (): Promise<PricingResponse> => {
  const response = await axiosInstance.get("/admin/pricing");
  return response.data;
};

export const updatePricing = async (
  payload: UpdatePricingPayload
): Promise<PricingResponse> => {
  const response = await axiosInstance.put(
    "/admin/pricing",
    payload
  );

  return response.data;
};