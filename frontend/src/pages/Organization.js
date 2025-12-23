import React, { useState, useEffect } from 'react';

const Organization = () => {
  const [organizations, setOrganizations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    plan_type: 'Basic',
    tenant_id: '',
    is_active: true
  });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/organizations');
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const response = await fetch('http://localhost:5000/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsModalOpen(false);
        setFormData({ name: '', code: '', plan_type: 'Basic', tenant_id: '', is_active: true });
        fetchOrganizations(); // Refresh table
      } else {
        setError(data.error || 'Failed to create organization');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      // console.error('Error creating organization:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="header-actions">
        <h1>Organizations</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          Add Organization
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Code</th>
            <th>Plan Type</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {organizations.length > 0 ? (
            organizations.map((org) => (
              <tr key={org.organization_id}>
                <td>{org.organization_id}</td>
                <td>{org.name}</td>
                <td>{org.code}</td>
                <td>{org.plan_type}</td>
                <td>{org.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No organizations found</td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Organization</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input
                  type="text"
                  name="code"
                  className="form-input"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Plan Type</label>
                <select
                  name="plan_type"
                  className="form-input"
                  value={formData.plan_type}
                  onChange={handleInputChange}
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tenant ID (Optional)</label>
                <input
                  type="number"
                  name="tenant_id"
                  className="form-input"
                  value={formData.tenant_id}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                 <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Is Active
                 </label>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organization;
