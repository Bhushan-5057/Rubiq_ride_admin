import { useSyncExternalStore } from "react";
import { authStateEventName, isAuthenticated } from "../lib/auth";

const subscribe = (onStoreChange: () => void) => {
  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(authStateEventName, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(authStateEventName, handleChange);
  };
};

const getSnapshot = () => isAuthenticated();

export const useAuthState = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);
