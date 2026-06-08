import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAllDrivers } from "../api/driver-api";
import { updateDriverDocumentStatus } from "../api/document-api";
import { getApiErrorMessage } from "../../lib/apiError";

export type DocumentStatus = "pending" | "approved" | "rejected";

export interface DriverDocument {
  driverId: string;
  driverName: string;
  documentType: string;
  frontImage: string | null;
  backImage: string | null;
  status: DocumentStatus;
  updatedAt: string;
  createdAt: string;
}

interface DocumentState {
  data: DriverDocument[];
  loading: boolean;
  error: string | null;
}

export const fetchAllDocumentsThunk = createAsyncThunk<
  DriverDocument[],
  void,
  { rejectValue: string }
>(
  "documents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAllDrivers();
      const drivers = 
        (Array.isArray(response.drivers) ? response.drivers : null) || 
        (Array.isArray(response.data?.drivers) ? response.data.drivers : null) || 
        (Array.isArray(response.data) ? response.data : null) || 
        (Array.isArray(response) ? response : []);

      const documentsList: DriverDocument[] = [];

      drivers.forEach((driver: any) => {
        const docs = driver.documents;
        if (!docs) return;

        const map = [
          {
            type: "aadhaar",
            front: docs.aadhaarFront,
            back: docs.aadhaarBack,
            status: docs.aadhaarStatus,
          },
          {
            type: "pan",
            front: docs.panFront,
            back: docs.panBack,
            status: docs.panStatus,
          },
          {
            type: "license",
            front: docs.licenseFront,
            back: docs.licenseBack,
            status: docs.licenseStatus,
          },
          {
            type: "rc",
            front: docs.rcFront,
            back: docs.rcBack,
            status: docs.rcStatus,
          },
        ];

        map.forEach((doc) => {
          if (doc.front || doc.back) {
            documentsList.push({
              driverId: driver._id,
              driverName: driver.name,
              documentType: doc.type,
              frontImage: doc.front || null,
              backImage: doc.back || null,
              status: doc.status as DocumentStatus,
              updatedAt: driver.updatedAt,
              createdAt: driver.createdAt,
            });
          }
        });
      });

      return documentsList;
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Fetch Driver Documents"));
    }
  },
);

export const updateDocumentStatusThunk = createAsyncThunk<
  {
    driverId: string;
    documentType: string;
    status: DocumentStatus;
    remarks?: string;
  },
  {
    driverId: string;
    documentType: string;
    status: DocumentStatus;
    remarks?: string;
  },
  { rejectValue: string }
>(
  "documents/updateStatus",
  async ({ driverId, documentType, status, remarks }, { rejectWithValue }) => {
    try {
      await updateDriverDocumentStatus({
        driverId,
        documentType,
        status,
        remarks,
      });

      return { driverId, documentType, status, remarks };
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, "Update Document Status"));
    }
  },
);

const initialState: DocumentState = {
  data: [],
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDocumentsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllDocumentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllDocumentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown API error";
      })
      .addCase(updateDocumentStatusThunk.fulfilled, (state, action) => {
        state.data = state.data.map((doc) =>
          doc.driverId === action.payload.driverId &&
          doc.documentType === action.payload.documentType
            ? {
                ...doc,
                status: action.payload.status,
                remarks: action.payload.remarks || "",
              }
            : doc,
        );
      })
      .addCase(updateDocumentStatusThunk.rejected, (state, action) => {
        state.error = action.payload ?? "Unknown API error";
      });
  },
});

export default documentSlice.reducer;
