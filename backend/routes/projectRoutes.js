const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const authMiddleware = require('../middleware/authMiddleware');
const organizationUserMiddleware = require('../middleware/organizationUserMiddleware');

// @route   GET /api/projects
// @desc    Get all projects for the logged-in organization user's organization
// @access  Protected (Org User Only)
router.get('/', authMiddleware, organizationUserMiddleware, async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: {
        organization_id: req.user.organization_id
      },
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Protected (Org User Only)
router.post('/', authMiddleware, organizationUserMiddleware, async (req, res) => {
  try {
    const { code, name, description, status, oracle_env_name, oracle_instance_url, start_date, end_date } = req.body;

    const newProject = await Project.create({
      organization_id: req.user.organization_id,
      code,
      name,
      description,
      status: status || 'active',
      oracle_env_name,
      oracle_instance_url,
      start_date,
      end_date,
      created_by: req.user.id,
      updated_by: req.user.id
    });

    res.status(201).json({ success: true, data: newProject });
  } catch (err) {
    console.error('Error creating project:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
       return res.status(200).json({ success: false, error: 'Project Code already exists for this organization.' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Protected (Org User Only)
router.put('/:id', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const { code, name, description, status, oracle_env_name, oracle_instance_url, start_date, end_date } = req.body;
        const project = await Project.findOne({
            where: {
                id: req.params.id,
                organization_id: req.user.organization_id
            }
        });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        await project.update({
            code,
            name,
            description,
            status,
            oracle_env_name,
            oracle_instance_url,
            start_date,
            end_date,
            updated_by: req.user.id
        });

        res.json({ success: true, data: project });
    } catch (err) {
        console.error('Error updating project:', err);
         if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(200).json({ success: false, error: 'Project Code already exists.' });
         }
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete (soft delete) a project
// @access  Protected (Org User Only)
router.delete('/:id', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const project = await Project.findOne({
            where: {
                id: req.params.id,
                organization_id: req.user.organization_id
            }
        });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        await project.update({ deleted_by: req.user.id });
        await project.destroy(); // Soft delete

        res.json({ success: true, message: 'Project deleted' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
