import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

const ReportConfig = () => {
    const { projectId, reportId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [config, setConfig] = useState(null);
    
    const [formData, setFormData] = useState({
        config: '{}',
        remark: ''
    });

    useEffect(() => {
        fetchConfig();
    }, [reportId]);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/reports/${reportId}/config`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && data.data) {
                setConfig(data.data);
            } else {
                setConfig(null);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
            setConfig(null);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = () => {
        if (config) {
            setFormData({
                config: JSON.stringify(config.config, null, 2),
                remark: config.remark || ''
            });
        } else {
            setFormData({
                config: '{}',
                remark: ''
            });
        }
        setIsModalOpen(true);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        
        try {
            // Validate JSON
            let parsedConfig;
            try {
                parsedConfig = JSON.parse(formData.config);
            } catch (err) {
                setError('Invalid JSON format. Please check your configuration.');
                setSaving(false);
                return;
            }

            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/reports/${reportId}/config`, {
                method: config ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    config: parsedConfig,
                    remark: formData.remark || null
                })
            });
            
            const data = await response.json();
            if (response.ok && data.success) {
                setIsModalOpen(false);
                fetchConfig();
            } else {
                setError(data.error || 'Failed to save configuration');
            }
        } catch (error) {
            console.error('Save error:', error);
            setError('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this configuration?')) return;
        
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/reports/${reportId}/config`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                fetchConfig();
            } else {
                alert(data.error || 'Failed to delete configuration');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const formatJSON = () => {
        try {
            const parsed = JSON.parse(formData.config);
            setFormData({
                ...formData,
                config: JSON.stringify(parsed, null, 2)
            });
            setError('');
        } catch (err) {
            setError('Invalid JSON format. Cannot format.');
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
                    <h1>Report Configuration</h1>
                </div>
                <button className="btn-primary" onClick={openModal}>
                    {config ? 'Edit Configuration' : 'Add Configuration'}
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Configuration (JSON)</th>
                        <th>Remark</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {config ? (
                        <tr>
                            <td>
                                <pre style={{ margin: 0, maxWidth: '400px', overflow: 'auto', fontSize: '12px', background: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
                                    {JSON.stringify(config.config, null, 2)}
                                </pre>
                            </td>
                            <td>{config.remark || '-'}</td>
                            <td>{new Date(config.updated_at).toLocaleString()}</td>
                            <td>
                                <button className="action-btn edit-btn" onClick={openModal}>
                                    <Pencil size={18} />
                                </button>
                                <button className="action-btn delete-btn" onClick={handleDelete}>
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ) : (
                        <tr>
                            <td colSpan="4" className="empty-state">No configuration defined</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2>{config ? 'Edit Configuration' : 'Add Configuration'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label>Configuration (JSON)</label>
                                    <button type="button" className="btn-small btn-secondary" onClick={formatJSON}>
                                        Format JSON
                                    </button>
                                </div>
                                <textarea
                                    name="config"
                                    className="form-input"
                                    value={formData.config}
                                    onChange={handleInputChange}
                                    rows="15"
                                    required
                                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                                    placeholder='{"key": "value"}'
                                />
                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                    Enter configuration as valid JSON. Use the "Format JSON" button to auto-format.
                                </small>
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
                                    placeholder="Optional notes about this configuration"
                                />
                            </div>

                            <div style={{ marginTop: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '8px' }}>
                                <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Configuration Example:</h4>
                                <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto', fontSize: '12px', margin: 0 }}>
{`{
  "output_format": "PDF",
  "page_size": "A4",
  "orientation": "portrait",
  "margins": {
    "top": 20,
    "bottom": 20,
    "left": 15,
    "right": 15
  },
  "font": {
    "family": "Arial",
    "size": 10
  }
}`}
                                </pre>
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

export default ReportConfig;
