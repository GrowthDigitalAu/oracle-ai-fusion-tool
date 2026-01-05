import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Organization from './pages/Organization';
import User from './pages/User';
import Roles from './pages/Roles';
import OrganizationUserRoles from './pages/OrganizationUserRoles';
import Permissions from './pages/Permissions';
import RolePermissions from './pages/RolePermissions';
import Projects from './pages/Projects';
import ProjectMembers from './pages/ProjectMembers';
import AdminLogin from './pages/AdminLogin';
import OrganizationLogin from './pages/OrganizationLogin';
import Reports from './pages/Reports';
import ReportRequirements from './pages/ReportRequirements';
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
              <Route path="/user-roles" element={
                <NonAdminRoute>
                  <OrganizationUserRoles />
                </NonAdminRoute>
              } />
               <Route path="/permissions" element={
                <NonAdminRoute>
                  <Permissions />
                </NonAdminRoute>
              } />
              <Route path="/roles/:roleId/permissions" element={
                <NonAdminRoute>
                  <RolePermissions />
                </NonAdminRoute>
              } />
              <Route path="/projects" element={
                <NonAdminRoute>
                  <Projects />
                </NonAdminRoute>
              } />
              <Route path="/projects/:projectId/members" element={
                <NonAdminRoute>
                  <ProjectMembers />
                </NonAdminRoute>
              } />
              <Route path="/projects/:projectId/tasks" element={
                <NonAdminRoute>
                  <Reports />
                </NonAdminRoute>
              } />
              <Route path="/projects/:projectId/tasks/:taskId" element={
                <NonAdminRoute>
                  <ReportRequirements />
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
