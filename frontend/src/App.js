import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Organization from './pages/Organization';
import User from './pages/User';
import Roles from './pages/Roles';
import AdminLogin from './pages/AdminLogin';
import OrganizationLogin from './pages/OrganizationLogin';
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
              <Route path="/organization" element={<Organization />} />
              <Route path="/user" element={<User />} />
              <Route path="/roles" element={<Roles />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
