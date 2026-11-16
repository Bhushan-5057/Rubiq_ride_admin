import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FeedbackState {
  successMessage: string | null;
  errorMessage: string | null;
}

const initialState: FeedbackState = {
  successMessage: null,
  errorMessage: null,
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    setSuccessMessage: (state, action: PayloadAction<string | null>) => {
      state.successMessage = action.payload;
    },
    setErrorMessage: (state, action: PayloadAction<string | null>) => {
      state.errorMessage = action.payload;
    },
    clearFeedback: (state) => {
      state.successMessage = null;
      state.errorMessage = null;
    },
  },
});

export const { setSuccessMessage, setErrorMessage, clearFeedback } =
  feedbackSlice.actions;

export default feedbackSlice.reducer;
