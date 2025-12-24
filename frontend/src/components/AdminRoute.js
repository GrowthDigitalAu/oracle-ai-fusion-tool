import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  // 1. Get Token
  const adminToken = localStorage.getItem('adminToken');
  const orgToken = localStorage.getItem('orgToken');
  const token = adminToken || orgToken;

  if (!token) {
    return <Navigate to="/admin-login" />;
  }

  // 2. Decode Token Role
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // 3. Check if Role is Admin
    if (payload.role !== 'Admin') {
      // If user is logged in but NOT an Admin, redirect to Dashboard (or "Not Authorized" page)
      // Since Dashboard is for everyone, this effectively blocks them from the *Admin Only* page
      return <Navigate to="/" replace />;
    }
    
    return children;

  } catch (error) {
    // If token is invalid, force login
    return <Navigate to="/admin-login" />;
  }
};

export default AdminRoute;
