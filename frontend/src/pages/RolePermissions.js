import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus, Pencil } from 'lucide-react';

const RolePermissions = () => {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState([]); // Assigned permissions
    const [availablePermissions, setAvailablePermissions] = useState([]); // All permissions
    const [loading, setLoading] = useState(true);
    const [selectedPermission, setSelectedPermission] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [roleId]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch assigned permissions
            const assignedRes = await fetch(`http://localhost:5000/api/role-permissions/${roleId}`, { headers });
            const assignedData = await assignedRes.json();

            // Fetch all permissions (to populate dropdown)
            const allPermsRes = await fetch('http://localhost:5000/api/permissions', { headers });
            const allPermsData = await allPermsRes.json();

            if (assignedRes.ok && assignedData.success) {
                setPermissions(assignedData.data);
            }
            if (allPermsRes.ok && allPermsData.success) {
                setAvailablePermissions(allPermsData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePermission = async (e) => {
        e.preventDefault();
        if (!selectedPermission) return;
        setError('');
        
        try {
            const token = localStorage.getItem('orgToken');
            const url = isEditMode 
                ? `http://localhost:5000/api/role-permissions/${currentId}`
                : 'http://localhost:5000/api/role-permissions';
            
            const method = isEditMode ? 'PUT' : 'POST';
            
            // Payload depends on method, but for simplicity we send what's needed
            // POST needs role_id, permission_id
            // PUT needs permission_id
            const payload = {
                permission_id: selectedPermission
            };
            if (!isEditMode) {
                payload.role_id = roleId;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok && data.success) {
                fetchData(); // Refresh list
                closeModal();
            } else {
                setError(data.error || 'Failed to save permission');
            }
        } catch (error) {
            console.error('Error saving permission:', error);
            setError('An error occurred');
        }
    };

    const handleEdit = (rp) => {
        setSelectedPermission(rp.permission_id);
        setCurrentId(rp.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this permission from the role?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/role-permissions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchData();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to remove permission');
            }
        } catch (error) {
            console.error('Error removing permission:', error);
        }
    };

    const closeModal = () => {
        setSelectedPermission('');
        setIsEditMode(false);
        setCurrentId(null);
        setIsModalOpen(false);
        setError('');
    };

    // Filter available permissions
    // In Add mode: Exclude assigned ones
    // In Edit mode: proper dropdown list (include the one being edited, obviously)
    // Actually simpler: Just show all options, if user selects one that exists, backend unique constraint will catch it.
    // Or we keep filtering but ensure current one is valid.
    
    return (
        <div className="page-container">
            <div className="header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="btn-secondary" onClick={() => navigate('/roles')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', height: '36px', width: '36px' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ margin: 0 }}>Manage Role Permissions</h1>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    Assign Permission
                </button>
            </div>

            {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

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
                        permissions.map((rp) => (
                            <tr key={rp.id}>
                                <td>{rp.Permission?.code}</td>
                                <td>{rp.Permission?.description}</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => handleEdit(rp)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(rp.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="empty-state">No permissions assigned to this role</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit Permission Assignment' : 'Assign Permission'}</h2>
                            <button className="close-btn" onClick={closeModal}>
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSavePermission}>
                            <div className="form-group">
                                <label>Select Permission</label>
                                <select 
                                    className="form-input" 
                                    value={selectedPermission} 
                                    onChange={(e) => setSelectedPermission(e.target.value)}
                                    required
                                >
                                    <option value="">Select Permission</option>
                                    {availablePermissions.map(perm => (
                                        <option key={perm.id} value={perm.id}>
                                            {perm.code} - {perm.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={!selectedPermission}>
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

export default RolePermissions;
