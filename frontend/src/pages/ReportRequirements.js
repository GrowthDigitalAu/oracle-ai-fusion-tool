import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Pencil, Trash2 } from 'lucide-react';

const ReportRequirements = () => {
    const { projectId, taskId } = useParams(); // taskId corresponds to reportId
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requirements, setRequirements] = useState([]); // Array of requirements
    const [currentRequirementId, setCurrentRequirementId] = useState(null); // ID for edit

    const initialFormData = {
        purpose: '',
        pre_condition: '',
        data_access_level: '',
        domain: '',
        module: '',
        category: '',
        is_new_report: true,
        task_reference: '',
        functional_arch_approved: false,
        validated_in_repository: false,
        sample_layout_file_id: '',
        company_logo_file_id: '',
        grouping_applicable: false,
        grouping_columns: '',
        sorting_applicable: false,
        sorting_columns: '',
        totals_applicable: false,
        totals_columns: '',
        subtotals_applicable: false,
        subtotals_columns: '',
        client_signoff_notes: '',
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchData();
    }, [taskId]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const reqResponse = await fetch(`http://localhost:5000/api/reports/${taskId}/requirements`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const reqData = await reqResponse.json();

            if (reqData.success && Array.isArray(reqData.data)) {
                setRequirements(reqData.data);
            } else {
                setRequirements([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const openModal = (requirement = null) => {
        if (requirement) {
            setCurrentRequirementId(requirement.id);
            setFormData({
                purpose: requirement.purpose || '',
                pre_condition: requirement.pre_condition || '',
                data_access_level: requirement.data_access_level || '',
                domain: requirement.domain || '',
                module: requirement.module || '',
                category: requirement.category || '',
                is_new_report: requirement.is_new_report,
                task_reference: requirement.task_reference || '',
                functional_arch_approved: requirement.functional_arch_approved || false,
                validated_in_repository: requirement.validated_in_repository || false,
                sample_layout_file_id: requirement.sample_layout_file_id || '',
                company_logo_file_id: requirement.company_logo_file_id || '',
                grouping_applicable: requirement.grouping_applicable || false,
                grouping_columns: requirement.grouping_columns || '',
                sorting_applicable: requirement.sorting_applicable || false,
                sorting_columns: requirement.sorting_columns || '',
                totals_applicable: requirement.totals_applicable || false,
                totals_columns: requirement.totals_columns || '',
                subtotals_applicable: requirement.subtotals_applicable || false,
                subtotals_columns: requirement.subtotals_columns || '',
                client_signoff_notes: requirement.client_signoff_notes || '',
                notes: requirement.notes || ''
            });
        } else {
            setCurrentRequirementId(null);
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
            
            // Sanitize form data: convert empty strings to null
            const sanitizedData = Object.keys(formData).reduce((acc, key) => {
                const value = formData[key];
                acc[key] = value === '' ? null : value;
                return acc;
            }, {});

            let url, method;
            if (currentRequirementId) {
                // Update specific requirement
                url = `http://localhost:5000/api/requirements/${currentRequirementId}`;
                method = 'PUT';
            } else {
                // Create new requirement for task
                url = `http://localhost:5000/api/reports/${taskId}/requirements`;
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
                fetchData();
            } else {
                setError(data.error || 'Failed to save requirements');
            }
        } catch (error) {
            console.error('Save error:', error);
            setError('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this requirement?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/requirements/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                fetchData(); // Refresh list
            } else {
                alert(data.error || 'Failed to delete requirement');
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
                    <Link to={`/projects/${projectId}/tasks`} className="btn-secondary" style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1>Task Requirements</h1>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    Add Requirements
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Purpose</th>
                        <th>Domain</th>
                        <th>Module</th>
                        <th>Data Access</th>
                        <th>Arch Approved</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requirements.length > 0 ? (
                        requirements.map((req) => (
                            <tr key={req.id}>
                                <td>{req.purpose ? (req.purpose.length > 50 ? req.purpose.substring(0, 50) + '...' : req.purpose) : '-'}</td>
                                <td>{req.domain || '-'}</td>
                                <td>{req.module || '-'}</td>
                                <td>{req.data_access_level || '-'}</td>
                                <td>
                                    <span className={`status-badge ${req.functional_arch_approved ? 'active' : 'inactive'}`}>
                                        {req.functional_arch_approved ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => openModal(req)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(req.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="empty-state">No requirements defined</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2>{currentRequirementId ? 'Edit Requirements' : 'Add Requirements'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        
                        <form className="requirements-form" onSubmit={handleSubmit}>
                
                            <div className="form-section">
                                <h3>General Info</h3>
                                <div className="form-group">
                                    <label>Purpose</label>
                                    <textarea name="purpose" className="form-input" rows="3" value={formData.purpose || ''} onChange={handleInputChange} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label>Pre-Condition</label>
                                        <input type="text" name="pre_condition" className="form-input" value={formData.pre_condition || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Data Access Level</label>
                                        <input type="text" name="data_access_level" className="form-input" value={formData.data_access_level || ''} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Scope</h3>
                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label>Domain</label>
                                        <input type="text" name="domain" className="form-input" value={formData.domain || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Module</label>
                                        <input type="text" name="module" className="form-input" value={formData.module || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Category</label>
                                        <input type="text" name="category" className="form-input" value={formData.category || ''} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label>Task Reference</label>
                                        <input type="text" name="task_reference" className="form-input" value={formData.task_reference || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group flex-1" style={{ display: 'flex', alignItems: 'center', paddingTop: '25px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input type="checkbox" name="is_new_report" checked={formData.is_new_report} onChange={handleInputChange} />
                                            Is New Report?
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Validation</h3>
                                <div className="form-row">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '20px' }}>
                                        <input type="checkbox" name="functional_arch_approved" checked={formData.functional_arch_approved} onChange={handleInputChange} />
                                        Functional Arch Approved
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" name="validated_in_repository" checked={formData.validated_in_repository} onChange={handleInputChange} />
                                        Validated in Repository
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Attachments (IDs)</h3>
                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label>Sample Layout File ID</label>
                                        <input type="number" name="sample_layout_file_id" className="form-input" value={formData.sample_layout_file_id || ''} onChange={handleInputChange} placeholder="Enter File ID" />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Company Logo File ID</label>
                                        <input type="number" name="company_logo_file_id" className="form-input" value={formData.company_logo_file_id || ''} onChange={handleInputChange} placeholder="Enter File ID" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Output Columns Configuration</h3>
                                
                                <div className="config-row" style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                        <input type="checkbox" name="grouping_applicable" checked={formData.grouping_applicable} onChange={handleInputChange} />
                                        <strong>Grouping Applicable</strong>
                                    </label>
                                    {formData.grouping_applicable && (
                                        <input type="text" name="grouping_columns" placeholder="Comma separated columns" className="form-input" value={formData.grouping_columns || ''} onChange={handleInputChange} />
                                    )}
                                </div>

                                <div className="config-row" style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                        <input type="checkbox" name="sorting_applicable" checked={formData.sorting_applicable} onChange={handleInputChange} />
                                        <strong>Sorting Applicable</strong>
                                    </label>
                                    {formData.sorting_applicable && (
                                        <input type="text" name="sorting_columns" placeholder="Comma separated columns" className="form-input" value={formData.sorting_columns || ''} onChange={handleInputChange} />
                                    )}
                                </div>

                                <div className="config-row" style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                        <input type="checkbox" name="totals_applicable" checked={formData.totals_applicable} onChange={handleInputChange} />
                                        <strong>Totals Applicable</strong>
                                    </label>
                                    {formData.totals_applicable && (
                                        <input type="text" name="totals_columns" placeholder="Comma separated columns" className="form-input" value={formData.totals_columns || ''} onChange={handleInputChange} />
                                    )}
                                </div>

                                <div className="config-row" style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                        <input type="checkbox" name="subtotals_applicable" checked={formData.subtotals_applicable} onChange={handleInputChange} />
                                        <strong>Subtotals Applicable</strong>
                                    </label>
                                    {formData.subtotals_applicable && (
                                        <input type="text" name="subtotals_columns" placeholder="Comma separated columns" className="form-input" value={formData.subtotals_columns || ''} onChange={handleInputChange} />
                                    )}
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Notes</h3>
                                <div className="form-group">
                                    <label>Client Signoff Notes</label>
                                    <textarea name="client_signoff_notes" className="form-input" rows="2" value={formData.client_signoff_notes || ''} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Internal Notes</label>
                                    <textarea name="notes" className="form-input" rows="2" value={formData.notes || ''} onChange={handleInputChange} />
                                </div>
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
            
            <style>{`
                .form-section {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border: 1px solid #e9ecef;
                }
                .form-section h3 {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: #2c3e50;
                    border-bottom: 1px solid #dee2e6;
                    padding-bottom: 10px;
                    font-size: 1.1rem;
                }
                .form-row {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                .flex-1 { flex: 1; }
            `}</style>
        </div>
    );
};

export default ReportRequirements;
