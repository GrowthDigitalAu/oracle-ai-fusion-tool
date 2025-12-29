import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Pencil } from 'lucide-react';

const OrganizationUserRoles = () => {
    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    
    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchData();
        fetchDropdowns();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch('http://localhost:5000/api/organization-user-roles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAssignments(data.data);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const usersRes = await fetch('http://localhost:5000/api/users', { headers });
            const usersData = await usersRes.json();
            if (usersRes.ok) setUsers(usersData);

            const rolesRes = await fetch('http://localhost:5000/api/roles', { headers });
            const rolesData = await rolesRes.json();
            if (rolesRes.ok) setRoles(rolesData);

        } catch (error) {
            console.error('Error fetching dropdowns:', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedUser || !selectedRole) return;

        try {
            const token = localStorage.getItem('orgToken');
            const url = isEditMode
                ? `http://localhost:5000/api/organization-user-roles/${currentId}`
                : 'http://localhost:5000/api/organization-user-roles';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    organization_user_id: selectedUser,
                    role_id: selectedRole
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                fetchData();
                closeModal();
            } else {
                setError(data.error || 'Failed to assign role');
            }
        } catch (error) {
            console.error('Error saving role:', error);
            setError('An error occurred');
        }
    };

    const handleEdit = (assignment) => {
        setSelectedUser(assignment.organization_user_id);
        setSelectedRole(assignment.role_id);
        setCurrentId(assignment.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this role from the user?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/organization-user-roles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                fetchData();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to remove role');
            }
        } catch (error) {
            console.error('Error removing role:', error);
        }
    };

    const closeModal = () => {
        setSelectedUser('');
        setSelectedRole('');
        setIsEditMode(false);
        setCurrentId(null);
        setIsModalOpen(false);
        setError('');
    };

    return (
        <div className="page-container">
            <div className="header-actions">
                <h1>User Roles</h1>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    Assign Role to User
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.length > 0 ? (
                        assignments.map((assignment) => (
                            <tr key={assignment.id}>
                                <td>{assignment.OrganizationUser?.full_name}</td>
                                <td>{assignment.OrganizationUser?.email}</td>
                                <td>{assignment.Role?.name}</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => handleEdit(assignment)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(assignment.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="empty-state">No role assignments found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit User Role' : 'Assign Role to User'}</h2>
                            <button className="close-btn" onClick={closeModal}>
                                &times;
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Select User</label>
                                <select
                                    className="form-input"
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select User --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Select Role</label>
                                <select
                                    className="form-input"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Role --</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {isEditMode ? 'Update' : 'Assign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationUserRoles;
