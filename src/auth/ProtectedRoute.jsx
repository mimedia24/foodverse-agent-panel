import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/authContext";

function ProtectedRoute({ children }) {
  const { isLoading, isLoggedIn } = useAuth();

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

  return children ? children : <Outlet />;
}

export default ProtectedRoute;