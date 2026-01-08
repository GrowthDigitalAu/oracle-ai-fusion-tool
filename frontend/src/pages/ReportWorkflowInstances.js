import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

const ReportWorkflowInstances = () => {
    const { projectId, reportId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [instances, setInstances] = useState([]);
    const [currentInstanceId, setCurrentInstanceId] = useState(null);

    const initialFormData = {
        version_number: 1,
        workflow_id: '',
        current_step_order: '',
        status: 'in_progress',
        remark: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    const statusOptions = [
        'in_progress',
        'approved',
        'rejected',
        'cancelled'
    ];

    useEffect(() => {
        fetchInstances();
    }, [reportId]);

    const fetchInstances = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/reports/${reportId}/workflow-instances`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setInstances(data.data);
            } else {
                setInstances([]);
            }
        } catch (error) {
            console.error('Error fetching workflow instances:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const openModal = (instance = null) => {
        if (instance) {
            setCurrentInstanceId(instance.id);
            setFormData({
                version_number: instance.version_number || 1,
                workflow_id: instance.workflow_id || '',
                current_step_order: instance.current_step_order || '',
                status: instance.status || 'in_progress',
                remark: instance.remark || ''
            });
        } else {
            setCurrentInstanceId(null);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('orgToken');
            
            const sanitizedData = Object.keys(formData).reduce((acc, key) => {
                const value = formData[key];
                acc[key] = value === '' ? null : value;
                return acc;
            }, {});

            let url, method;
            if (currentInstanceId) {
                url = `http://localhost:5000/api/workflow-instances/${currentInstanceId}`;
                method = 'PUT';
            } else {
                url = `http://localhost:5000/api/reports/${reportId}/workflow-instances`;
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sanitizedData)
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setIsModalOpen(false);
                fetchInstances();
            } else {
                setError(data.error || 'Failed to save workflow instance');
            }
        } catch (error) {
            console.error('Save error:', error);
            setError('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this workflow instance?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/workflow-instances/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                fetchInstances();
            } else {
                alert(data.error || 'Failed to delete workflow instance');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link to={`/projects/${projectId}/reports/${reportId}`} className="btn-secondary" style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1>Report Workflow Instances</h1>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    Add Workflow Instance
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Version</th>
                        <th>Workflow ID</th>
                        <th>Current Step</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {instances.length > 0 ? (
                        instances.map((instance) => (
                            <tr key={instance.id}>
                                <td>{instance.version_number}</td>
                                <td>{instance.workflow_id}</td>
                                <td>{instance.current_step_order || '-'}</td>
                                <td>
                                    <span className={`status-badge ${
                                        instance.status === 'approved' ? 'active' : 
                                        instance.status === 'rejected' ? 'inactive' : 
                                        instance.status === 'cancelled' ? 'inactive' : 
                                        'pending'
                                    }`}>
                                        {instance.status}
                                    </span>
                                </td>
                                <td>{new Date(instance.created_at).toLocaleString()}</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => openModal(instance)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(instance.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="empty-state">No workflow instances defined</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>{currentInstanceId ? 'Edit Workflow Instance' : 'Add Workflow Instance'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Version Number</label>
                                    <input
                                        type="number"
                                        name="version_number"
                                        className="form-input"
                                        value={formData.version_number}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Workflow ID</label>
                                    <input
                                        type="number"
                                        name="workflow_id"
                                        className="form-input"
                                        value={formData.workflow_id}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Current Step Order</label>
                                    <input
                                        type="number"
                                        name="current_step_order"
                                        className="form-input"
                                        value={formData.current_step_order}
                                        onChange={handleInputChange}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        className="form-input"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>
                                                {status.replace('_', ' ').toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Remark</label>
                                <input
                                    type="text"
                                    name="remark"
                                    className="form-input"
                                    value={formData.remark}
                                    onChange={handleInputChange}
                                    maxLength="500"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
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

export default ReportWorkflowInstances;
