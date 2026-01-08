import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

const ReportVersions = () => {
    const { projectId, reportId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [versions, setVersions] = useState([]);
    const [currentVersionId, setCurrentVersionId] = useState(null);

    const initialFormData = {
        version_number: '',
        status: 'draft',
        change_summary: '',
        snapshot: '{}'
    };

    const [formData, setFormData] = useState(initialFormData);

    const statusOptions = [
        'draft',
        'in_review',
        'approved',
        'rejected',
        'retired'
    ];

    useEffect(() => {
        fetchVersions();
    }, [reportId]);

    const fetchVersions = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/reports/${reportId}/versions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setVersions(data.data);
            } else {
                setVersions([]);
            }
        } catch (error) {
            console.error('Error fetching versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const openModal = (version = null) => {
        if (version) {
            setCurrentVersionId(version.id);
            setFormData({
                version_number: version.version_number || '',
                status: version.status || 'draft',
                change_summary: version.change_summary || '',
                snapshot: version.snapshot ? JSON.stringify(version.snapshot, null, 2) : '{}'
            });
        } else {
            setCurrentVersionId(null);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
        setError('');
    };

    const formatJSON = () => {
        try {
            const parsed = JSON.parse(formData.snapshot);
            setFormData({
                ...formData,
                snapshot: JSON.stringify(parsed, null, 2)
            });
            setError('');
        } catch (err) {
            setError('Invalid JSON format in snapshot. Cannot format.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            // Validate JSON snapshot
            let parsedSnapshot = null;
            if (formData.snapshot && formData.snapshot.trim() !== '') {
                try {
                    parsedSnapshot = JSON.parse(formData.snapshot);
                } catch (err) {
                    setError('Invalid JSON format in snapshot.');
                    setSaving(false);
                    return;
                }
            }

            const token = localStorage.getItem('orgToken');
            
            const sanitizedData = {
                version_number: formData.version_number,
                status: formData.status,
                change_summary: formData.change_summary || null,
                snapshot: parsedSnapshot
            };

            let url, method;
            if (currentVersionId) {
                url = `http://localhost:5000/api/versions/${currentVersionId}`;
                method = 'PUT';
            } else {
                url = `http://localhost:5000/api/reports/${reportId}/versions`;
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
                fetchVersions();
            } else {
                setError(data.error || 'Failed to save version');
            }
        } catch (error) {
            console.error('Save error:', error);
            setError('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this version?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/versions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                fetchVersions();
            } else {
                alert(data.error || 'Failed to delete version');
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
                    <h1>Report Versions</h1>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    Add Version
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Change Summary</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {versions.length > 0 ? (
                        versions.map((version) => (
                            <tr key={version.id}>
                                <td>{version.version_number}</td>
                                <td>
                                    <span className={`status-badge ${
                                        version.status === 'approved' ? 'active' : 
                                        version.status === 'rejected' || version.status === 'retired' ? 'inactive' : 
                                        'pending'
                                    }`}>
                                        {version.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td>{version.change_summary ? (version.change_summary.length > 60 ? version.change_summary.substring(0, 60) + '...' : version.change_summary) : '-'}</td>
                                <td>{new Date(version.created_at).toLocaleString()}</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => openModal(version)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(version.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="empty-state">No versions defined</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2>{currentVersionId ? 'Edit Version' : 'Add Version'}</h2>
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
                                <label>Change Summary</label>
                                <textarea
                                    name="change_summary"
                                    className="form-input"
                                    value={formData.change_summary}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Describe what changed in this version"
                                />
                            </div>

                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label>Snapshot (JSON - Optional)</label>
                                    <button type="button" className="btn-small btn-secondary" onClick={formatJSON}>
                                        Format JSON
                                    </button>
                                </div>
                                <textarea
                                    name="snapshot"
                                    className="form-input"
                                    value={formData.snapshot}
                                    onChange={handleInputChange}
                                    rows="8"
                                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                                    placeholder='{"field": "value"}'
                                />
                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                    Optional JSON snapshot of important fields at this version
                                </small>
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

export default ReportVersions;
