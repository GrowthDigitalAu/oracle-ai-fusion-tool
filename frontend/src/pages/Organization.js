import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

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

  /* Logic Block */
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const handleEdit = (org) => {
    setFormData({
      name: org.name,
      code: org.code,
      plan_type: org.plan_type,
      tenant_id: org.tenant_id,
      is_active: org.is_active
    });
    setCurrentId(org.organization_id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;
    try {
      const adminToken = localStorage.getItem('adminToken');
      await fetch(`http://localhost:5000/api/organizations/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', code: '', plan_type: 'Basic', tenant_id: '', is_active: true });
    setIsEditMode(false);
    setCurrentId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = isEditMode 
        ? `http://localhost:5000/api/organizations/${currentId}`
        : 'http://localhost:5000/api/organizations';
      const method = isEditMode ? 'PUT' : 'POST';

      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsModalOpen(false);
        fetchOrganizations();
      } else {
        setError(data.error || 'Failed to save organization');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <div className="header-actions">
        <h1>Organizations</h1>
        <button className="btn-primary" onClick={openAddModal}>
          Add Organization
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Code</th>
            <th>Plan Type</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {organizations.length > 0 ? (
            organizations.map((org, index) => (
              <tr key={org.organization_id}>
                <td>{index + 1}</td>
                <td>{org.name}</td>
                <td>{org.code}</td>
                <td>{org.plan_type}</td>
                <td>{org.is_active ? 'Yes' : 'No'}</td>
                <td>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(org)}>
                    <Pencil size={18} />
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(org.organization_id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No organizations found</td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Organization' : 'Add Organization'}</h2>
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
