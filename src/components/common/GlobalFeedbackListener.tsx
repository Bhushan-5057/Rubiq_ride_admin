import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/redux/store";
import { clearFeedback } from "../../store/redux/feedback-slice";
import { useToast } from "../ui/toast/ToastContext";

const GlobalFeedbackListener: React.FC = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { successMessage, errorMessage } = useSelector(
    (state: RootState) => state.feedback
  );

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
      // Clear feedback in Redux after showing toast to avoid re-triggering
      dispatch(clearFeedback());
    }
  }, [successMessage, showToast, dispatch]);

  useEffect(() => {
    if (errorMessage) {
      showToast(errorMessage, "error");
      // Clear feedback in Redux after showing toast to avoid re-triggering
      dispatch(clearFeedback());
    }
  }, [errorMessage, showToast, dispatch]);

  return null; // This component doesn't render any UI
};

export default GlobalFeedbackListener;
