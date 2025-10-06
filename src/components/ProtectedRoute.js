import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;

  if (role && role !== userRole) {
    return <Navigate to={userRole === "ADMIN" ? "/admin/dashboard" : "/user/dashboard"} replace />;
  }

  return children;
}
