import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Trash2, ArrowLeft, Pencil } from 'lucide-react';

const ProjectMembers = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]); // Available org users
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [error, setError] = useState('');
    
    // Form Data
    const [formData, setFormData] = useState({
        organization_user_id: '',
        project_role: '',
        allocation_percent: 100,
        is_project_admin: false
    });

    useEffect(() => {
        fetchMembers();
        fetchUsers();
    }, [projectId]);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/project-members/${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMembers(data.data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('orgToken');
            const url = isEditMode 
                ? `http://localhost:5000/api/project-members/${currentId}`
                : 'http://localhost:5000/api/project-members';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, project_id: projectId }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsModalOpen(false);
                fetchMembers();
                resetForm();
            } else {
                setError(data.error || 'Failed to save member');
            }
        } catch (error) {
            console.error('Submit error:', error);
            setError('An error occurred');
        }
    };

    const resetForm = () => {
        setFormData({
            organization_user_id: '',
            project_role: '',
            allocation_percent: 100,
            is_project_admin: false
        });
        setIsEditMode(false);
        setCurrentId(null);
    };

    const handleEdit = (member) => {
        setFormData({
            organization_user_id: member.organization_user_id,
            project_role: member.project_role || '',
            allocation_percent: member.allocation_percent || 0,
            is_project_admin: member.is_project_admin
        });
        setCurrentId(member.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/project-members/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchMembers();
            } else {
                alert(data.error || 'Failed to remove member');
            }
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    return (
        <div className="page-container">
            <div className="header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button className="btn-secondary" onClick={() => navigate('/projects')} style={{ padding: '8px' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Project Members</h1>
                </div>
                <button className="btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    Add Member
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Project Role</th>
                        <th>Project Admin</th>
                        <th>Allocation %</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {members.length > 0 ? (
                        members.map((member) => (
                            <tr key={member.id}>
                                <td>{member.OrganizationUser?.full_name}</td>
                                <td>{member.OrganizationUser?.email}</td>
                                <td>{member.project_role}</td>
                                <td>
                                    <span className={`status-badge ${member.is_project_admin ? 'active' : 'inactive'}`}>
                                        {member.is_project_admin ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td>{member.allocation_percent}%</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => handleEdit(member)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(member.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="empty-state">No members found for this project</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit Project Member' : 'Add Project Member'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>User</label>
                                <select
                                    name="organization_user_id"
                                    className="form-input"
                                    value={formData.organization_user_id}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isEditMode} // Disable user selection in edit mode
                                >
                                    <option value="">Select User</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Project Role</label>
                                <input
                                    type="text"
                                    name="project_role"
                                    className="form-input"
                                    value={formData.project_role}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Developer, Consultant"
                                />
                            </div>
                            <div className="form-group">
                                <label>Allocation %</label>
                                <input
                                    type="number"
                                    name="allocation_percent"
                                    className="form-input"
                                    value={formData.allocation_percent}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="is_project_admin"
                                        checked={formData.is_project_admin}
                                        onChange={handleInputChange}
                                    />
                                    Is Project Admin?
                                </label>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {isEditMode ? 'Update Member' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectMembers;
