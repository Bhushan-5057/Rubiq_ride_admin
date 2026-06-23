export interface VehiclePricing {
  baseFarePerKm: number;
  platformFeePerKm: number;
  driverSharePerKm: number;
}

export interface Pricing {
  _id: string;
  bike: VehiclePricing;
  auto: VehiclePricing;
  cab: VehiclePricing;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PricingResponse {
  success: boolean;
  message: string;
  data: Pricing;
}

export interface UpdatePricingPayload {
  bike?: {
    baseFarePerKm: number;
  };

  auto?: {
    baseFarePerKm: number;
  };

  cab?: {
    baseFarePerKm: number;
  };
} 

export interface EditPricingForm {
  bike: {
    baseFarePerKm: string;
  };

  auto: {
    baseFarePerKm: string;
  };

  cab: {
    baseFarePerKm: string;
  };
};