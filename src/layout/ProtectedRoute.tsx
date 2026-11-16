import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthState } from "../hooks/useAuthState";

type Props = { children: ReactNode };

const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();
  const isLoggedIn = useAuthState();

  if (!isLoggedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
