import React from 'react';
import { Navigate } from 'react-router-dom';

const NonAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const orgToken = localStorage.getItem('orgToken');
  const token = adminToken || orgToken;

  if (!token) {
    // If no token, maybe redirect to login? Or let it be?
    // Assuming if no token, they aren't logged in, so maybe redirect to appropriate login.
    // For this specific 'Hide from Admin' requirement:
    return <Navigate to="/admin-login" />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // If Admin, REDIRECT to Dashboard
    if (payload.role === 'Admin') {
      return <Navigate to="/" />;
    }

    // If NOT Admin (e.g. User), ALLOW
    return children;
  } catch (e) {
    return <Navigate to="/admin-login" />;
  }
};

export default NonAdminRoute;
