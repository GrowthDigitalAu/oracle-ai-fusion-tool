import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const Permissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [error, setError] = useState('');
    
    // Form Data
    const [formData, setFormData] = useState({
        code: '',
        description: ''
    });

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch('http://localhost:5000/api/permissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setPermissions(data.data);
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
        } finally {
            setLoading(false);
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
                ? `http://localhost:5000/api/permissions/${currentId}`
                : 'http://localhost:5000/api/permissions';
            const method = isEditMode ? 'PUT' : 'POST';

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
                fetchPermissions();
                resetForm();
            } else {
                setError(data.error || 'Failed to save permission');
            }
        } catch (error) {
            console.error('Submit error:', error);
            setError('An error occurred');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: ''
        });
        setIsEditMode(false);
        setCurrentId(null);
    };

    const handleEdit = (permission) => {
        // Prevent editing global permissions
        if (permission.organization_id === null) {
            alert('Cannot edit System Global Permissions');
            return;
        }

        setFormData({
            code: permission.code,
            description: permission.description
        });
        setCurrentId(permission.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (permission) => {
         // Prevent deleting global permissions
         if (permission.organization_id === null) {
            alert('Cannot delete System Global Permissions');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this permission?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/permissions/${permission.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchPermissions();
            } else {
                alert(data.error || 'Failed to delete permission');
            }
        } catch (error) {
            console.error('Error deleting permission:', error);
        }
    };

    return (
        <div className="page-container">
            <div className="header-actions">
                <h1>Permissions</h1>
                <button className="btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    Add Permission
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Description</th>

                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {permissions.length > 0 ? (
                        permissions.map((perm) => (
                            <tr key={perm.id}>
                                <td>{perm.code}</td>
                                <td>{perm.description}</td>

                                <td>
                                    {perm.organization_id && (
                                        <>
                                            <button className="action-btn edit-btn" onClick={() => handleEdit(perm)}>
                                                <Pencil size={18} />
                                            </button>
                                            <button className="action-btn delete-btn" onClick={() => handleDelete(perm)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="empty-state">No permissions found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit Permission' : 'Add Permission'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Permission Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    className="form-input"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. PROJECT.VIEW"
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
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {isEditMode ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Permissions;
