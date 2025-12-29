import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_default: false
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      // Get appropriate token
      const adminToken = localStorage.getItem('adminToken');
      const orgToken = localStorage.getItem('orgToken');
      const token = adminToken || orgToken;

      const response = await fetch('http://localhost:5000/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };



  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (error) setError('');
  };

  /* Logic Block */
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const handleEdit = (role) => {
    setFormData({
      name: role.name,
      description: role.description || '',
      is_default: role.is_default
    });
    setCurrentId(role.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      // Get appropriate token
      const adminToken = localStorage.getItem('adminToken');
      const orgToken = localStorage.getItem('orgToken');
      const token = adminToken || orgToken;

      await fetch(`http://localhost:5000/api/roles/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      is_default: false
    });
    setIsEditMode(false);
    setCurrentId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = isEditMode 
        ? `http://localhost:5000/api/roles/${currentId}`
        : 'http://localhost:5000/api/roles';
      const method = isEditMode ? 'PUT' : 'POST';

      // Get appropriate token
      const adminToken = localStorage.getItem('adminToken');
      const orgToken = localStorage.getItem('orgToken');
      const token = adminToken || orgToken;

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsModalOpen(false);
        fetchRoles();
      } else {
        setError(data.error || 'Failed to save role');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <div className="header-actions">
        <h1>Roles</h1>
        <button className="btn-primary" onClick={openAddModal}>
          Add Role
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Description</th>
            <th>Organization</th>
            <th>Default</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.length > 0 ? (
            roles.map((role, index) => (
              <tr key={role.id}>
                <td>{index + 1}</td>
                <td>
                    <Link to={`/roles/${role.id}/permissions`} style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '500' }}>
                        {role.name}
                    </Link>
                </td>
                <td>{role.description}</td>
                <td>{role.Organization ? role.Organization.name : 'N/A'}</td>
                <td>{role.is_default ? 'Yes' : 'No'}</td>
                <td>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(role)}>
                    <Pencil size={18} />
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(role.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No roles found</td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Role' : 'Add Role'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Role Name</label>
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
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

               <div className="form-group">
                 <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleInputChange}
                    />
                    Is Default Role
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

export default Roles;
