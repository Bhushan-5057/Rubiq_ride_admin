import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllPassengers,
  fetchPassengerById,
  updatePassengerStatus,
  Passenger,
} from "../api/passenger-api";
import { getApiErrorMessage } from "../../lib/apiError";

interface PassengerState {
  data: Passenger[];
  selectedPassenger?: Passenger;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: PassengerState = {
  data: [],
  selectedPassenger: undefined,
  loading: false,
  error: null,
  message: null,
};

// ✅ Thunks
export const fetchAllPassengersThunk = createAsyncThunk(
  "passenger/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAllPassengers();
      return (
        (Array.isArray(response.passengers) ? response.passengers : null) || 
        (Array.isArray(response.data?.passengers) ? response.data.passengers : null) || 
        (Array.isArray(response.data) ? response.data : null) || 
        (Array.isArray(response) ? response : [])
      );
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Fetch All Passengers"));
    }
  }
);

export const fetchPassengerByIdThunk = createAsyncThunk(
  "passenger/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetchPassengerById(id);
      return response.passenger || response.data || response;
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Fetch Passenger By ID"));
    }
  }
);

export const updatePassengerStatusThunk = createAsyncThunk(
  "passenger/updateStatus",
  async (
    { id, status }: { id: string; status: "active" | "suspended" },
    { rejectWithValue }
  ) => {
    try {
      const response = await updatePassengerStatus(id, status);
      return { id, status, message: response.message || "Status updated" };
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Update Passenger Status"));
    }
  }
);

const passengerSlice = createSlice({
  name: "passenger",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchAllPassengersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPassengersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = (action.payload || []).map((p: any) => ({ 
          ...p, 
          id: p._id || p.id,
          status: (p.status || "suspended").toLowerCase()
        }));
        state.message = "Passengers fetched successfully";
      })
      .addCase(fetchAllPassengersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // update status
      .addCase(updatePassengerStatusThunk.fulfilled, (state, action) => {
        const { id, status, message } = action.payload;
        const passenger = state.data.find((p) => p._id === id || p.id === id);
        if (passenger) passenger.status = status;
        state.message = message || "Passenger status updated successfully";
      })
      .addCase(updatePassengerStatusThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchPassengerByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPassengerByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPassenger = action.payload ? {
          ...action.payload,
          id: action.payload._id || action.payload.id,
          status: (action.payload.status || "suspended").toLowerCase()
        } : undefined;
      })
      .addCase(fetchPassengerByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default passengerSlice.reducer;
