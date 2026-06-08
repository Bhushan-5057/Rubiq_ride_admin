import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./layout/ProtectedRoute";
import NotFound from "./pages/OtherPage/NotFound";
import Home from "./pages/Dashboard/Home";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import SignInForm from "./components/auth/SignInForm";
import SignUpForm from "./components/auth/SignUpForm";
import DriverTable from "./pages/Tables/DriverTables";
import { useEffect } from "react";
import { setFavicon } from "./lib/utils";
import PassengerTable from "./pages/Tables/PassengerTables";
import UserProfiles from "./pages/UserProfiles";
import DriverDetails from "./components/tables/Drivers/Details/DriverDetails";
import RideTable from "./pages/Tables/RideTables";
import DocumentTable from "./pages/Tables/documents/Document";
import DocumentApprovePage from "./components/tables/Drivers/Details/documents/DocumentApprovePage/DocumentApprovePage";
import AdminTable from "./pages/Tables/admin/AdminTable";
import PassengerDetails from "./components/tables/Passengers/Details/PassengerDetails";
import RideDetailsPage from "./components/tables/Rides/Details/RideDetails";

import GlobalFeedbackListener from "./components/common/GlobalFeedbackListener";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    setFavicon("R");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalFeedbackListener />
      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Home />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DriverTable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/drivers/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DriverDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DocumentTable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents/:driverId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DocumentApprovePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/passengers"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PassengerTable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/passengers/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PassengerDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/passenger"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PassengerTable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rides"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RideTable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rides/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RideDetailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/ride" element={<Navigate to="/rides" replace />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <UserProfiles />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AdminTable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/auth" element={<SignInForm />} />
          <Route path="/auth/register" element={<SignUpForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
