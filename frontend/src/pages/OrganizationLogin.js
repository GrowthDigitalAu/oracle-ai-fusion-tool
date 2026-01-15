import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const OrganizationLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('orgToken', data.data.token);
        localStorage.setItem('orgUser', JSON.stringify(data.data.user)); // Store distinct org user
        navigate('/'); // Redirect to dashboard
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">User Login</h2>
        <p className="login-subtitle">Organization Member Access</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          


          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-button" style={{ background: 'linear-gradient(to right, #00b09b, #96c93d)' }}>
            Login as User
          </button>
        </form>
        
        <div className="login-footer">
          <p>Login as Admin? <Link to="/admin-login" className="login-link">Click here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationLogin;
