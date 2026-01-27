import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../Context/AuthContext";

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 1. Wait for Auth check to finish
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 2. Check if User exists AND has 'admin' role
  if (user && user.role === 'admin') {
    return children;
  }

  // 3. Otherwise, redirect to Home Page
  // We use 'replace' so they can't go back to the protected route using the back button
  return <Navigate to="/" state={{ from: location }} replace />;
};

export default AdminProtectedRoute;