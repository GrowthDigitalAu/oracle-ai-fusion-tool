import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const OrganizationLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationCode, setOrganizationCode] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch Organizations on Mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/organizations');
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
        } else {
          console.error("Failed to fetch organizations");
        }
      } catch (err) {
        console.error("Error fetching organizations:", err);
      }
    };
    fetchOrganizations();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!organizationCode) {
      setError('Please select an Organization Code.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          organization_code: organizationCode 
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
          
          {/* Organization Code Dropdown */}
          <div className="form-group">
            <label className="form-label">Organization Code</label>
            <select
              className="form-select" // Use customized select
              value={organizationCode}
              onChange={(e) => setOrganizationCode(e.target.value)}
              required
            >
              <option value="">-- Select Code --</option>
              {organizations.map((org) => (
                <option key={org.organization_id} value={org.code}>
                  {org.code} ({org.name})
                </option>
              ))}
            </select>
          </div>

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
