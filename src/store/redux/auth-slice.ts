import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { registerAdmin, login, type LoginPayload } from "../api/auth-api";
import { clearAuthSession, getAuthToken, setAuthSession } from "../../lib/auth";
import { parseApiError } from "../../lib/apiError";

interface AuthUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface ValidationErrorField {
  field: string;
  message: string;
}

interface AuthState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  validationErrors: ValidationErrorField[];
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const readStoredUser = (): AuthUser | null => {
  const rawUser = localStorage.getItem("userData");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  loading: false,
  error: null,
  successMessage: null,
  validationErrors: [],
  token: getAuthToken(),
  user: readStoredUser(),
  isAuthenticated: Boolean(getAuthToken()),
};

export const registerThunk = createAsyncThunk<
  {
    token: string | null;
    user: AuthUser | null;
    message: string;
    isAuthenticated: boolean;
  },
  { name: string; email: string; password: string; role?: string },
  { rejectValue: { message: string; validationErrors: ValidationErrorField[] } }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const response = await registerAdmin(payload);
    const token =
      response?.token ??
      response?.data?.token ??
      response?.accessToken ??
      response?.data?.accessToken ??
      null;
    const user =
      response?.user ?? response?.data?.user ?? response?.data?.admin ?? null;
    const message =
      response?.message ??
      response?.data?.message ??
      "Registration successful";

    const hasSession = setAuthSession(token, user ?? undefined);

    return {
      token: hasSession ? getAuthToken() : null,
      user: (user as AuthUser | null) ?? null,
      message,
      isAuthenticated: hasSession,
    };
  } catch (error: any) {
    const parsed = parseApiError(error);
    const validationErrors: ValidationErrorField[] = parsed.validationErrors.map(
      (err) => ({
        field: err.path || err.location || "unknown",
        message: err.msg || err.message || "Validation error",
      })
    );

    return rejectWithValue({
      message: parsed.message,
      validationErrors,
    });
  }
});

export const loginThunk = createAsyncThunk<
  {
    token: string | null;
    user: AuthUser | null;
    message: string;
    isAuthenticated: boolean;
  },
  LoginPayload,
  { rejectValue: { message: string; validationErrors: ValidationErrorField[] } }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await login(payload);
    const token =
      response?.token ??
      response?.data?.token ??
      response?.accessToken ??
      response?.data?.accessToken ??
      null;
    const user =
      response?.user ?? response?.data?.user ?? response?.data?.admin ?? null;
    const message =
      response?.message ??
      response?.data?.message ??
      "Login successful";

    const hasSession = setAuthSession(token, user ?? undefined);

    return {
      token: hasSession ? getAuthToken() : null,
      user: (user as AuthUser | null) ?? null,
      message,
      isAuthenticated: hasSession,
    };
  } catch (error: any) {
    const parsed = parseApiError(error);
    const validationErrors: ValidationErrorField[] = parsed.validationErrors.map(
      (err) => ({
        field: err.path || err.location || "unknown",
        message: err.msg || err.message || "Validation error",
      })
    );

    return rejectWithValue({
      message: parsed.message,
      validationErrors,
    });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.validationErrors = [];
    },
    syncAuthFromStorage: (state) => {
      state.token = getAuthToken();
      state.user = readStoredUser();
      state.isAuthenticated = Boolean(state.token);
    },
    logoutAuthState: (state) => {
      clearAuthSession();
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.successMessage = null;
      state.validationErrors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Register pending
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.validationErrors = [];
      })
      // Register fulfilled
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message;
        state.validationErrors = [];
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      // Register rejected
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Registration failed";
        state.validationErrors = action.payload?.validationErrors ?? [];
      })
      // Login pending
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.validationErrors = [];
      })
      // Login fulfilled
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message;
        state.validationErrors = [];
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      // Login rejected
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Login failed";
        state.validationErrors = action.payload?.validationErrors ?? [];
      });
  },
});

export const { clearAuthMessages, syncAuthFromStorage, logoutAuthState } =
  authSlice.actions;
export default authSlice.reducer;
