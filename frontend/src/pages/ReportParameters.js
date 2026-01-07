import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

const ReportParameters = () => {
    const { projectId, reportId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [parameters, setParameters] = useState([]);
    const [currentParameterId, setCurrentParameterId] = useState(null);

    const initialFormData = {
        param_order: '',
        name: '',
        prompt: '',
        default_value: '',
        is_mandatory: false,
        validation_type: 'FREE_TEXT',
        lov_source: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchParameters();
    }, [reportId]);

    const fetchParameters = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/reports/${reportId}/parameters`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setParameters(data.data);
            } else {
                setParameters([]);
            }
        } catch (error) {
            console.error('Error fetching parameters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const openModal = (parameter = null) => {
        if (parameter) {
            setCurrentParameterId(parameter.id);
            setFormData({
                param_order: parameter.param_order || '',
                name: parameter.name || '',
                prompt: parameter.prompt || '',
                default_value: parameter.default_value || '',
                is_mandatory: parameter.is_mandatory || false,
                validation_type: parameter.validation_type || 'FREE_TEXT',
                lov_source: parameter.lov_source || ''
            });
        } else {
            setCurrentParameterId(null);
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
            if (currentParameterId) {
                url = `http://localhost:5000/api/parameters/${currentParameterId}`;
                method = 'PUT';
            } else {
                url = `http://localhost:5000/api/reports/${reportId}/parameters`;
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
                fetchParameters();
            } else {
                setError(data.error || 'Failed to save parameter');
            }
        } catch (error) {
            console.error('Save error:', error);
            setError('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this parameter?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/parameters/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                fetchParameters();
            } else {
                alert(data.error || 'Failed to delete parameter');
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
                    <h1>Report Parameters</h1>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    Add Parameter
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Name</th>
                        <th>Prompt</th>
                        <th>Type</th>
                        <th>Mandatory</th>
                        <th>Default Value</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {parameters.length > 0 ? (
                        parameters.map((param) => (
                            <tr key={param.id}>
                                <td>{param.param_order}</td>
                                <td>{param.name}</td>
                                <td>{param.prompt}</td>
                                <td>{param.validation_type}</td>
                                <td>
                                    <span className={`status-badge ${param.is_mandatory ? 'active' : 'inactive'}`}>
                                        {param.is_mandatory ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td>{param.default_value || '-'}</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => openModal(param)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(param.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="empty-state">No parameters defined</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>{currentParameterId ? 'Edit Parameter' : 'Add Parameter'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Order</label>
                                    <input
                                        type="number"
                                        name="param_order"
                                        className="form-input"
                                        value={formData.param_order}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label>Name (e.g., P_BU_NAME)</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        maxLength="100"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Prompt</label>
                                <input
                                    type="text"
                                    name="prompt"
                                    className="form-input"
                                    value={formData.prompt}
                                    onChange={handleInputChange}
                                    required
                                    maxLength="255"
                                />
                            </div>

                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Validation Type</label>
                                    <select
                                        name="validation_type"
                                        className="form-input"
                                        value={formData.validation_type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="FREE_TEXT">Free Text</option>
                                        <option value="LOV">LOV</option>
                                        <option value="MULTI_LOV">Multi LOV</option>
                                        <option value="CALENDAR">Calendar</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Default Value</label>
                                    <input
                                        type="text"
                                        name="default_value"
                                        className="form-input"
                                        value={formData.default_value}
                                        onChange={handleInputChange}
                                        maxLength="255"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="is_mandatory"
                                        checked={formData.is_mandatory}
                                        onChange={handleInputChange}
                                    />
                                    Is Mandatory
                                </label>
                            </div>

                            {(formData.validation_type === 'LOV' || formData.validation_type === 'MULTI_LOV') && (
                                <div className="form-group">
                                    <label>LOV Source (SQL or Reference)</label>
                                    <textarea
                                        name="lov_source"
                                        className="form-input"
                                        value={formData.lov_source}
                                        onChange={handleInputChange}
                                        rows="3"
                                    />
                                </div>
                            )}

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

export default ReportParameters;
