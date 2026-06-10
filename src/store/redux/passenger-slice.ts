import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllPassengers,
  fetchPassengerById,
  updatePassengerStatus,
  Passenger,
  PassengerAccountStatus,
} from "../api/passenger-api";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  defaultPagination,
  GetAllPagination,
  GetAllQuery,
  normalizeGetAllResponse,
} from "../api/getAllAdapter";

interface PassengerState {
  data: Passenger[];
  selectedPassenger?: Passenger;
  loading: boolean;
  error: string | null;
  message: string | null;
  pagination: GetAllPagination;
}

const initialState: PassengerState = {
  data: [],
  selectedPassenger: undefined,
  loading: false,
  error: null,
  message: null,
  pagination: defaultPagination,
};

// ✅ Thunks
export const fetchAllPassengersThunk = createAsyncThunk(
  "passenger/fetchAll",
  async (query: GetAllQuery | undefined, { rejectWithValue }) => {
    try {
      const response = await fetchAllPassengers(query);
      return normalizeGetAllResponse<Passenger>("passengers", response);
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
    { id, status }: { id: string; status: PassengerAccountStatus },
    { rejectWithValue }
  ) => {
    try {
      const response = await updatePassengerStatus(id, status);
      return {
        id,
        status: (response.passenger?.status || response.status || status).toLowerCase(),
        message: response.message || "Status updated",
      };
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
        state.data = (action.payload.rows || []).map((p: any) => ({ 
          ...p, 
          id: p._id || p.id,
          status: (p.status || "pending").toLowerCase()
        }));
        state.pagination = action.payload.pagination || defaultPagination;
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
          status: (action.payload.status || "pending").toLowerCase()
        } : undefined;
      })
      .addCase(fetchPassengerByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default passengerSlice.reducer;
