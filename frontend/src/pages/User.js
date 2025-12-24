import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const User = () => {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]); // For selecting org
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    job_title: '',
    organization_id: '',
    is_active: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    checkPermission();
    fetchUsers();
    fetchOrganizations();
  }, []);

  const [canDelete, setCanDelete] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserOrgId, setCurrentUserOrgId] = useState('');

  const checkPermission = () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const orgToken = localStorage.getItem('orgToken');
      const token = adminToken || orgToken;

      if (!token) return;

      const payload = JSON.parse(atob(token.split('.')[1]));
      
      setCurrentUserRole(payload.role);
      setCurrentUserOrgId(payload.organization_id);

      // Allow if Admin OR if Org User with is_org_admin = true
      if (payload.role === 'Admin' || payload.is_org_admin === true) {
        setCanDelete(true);
      }
    } catch (error) {
      console.error('Error checking permission:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Get appropriate token
      const adminToken = localStorage.getItem('adminToken');
      const orgToken = localStorage.getItem('orgToken');
      const token = adminToken || orgToken;

      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (error) setError('');
  };

  /* Logic Block */
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const handleEdit = (user) => {
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      job_title: user.job_title || '',
      organization_id: user.organization_id || '',
      is_active: user.is_active
    });
    setCurrentId(user.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      // Get appropriate token
      const adminToken = localStorage.getItem('adminToken');
      const orgToken = localStorage.getItem('orgToken');
      const token = adminToken || orgToken;

      await fetch(`http://localhost:5000/api/users/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const openAddModal = () => {
    setFormData({
      email: '',
      full_name: '',
      job_title: '',
      organization_id: currentUserRole === 'Admin' ? '' : currentUserOrgId,
      is_active: true
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
        ? `http://localhost:5000/api/users/${currentId}`
        : 'http://localhost:5000/api/users';
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
        fetchUsers();
      } else {
        setError(data.error || 'Failed to save user');
      }
    } catch (error) {
       setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <div className="header-actions">
        <h1>Users</h1>
        <button className="btn-primary" onClick={openAddModal}>
          Add User
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Organization</th>
            <th>Job Title</th>
            <th>Organization Admin</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.Organization ? user.Organization.name : 'N/A'}</td>
                <td>{user.job_title}</td>
                <td>{user.is_org_admin ? 'Yes' : 'No'}</td>
                <td>{user.is_active ? 'Yes' : 'No'}</td>
                <td>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(user)}>
                    <Pencil size={18} />
                  </button>
                  {canDelete && (
                    <button className="action-btn delete-btn" onClick={() => handleDelete(user.id)}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit User' : 'Add User'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  className="form-input"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  name="job_title"
                  className="form-input"
                  value={formData.job_title}
                  onChange={handleInputChange}
                />
              </div>
              {currentUserRole === 'Admin' && (
                <div className="form-group">
                  <label>Organization</label>
                  <select
                    name="organization_id"
                    className="form-input"
                    value={formData.organization_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org.organization_id} value={org.organization_id}>
                        {org.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                 <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
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

export default User;
