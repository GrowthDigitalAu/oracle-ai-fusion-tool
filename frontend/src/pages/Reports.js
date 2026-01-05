import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';

const Reports = () => {
    const { projectId } = useParams();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [error, setError] = useState('');

    const initialFormState = {
        code: '',
        name: '',
        description: '',
        status: 'draft',
        report_type: 'BI_PUBLISHER',
        is_seeded_reconcile: false,
        seeded_report_name: '',
        justification: '',
        output_html: false,
        output_excel: false,
        output_pdf: false,
        output_word: false,
        output_xml: false,
        output_csv: false,
        delivery_burst: false,
        delivery_ftp: false,
        delivery_email: false,
        delivery_system: true
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchReports();
    }, [projectId]);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/projects/${projectId}/reports`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setReports(data.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const openAddModal = () => {
        setFormData(initialFormState);
        setIsEditMode(false);
        setCurrentId(null);
        setIsModalOpen(true);
        setError('');
    };

    const handleEdit = (report) => {
        setFormData({
            code: report.code,
            name: report.name,
            description: report.description || '',
            status: report.status,
            report_type: report.report_type,
            is_seeded_reconcile: report.is_seeded_reconcile,
            seeded_report_name: report.seeded_report_name || '',
            justification: report.justification || '',
            output_html: report.output_html,
            output_excel: report.output_excel,
            output_pdf: report.output_pdf,
            output_word: report.output_word,
            output_xml: report.output_xml,
            output_csv: report.output_csv,
            delivery_burst: report.delivery_burst,
            delivery_ftp: report.delivery_ftp,
            delivery_email: report.delivery_email,
            delivery_system: report.delivery_system
        });
        setCurrentId(report.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                fetchReports();
            } else {
                alert(data.error || 'Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('orgToken');
            const url = isEditMode
                ? `http://localhost:5000/api/reports/${currentId}`
                : `http://localhost:5000/api/projects/${projectId}/reports`;
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
                fetchReports();
            } else {
                setError(data.error || 'Failed to save task');
            }
        } catch (error) {
            console.error('Submit error:', error);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="page-container">
            <div className="header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link to="/projects" className="btn-secondary" style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1>Tasks</h1>
                </div>
                <button className="btn-primary" onClick={openAddModal}>
                    Add Task
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Output</th>
                        <th>Delivery</th>
                         <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <tr key={report.id}>
                                <td>{report.code}</td>
                                <td>
                                    <Link to={`/projects/${projectId}/tasks/${report.id}`} style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>
                                        {report.name}
                                    </Link>
                                </td>
                                <td>
                                    <span className={`status-badge ${report.status === 'approved' ? 'active' : report.status === 'retired' ? 'inactive' : 'pending'}`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td>{report.report_type}</td>
                                <td>
                                    {[
                                        report.output_html && 'HTML',
                                        report.output_excel && 'Excel',
                                        report.output_pdf && 'PDF',
                                        report.output_word && 'Word',
                                        report.output_xml && 'XML',
                                        report.output_csv && 'CSV'
                                    ].filter(Boolean).join(', ') || '-'}
                                </td>
                                <td>
                                    {[
                                        report.delivery_burst && 'Burst',
                                        report.delivery_ftp && 'FTP',
                                        report.delivery_email && 'Email',
                                        report.delivery_system && 'System'
                                    ].filter(Boolean).join(', ') || '-'}
                                </td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => handleEdit(report)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(report.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="empty-state">No tasks found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit Task' : 'Add Task'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Task Code</label>
                                    <input
                                        type="text"
                                        name="code"
                                        className="form-input"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isEditMode}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Task Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    className="form-input"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="2"
                                />
                            </div>

                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        className="form-input"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="in_review">In Review</option>
                                        <option value="approved">Approved</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Task Type</label>
                                    <input
                                        type="text"
                                        name="report_type"
                                        className="form-input"
                                        value={formData.report_type}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="is_seeded_reconcile" 
                                        checked={formData.is_seeded_reconcile} 
                                        onChange={handleInputChange} 
                                    /> Is Seeded Reconcile
                                </label>
                            </div>

                            {formData.is_seeded_reconcile && (
                                <div className="form-group">
                                    <label>Seeded Task Name</label>
                                    <input
                                        type="text"
                                        name="seeded_report_name"
                                        className="form-input"
                                        value={formData.seeded_report_name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            )}

                             <div className="form-group">
                                <label>Justification</label>
                                <textarea
                                    name="justification"
                                    className="form-input"
                                    value={formData.justification}
                                    onChange={handleInputChange}
                                    rows="2"
                                />
                            </div>

                            <h4>Output Formats</h4>
                            <div className="form-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                                {['html', 'excel', 'pdf', 'word', 'xml', 'csv'].map(type => (
                                     <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="checkbox"
                                            name={`output_${type}`}
                                            checked={formData[`output_${type}`]}
                                            onChange={handleInputChange}
                                        /> {type.toUpperCase()}
                                    </label>
                                ))}
                            </div>

                            <h4>Delivery Methods</h4>
                            <div className="form-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                                {['burst', 'ftp', 'email', 'system'].map(type => (
                                     <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="checkbox"
                                            name={`delivery_${type}`}
                                            checked={formData[`delivery_${type}`]}
                                            onChange={handleInputChange}
                                        /> {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </label>
                                ))}
                            </div>
                            
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
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

export default Reports;
