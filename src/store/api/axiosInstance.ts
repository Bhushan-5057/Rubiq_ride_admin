import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { clearAuthSession, getAuthToken } from "../../lib/auth";
import { logApiError } from "../../lib/apiError";

const base_url = import.meta.env.VITE_BASE_URL;

let feedbackDispatcher:
  | {
      success: (message: string) => void;
      error: (message: string) => void;
    }
  | undefined;

export const setAxiosFeedbackDispatcher = (dispatcher: {
  success: (message: string) => void;
  error: (message: string) => void;
}) => {
  feedbackDispatcher = dispatcher;
};

const axiosInstance = axios.create({
  baseURL: base_url,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp < now) {
          // Token expired: clear auth state and allow route guards to redirect.
          clearAuthSession();
          return Promise.reject(new Error("Token expired"));
        }

        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.warn(
          "Token is not a valid JWT, skipping expiration check. Attaching token anyway."
        );
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Success handling: Dispatch message if present in response data
    const message = response.data?.message;
    if (message && typeof message === "string") {
      feedbackDispatcher?.success(message);
    }
    return response;
  },
  (error) => {
    logApiError(error, "Axios Response Interceptor");
    const isLoginRequest = error.config?.url?.includes("/admin/auth/login");

    // Clear auth state on unauthorized API responses (except login endpoint).
    if (error.response?.status === 401 && !isLoginRequest) {
      clearAuthSession();
    }

    // Error handling: Extract message and dispatch to Redux
    const responseData = error.response?.data;
    let uiMessage = "";

    if (responseData) {
      // 1. Prioritize detailed validation error arrays if they exist
      const validationErrors = responseData.errors || responseData.validationErrors || responseData.error;
      if (Array.isArray(validationErrors)) {
        uiMessage = validationErrors
          .map((err: any) => err.msg || err.message || (typeof err === "string" ? err : ""))
          .filter(Boolean)
          .join(", ");
      }

      // 2. If no array-based errors, look for string messages
      if (!uiMessage) {
        if (typeof responseData.message === "string" && responseData.message.toLowerCase() !== "validation failed") {
          uiMessage = responseData.message;
        } else if (Array.isArray(responseData.message)) {
          uiMessage = responseData.message.join(", ");
        } else if (typeof responseData.error === "string") {
          uiMessage = responseData.error;
        } else if (typeof responseData.message === "string") {
          // Fallback to "Validation failed" if nothing else was found
          uiMessage = responseData.message;
        }
      }
    }

    if (!uiMessage) {
      if (error.message && error.message.toLowerCase().includes("network")) {
        uiMessage = "Network error. Please check your connection.";
      } else {
        uiMessage = "Something went wrong. Please try again.";
      }
    }

    feedbackDispatcher?.error(uiMessage);

    return Promise.reject(error);
  }
);

export default axiosInstance;
