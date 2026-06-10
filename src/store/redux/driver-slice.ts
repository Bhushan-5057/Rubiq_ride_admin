import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Driver,
  DriverAccountStatus,
  fetchAllDrivers,
  fetchDriverById,
  updateDriverStatus,
} from "../api/driver-api";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  defaultPagination,
  GetAllPagination,
  GetAllQuery,
  normalizeGetAllResponse,
} from "../api/getAllAdapter";

interface DriverState {
  data: Driver[];
  selectedDriver?: Driver;
  loading: boolean;
  error: string | null;
  message: string | null;
  pagination: GetAllPagination;
}

const initialState: DriverState = {
  data: [],
  selectedDriver: undefined,
  loading: false,
  error: null,
  message: null,
  pagination: defaultPagination,
};

// Thunks
export const fetchAllDriversThunk = createAsyncThunk(
  "driver/fetchAll",
  async (query: GetAllQuery | undefined, { rejectWithValue }) => {
    try {
      const response = await fetchAllDrivers(query);
      return normalizeGetAllResponse<Driver>("drivers", response);
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Fetch All Drivers"));
    }
  }
);

export const fetchDriverByIdThunk = createAsyncThunk(
  "driver/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetchDriverById(id);
      // Handle response.driver, response.data, or direct object
      return response.driver || response.data || response;
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Fetch Driver By ID"));
    }
  }
);
export const updateDriverStatusThunk = createAsyncThunk(
  "driver/updateStatus",
  async (
    { id, status }: { id: string; status: DriverAccountStatus },
    { rejectWithValue }
  ) => {
    try {
      const res = await updateDriverStatus(id, status);
      return {
        id,
        status: (res.driver?.status || res.status || status).toLowerCase(),
        message: res.message,
      };
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Update Driver Status"));
    }
  }
);

// Slice
const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchAllDriversThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDriversThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = (action.payload.rows || []).map((d: any) => ({
          ...d,
          id: d._id || d.id,
          status: (d.status || "pending").toLowerCase(),
          documents: d.documents ?? {},
        }));
        state.pagination = action.payload.pagination || defaultPagination;
      })

      .addCase(fetchAllDriversThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // fetch by ID
      .addCase(fetchDriverByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDriver = action.payload ? {
          ...action.payload,
          id: action.payload._id || action.payload.id,
          status: (action.payload.status || "pending").toLowerCase(),
          documents: action.payload.documents ?? {}
        } : undefined;
      })
      .addCase(fetchDriverByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // update status
      .addCase(updateDriverStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { id, status, message } = action.payload;
        const driver = state.data.find((d) => d._id === id || d.id === id);
        if (driver) {
          driver.status = status;
        }

        // Sync selected driver if open
        if (state.selectedDriver && (state.selectedDriver._id === id || state.selectedDriver.id === id)) {
          state.selectedDriver.status = status;
        }
        state.message = message || "Driver status updated successfully";
      })
      .addCase(updateDriverStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default driverSlice.reducer;
