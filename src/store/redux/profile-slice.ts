import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  AdminProfile,
  changeAdminPasswordApi,
  fetchAdminProfileApi,
  updateAdminProfileApi,
} from "../api/profile-api";

interface ProfileState {
  data: AdminProfile | null;
  fetchLoading: boolean;
  updateLoading: boolean;
  passwordLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const readStoredProfile = (): AdminProfile | null => {
  const raw = localStorage.getItem("user-profile");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminProfile;
  } catch {
    return null;
  }
};

const persistProfile = (profile: AdminProfile | null) => {
  if (!profile) return;

  localStorage.setItem("user-profile", JSON.stringify(profile));
  localStorage.setItem("userData", JSON.stringify(profile));
};

const getErrorMessage = (
  error: any,
  fallbackMessage = "Something went wrong"
): string => {
  const response = error?.response?.data;

  // Validation errors array
  if (Array.isArray(response?.message)) {
    return response.message
      .map((err: any) => err?.msg || err?.message)
      .filter(Boolean)
      .join(", ");
  }

  // String message
  if (typeof response?.message === "string") {
    return response.message;
  }

  // errors array
  if (Array.isArray(response?.errors)) {
    return response.errors
      .map((err: any) => err?.msg || err?.message)
      .filter(Boolean)
      .join(", ");
  }

  // error field
  if (response?.error) {
    return response.error;
  }

  return error?.message || fallbackMessage;
};

const initialState: ProfileState = {
  data: readStoredProfile(),
  fetchLoading: false,
  updateLoading: false,
  passwordLoading: false,
  error: null,
  successMessage: null,
};

export const fetchAdminProfileThunk = createAsyncThunk<
  { user: AdminProfile; message: string },
  void,
  { rejectValue: string }
>("profile/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchAdminProfileApi();

    const user = response.user || {};

    persistProfile(user);

    return {
      user,
      message: response.message || "Profile fetched successfully",
    };
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to fetch admin profile")
    );
  }
});

export const updateAdminProfileThunk = createAsyncThunk<
  { user: AdminProfile; message: string },
  { name: string },
  { rejectValue: string }
>("profile/update", async (payload, { rejectWithValue }) => {
  try {
    const response = await updateAdminProfileApi(payload);

    const user = response.user || payload;

    persistProfile(user as AdminProfile);

    return {
      user: user as AdminProfile,
      message: response.message || "Profile updated successfully",
    };
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to update admin profile")
    );
  }
});

export const changeAdminPasswordThunk = createAsyncThunk<
  { message: string },
  {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
  { rejectValue: string }
>("profile/changePassword", async (payload, { rejectWithValue }) => {
  try {
    const response = await changeAdminPasswordApi(payload);

    return {
      message: response.message || "Password changed successfully",
    };
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to change password")
    );
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,

  reducers: {
    clearProfileMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },

    setProfileFromStorage: (state) => {
      state.data = readStoredProfile();
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch Profile
      .addCase(fetchAdminProfileThunk.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(fetchAdminProfileThunk.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.data = action.payload.user;
        state.successMessage = action.payload.message;
      })

      .addCase(fetchAdminProfileThunk.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload || "Unable to fetch profile";
      })

      // Update Profile
      .addCase(updateAdminProfileThunk.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateAdminProfileThunk.fulfilled, (state, action) => {
        state.updateLoading = false;

        state.data = {
          ...state.data,
          ...action.payload.user,
        };

        state.successMessage = action.payload.message;
      })

      .addCase(updateAdminProfileThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || "Unable to update profile";
      })

      // Change Password
      .addCase(changeAdminPasswordThunk.pending, (state) => {
        state.passwordLoading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(changeAdminPasswordThunk.fulfilled, (state, action) => {
        state.passwordLoading = false;
        state.successMessage = action.payload.message;
      })

      .addCase(changeAdminPasswordThunk.rejected, (state, action) => {
        state.passwordLoading = false;
        state.error = action.payload || "Unable to change password";
      });
  },
});

export const { clearProfileMessages, setProfileFromStorage } =
  profileSlice.actions;

export default profileSlice.reducer;