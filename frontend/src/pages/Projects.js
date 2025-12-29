import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // Prepared for edit
    const [currentId, setCurrentId] = useState(null);    // Prepared for edit
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        status: 'active',
        oracle_env_name: '',
        oracle_instance_url: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch('http://localhost:5000/api/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setProjects(data.data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        if (error) setError('');
    };

    const openAddModal = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            status: 'active',
            oracle_env_name: '',
            oracle_instance_url: '',
            start_date: '',
            end_date: ''
        });
        setIsEditMode(false);
        setCurrentId(null);
        setIsModalOpen(true);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('orgToken');
            const url = isEditMode 
                ? `http://localhost:5000/api/projects/${currentId}`
                : 'http://localhost:5000/api/projects';
            const method = isEditMode ? 'PUT' : 'POST';

            if (formData.start_date && formData.end_date) {
                if (new Date(formData.start_date) > new Date(formData.end_date)) {
                     setError('Start Date cannot be greater than End Date');
                     return;
                }
            }

            const payload = {
                ...formData,
                description: formData.description || null,
                oracle_env_name: formData.oracle_env_name || null,
                oracle_instance_url: formData.oracle_instance_url || null,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsModalOpen(false);
                fetchProjects();
            } else {
                setError(data.error || 'Failed to save project');
            }
        } catch (error) {
             console.error('Submit error:', error);
             setError('An error occurred. Please try again.');
        }
    };

    const handleEdit = (project) => {
        setFormData({
            code: project.code,
            name: project.name,
            description: project.description || '',
            status: project.status,
            oracle_env_name: project.oracle_env_name || '',
            oracle_instance_url: project.oracle_instance_url || '',
            start_date: project.start_date || '',
            end_date: project.end_date || ''
        });
        setCurrentId(project.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            const token = localStorage.getItem('orgToken');
            const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                fetchProjects();
            } else {
                alert(data.error || 'Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('An error occurred while deleting');
        }
    };

    return (
        <div className="page-container">
            <div className="header-actions">
                <h1>Projects</h1>
                <button className="btn-primary" onClick={openAddModal}>
                    Add Project
                </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Oracle Env</th>
                         <th>Start Date</th>
                         <th>End Date</th>
                         <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.length > 0 ? (
                        projects.map((project) => (
                            <tr key={project.id}>
                                <td>{project.code}</td>
                                <td>
                                    <Link to={`/projects/${project.id}/members`} style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '500' }}>
                                        {project.name}
                                    </Link>
                                </td>
                                <td>{project.description}</td>
                                <td>
                                     <span className={`status-badge ${project.status === 'active' ? 'active' : 'inactive'}`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td>{project.oracle_env_name}</td>
                                <td>{project.start_date || '-'}</td>
                                <td>{project.end_date || '-'}</td>
                                <td>
                                     <button className="action-btn edit-btn" onClick={() => handleEdit(project)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(project.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="empty-state">No projects found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit Project' : 'Add Project'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Project Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    className="form-input"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Project Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
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
                                />
                            </div>
                             <div className="form-group">
                                <label>Oracle Environment Name</label>
                                <input
                                    type="text"
                                    name="oracle_env_name"
                                    className="form-input"
                                    value={formData.oracle_env_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                             <div className="form-group">
                                <label>Oracle Instance URL</label>
                                <textarea
                                    name="oracle_instance_url"
                                    className="form-input"
                                    value={formData.oracle_instance_url}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                             <div className="form-group">
                                <label>Status</label>
                                <select 
                                    name="status" 
                                    className="form-input"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        className="form-input"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        className="form-input"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                    />
                                </div>
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

export default Projects;
