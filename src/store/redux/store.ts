import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import profileReducer from "./profile-slice";
import userReducer from "./user-slice";
import driverReducer from "./driver-slice";
import passengerReducer from "./passenger-slice";
import rideReducer from "./rideSlice";
import documentsReducer from "./document-slice";
import pricingReducer from "./pricing-slice";

import feedbackReducer from "./feedback-slice";

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  user: userReducer,
  driver: driverReducer,
  passenger: passengerReducer,
  ride: rideReducer,
  documents: documentsReducer,
  pricing: pricingReducer,
  feedback: feedbackReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
