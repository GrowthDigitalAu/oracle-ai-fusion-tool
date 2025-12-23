import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const adminToken = localStorage.getItem('adminToken');
      const orgToken = localStorage.getItem('orgToken');
      const token = adminToken || orgToken;

      if (!token) {
        navigate('/admin-login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
           localStorage.removeItem('adminToken');
           localStorage.removeItem('adminUser');
           localStorage.removeItem('orgToken');
           localStorage.removeItem('orgUser');
           navigate('/admin-login');
        }
      } catch (error) {
        console.error("Auth verification failed", error);
        navigate('/admin-login');
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default Layout;
