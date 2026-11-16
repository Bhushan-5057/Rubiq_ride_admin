import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ToastProvider } from "./components/ui/toast/ToastContext.tsx";
import CustomToast from "./components/ui/toast/CustomToast.tsx";
import { store } from "./store/redux/store.ts";
import { setAxiosFeedbackDispatcher } from "./store/api/axiosInstance.ts";
import {
  setErrorMessage,
  setSuccessMessage,
} from "./store/redux/feedback-slice.ts";

setAxiosFeedbackDispatcher({
  success: (message) => store.dispatch(setSuccessMessage(message)),
  error: (message) => store.dispatch(setErrorMessage(message)),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AppWrapper>
        <ToastProvider>
          <CustomToast />
          <App />
        </ToastProvider>
      </AppWrapper>
    </Provider>
  </StrictMode>
);
