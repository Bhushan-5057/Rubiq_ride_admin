import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteAllRidesApi, deleteRideById, fetchAllRides, fetchRideById, Ride } from "../api/ride-api";
import { getApiErrorMessage } from "../../lib/apiError";

interface RideState {
  data: Ride[];
  selectedRide?: Ride;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: RideState = {
  data: [],
  selectedRide: undefined,
  loading: false,
  error: null,
  message: null,
};

// ✅ Thunks
export const fetchAllRidesThunk = createAsyncThunk(
  "ride/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAllRides();
      return (
        (Array.isArray(response.rides) ? response.rides : null) || 
        (Array.isArray(response.data?.rides) ? response.data.rides : null) || 
        (Array.isArray(response.data) ? response.data : null) || 
        (Array.isArray(response) ? response : [])
      );
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Fetch All Rides"));
    }
  }
);

export const fetchRideByIdThunk = createAsyncThunk(
  "ride/fetchById",
  async (rideId: string, { rejectWithValue }) => {
    try {
      const response = await fetchRideById(rideId);
      return response.ride || response.data || response;
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Fetch Ride By ID"));
    }
  }
);

export const deleteRideThunk = createAsyncThunk(
  "ride/delete",
  async (rideId: string, { rejectWithValue }) => {
    try {
      const response = await deleteRideById(rideId);
      return { rideId, message: response.message };
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Delete Ride"));
    }
  }
);

export const deleteAllRidesThunk = createAsyncThunk(
  "ride/deleteAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await deleteAllRidesApi();
      return response.message;
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Delete All Rides"));
    }
  }
);

// ✅ Slice
const rideSlice = createSlice({
  name: "ride",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch all rides
      .addCase(fetchAllRidesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRidesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = Array.isArray(action.payload) ? action.payload : [];
        state.message = "Rides fetched successfully";
      })
      .addCase(fetchAllRidesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // fetch ride by id
      .addCase(fetchRideByIdThunk.fulfilled, (state, action) => {
        state.selectedRide = action.payload;
      })
      .addCase(fetchRideByIdThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // delete ride
      .addCase(deleteRideThunk.fulfilled, (state, action) => {
        const { rideId, message } = action.payload;
        state.data = state.data.filter((r) => r.rideId !== rideId);
        state.message = message || "Ride deleted successfully";
      })
      .addCase(deleteRideThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // delete all rides
      .addCase(deleteAllRidesThunk.fulfilled, (state, action) => {
        state.data = [];
        state.message = action.payload || "All rides deleted successfully";
      })
      .addCase(deleteAllRidesThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default rideSlice.reducer;
