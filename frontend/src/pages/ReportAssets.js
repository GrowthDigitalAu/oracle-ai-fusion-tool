import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

const ReportAssets = () => {
    const { projectId, reportId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assets, setAssets] = useState([]);
    const [currentAssetId, setCurrentAssetId] = useState(null);

    const initialFormData = {
        asset_type: 'SQL',
        version: 1,
        is_active: true,
        inline_text: '',
        file_id: '',
        file_id: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    const assetTypes = [
        'SQL',
        'DATA_MODEL',
        'REPORT_XML',
        'RTF_TEMPLATE',
        'SAMPLE_DATA',
        'OTHER'
    ];

    useEffect(() => {
        fetchAssets();
    }, [reportId]);

    const fetchAssets = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/reports/${reportId}/assets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setAssets(data.data);
            } else {
                setAssets([]);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const openModal = (asset = null) => {
        if (asset) {
            setCurrentAssetId(asset.id);
            setFormData({
                asset_type: asset.asset_type || 'SQL',
                version: asset.version || 1,
                is_active: asset.is_active !== undefined ? asset.is_active : true,
                inline_text: asset.inline_text || '',
                file_id: asset.file_id || '',
                file_id: asset.file_id || ''
            });
        } else {
            setCurrentAssetId(null);
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
            if (currentAssetId) {
                url = `http://localhost:5000/api/assets/${currentAssetId}`;
                method = 'PUT';
            } else {
                url = `http://localhost:5000/api/reports/${reportId}/assets`;
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
                fetchAssets();
            } else {
                setError(data.error || 'Failed to save asset');
            }
        } catch (error) {
            console.error('Save error:', error);
            setError('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/assets/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                fetchAssets();
            } else {
                alert(data.error || 'Failed to delete asset');
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
                    <h1>Report Assets</h1>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    Add Asset
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Asset Type</th>
                        <th>Version</th>
                        <th>Active</th>
                        <th>Content Preview</th>
                        <th>File ID</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.length > 0 ? (
                        assets.map((asset) => (
                            <tr key={asset.id}>
                                <td>{asset.asset_type}</td>
                                <td>{asset.version}</td>
                                <td>
                                    <span className={`status-badge ${asset.is_active ? 'active' : 'inactive'}`}>
                                        {asset.is_active ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td>{asset.inline_text ? (asset.inline_text.length > 50 ? asset.inline_text.substring(0, 50) + '...' : asset.inline_text) : '-'}</td>
                                <td>{asset.file_id || '-'}</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => openModal(asset)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(asset.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="empty-state">No assets defined</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>{currentAssetId ? 'Edit Asset' : 'Add Asset'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label>Asset Type</label>
                                    <select
                                        name="asset_type"
                                        className="form-input"
                                        value={formData.asset_type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {assetTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Version</label>
                                    <input
                                        type="number"
                                        name="version"
                                        className="form-input"
                                        value={formData.version}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                    />
                                    Is Active
                                </label>
                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                    Only one active asset per type is allowed per report
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Inline Text / Content</label>
                                <textarea
                                    name="inline_text"
                                    className="form-input"
                                    value={formData.inline_text}
                                    onChange={handleInputChange}
                                    rows="6"
                                    placeholder="Enter SQL, XML, or other text content here"
                                />
                            </div>

                            <div className="form-group">
                                <label>File ID</label>
                                <input
                                    type="number"
                                    name="file_id"
                                    className="form-input"
                                    value={formData.file_id}
                                    onChange={handleInputChange}
                                    placeholder="Reference to uploaded file"
                                    required
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

export default ReportAssets;
