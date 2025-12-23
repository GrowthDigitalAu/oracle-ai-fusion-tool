import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Organization from './pages/Organization';
import User from './pages/User';
import Roles from './pages/Roles';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/organization" element={<Organization />} />
          <Route path="/user" element={<User />} />
          <Route path="/roles" element={<Roles />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
