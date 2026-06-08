const AUTH_TOKEN_KEY = "authToken";
const USER_DATA_KEY = "userData";
const AUTH_STATE_EVENT = "auth-state-changed";

const emitAuthStateChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_STATE_EVENT));
  }
};

const normalizeToken = (token: unknown): string | null => {
  if (typeof token !== "string") return null;
  const trimmed = token.trim();

  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return null;
  }

  return trimmed;
};

export const getAuthToken = (): string | null =>
  normalizeToken(localStorage.getItem(AUTH_TOKEN_KEY));

export const isAuthenticated = (): boolean => Boolean(getAuthToken());

export const setAuthSession = (token: unknown, user?: unknown) => {
  const normalizedToken = normalizeToken(token);
  if (!normalizedToken) return false;

  localStorage.setItem(AUTH_TOKEN_KEY, normalizedToken);
  if (user !== undefined && user !== null) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }
  emitAuthStateChange();
  return true;
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem("user-profile");
  emitAuthStateChange();
};

export const authStateEventName = AUTH_STATE_EVENT;
