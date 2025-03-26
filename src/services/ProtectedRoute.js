import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ isLoggedIn, userType, requiredUserType, element }) {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const isAuthorized = Array.isArray(requiredUserType)
    ? requiredUserType.includes(userType)
    : userType === requiredUserType;

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return element;
}

export default ProtectedRoute;
