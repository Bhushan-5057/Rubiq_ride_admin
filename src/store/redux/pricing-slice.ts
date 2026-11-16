import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchPricing,
  updatePricing,
} from "../api/pricing-api";
import {
  Pricing,
  UpdatePricingPayload,
} from "../../types/pricing";
import { getApiErrorMessage } from "../../lib/apiError";

interface PricingState {
  data?: Pricing;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: PricingState = {
  data: undefined,
  loading: false,
  error: null,
  message: null,
};

// ================= Fetch Pricing =================

export const fetchPricingThunk = createAsyncThunk(
  "pricing/fetchPricing",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchPricing();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        getApiErrorMessage(error, "Fetch Pricing")
      );
    }
  }
);

// ================= Update Pricing =================

export const updatePricingThunk = createAsyncThunk(
  "pricing/updatePricing",
  async (
    payload: UpdatePricingPayload,
    { rejectWithValue }
  ) => {
    try {
      const response = await updatePricing(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        getApiErrorMessage(error, "Update Pricing")
      );
    }
  }
);

const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // ---------------- Fetch ----------------

      .addCase(fetchPricingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPricingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchPricingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ---------------- Update ----------------

      .addCase(updatePricingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updatePricingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.message =
          action.payload.message ||
          "Pricing updated successfully";
      })

      .addCase(updatePricingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default pricingSlice.reducer;