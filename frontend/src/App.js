import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Organization from './pages/Organization';
import User from './pages/User';
import Roles from './pages/Roles';
import Projects from './pages/Projects';
import AdminLogin from './pages/AdminLogin';
import OrganizationLogin from './pages/OrganizationLogin';
import AdminRoute from './components/AdminRoute';
import NonAdminRoute from './components/NonAdminRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/organization-login" element={<OrganizationLogin />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/organization" element={
                <AdminRoute>
                  <Organization />
                </AdminRoute>
              } />
              <Route path="/user" element={<User />} />
              <Route path="/roles" element={
                <NonAdminRoute>
                  <Roles />
                </NonAdminRoute>
              } />
              <Route path="/projects" element={
                <NonAdminRoute>
                  <Projects />
                </NonAdminRoute>
              } />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
