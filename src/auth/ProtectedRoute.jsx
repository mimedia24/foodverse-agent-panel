import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/authContext";

function ProtectedRoute({ children }) {
  const { isLoading, isLoggedIn, policyAccepted } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold">Loading...</h1>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!policyAccepted && location.pathname !== "/privacy-policy") {
    return <Navigate to="/privacy-policy" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
