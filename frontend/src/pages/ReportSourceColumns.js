import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

const ReportSourceColumns = () => {
    const { projectId, reportId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [currentColumnId, setCurrentColumnId] = useState(null);

    const initialFormData = {
        column_order: '',
        column_name: '',
        source_navigation: '',
        data_type: '',
        comments: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchColumns();
    }, [reportId]);

    const fetchColumns = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/reports/${reportId}/source-columns`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setColumns(data.data);
            } else {
                setColumns([]);
            }
        } catch (error) {
            console.error('Error fetching source columns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const openModal = (column = null) => {
        if (column) {
            setCurrentColumnId(column.id);
            setFormData({
                column_order: column.column_order || '',
                column_name: column.column_name || '',
                source_navigation: column.source_navigation || '',
                data_type: column.data_type || '',
                comments: column.comments || ''
            });
        } else {
            setCurrentColumnId(null);
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
            if (currentColumnId) {
                url = `http://localhost:5000/api/source-columns/${currentColumnId}`;
                method = 'PUT';
            } else {
                url = `http://localhost:5000/api/reports/${reportId}/source-columns`;
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
                fetchColumns();
            } else {
                setError(data.error || 'Failed to save source column');
            }
        } catch (error) {
            console.error('Save error:', error);
            setError('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this source column?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/source-columns/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                fetchColumns();
            } else {
                alert(data.error || 'Failed to delete source column');
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
                    <h1>Report Source Columns</h1>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    Add Source Column
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Column Name</th>
                        <th>Source Navigation</th>
                        <th>Data Type</th>
                        <th>Comments</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {columns.length > 0 ? (
                        columns.map((col) => (
                            <tr key={col.id}>
                                <td>{col.column_order}</td>
                                <td>{col.column_name}</td>
                                <td>{col.source_navigation.length > 50 ? col.source_navigation.substring(0, 50) + '...' : col.source_navigation}</td>
                                <td>{col.data_type || '-'}</td>
                                <td>{col.comments ? (col.comments.length > 30 ? col.comments.substring(0, 30) + '...' : col.comments) : '-'}</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => openModal(col)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(col.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="empty-state">No source columns defined</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>{currentColumnId ? 'Edit Source Column' : 'Add Source Column'}</h2>
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
                                        name="column_order"
                                        className="form-input"
                                        value={formData.column_order}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label>Column Name</label>
                                    <input
                                        type="text"
                                        name="column_name"
                                        className="form-input"
                                        value={formData.column_name}
                                        onChange={handleInputChange}
                                        required
                                        maxLength="255"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Source Navigation Path</label>
                                <textarea
                                    name="source_navigation"
                                    className="form-input"
                                    value={formData.source_navigation}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    placeholder="e.g., Table.Field or Navigation Path"
                                />
                            </div>

                            <div className="form-group">
                                <label>Data Type</label>
                                <input
                                    type="text"
                                    name="data_type"
                                    className="form-input"
                                    value={formData.data_type}
                                    onChange={handleInputChange}
                                    maxLength="50"
                                    placeholder="e.g., VARCHAR, NUMBER, DATE"
                                />
                            </div>

                            <div className="form-group">
                                <label>Comments</label>
                                <textarea
                                    name="comments"
                                    className="form-input"
                                    value={formData.comments}
                                    onChange={handleInputChange}
                                    rows="2"
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

export default ReportSourceColumns;
