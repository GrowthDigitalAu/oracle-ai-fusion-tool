const express = require('express');
const router = express.Router();
const ProjectMember = require('../models/ProjectMember');
const OrganizationUser = require('../models/OrganizationUser');
const Project = require('../models/Project'); // If needed for validation
const authMiddleware = require('../middleware/authMiddleware');
const organizationUserMiddleware = require('../middleware/organizationUserMiddleware');

// @route   GET /api/project-members/:projectId
// @desc    Get all members of a project
// @access  Protected (Org User Only)
router.get('/:projectId', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const members = await ProjectMember.findAll({
            where: {
                project_id: req.params.projectId,
                organization_id: req.user.organization_id // Security check
            },
            include: [{
                model: OrganizationUser,
                attributes: ['id', 'full_name', 'email', 'job_title']
            }]
        });
        res.json({ success: true, data: members });
    } catch (err) {
        console.error('Error fetching project members:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/project-members
// @desc    Add a member to a project
// @access  Protected (Org User Only)
router.post('/', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const { project_id, organization_user_id, project_role, allocation_percent, is_project_admin } = req.body;

        // Verify project belongs to user's org
        // (Optional but recommended extra check, though the constraint handles it implicitly via organization_id)

        const newMember = await ProjectMember.create({
            organization_id: req.user.organization_id,
            project_id,
            organization_user_id,
            project_role,
            allocation_percent: allocation_percent || 0,
            is_project_admin: is_project_admin || false,
            created_by: req.user.id,
            updated_by: req.user.id
        });

        res.status(201).json({ success: true, data: newMember });
    } catch (err) {
        console.error('Error adding project member:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(200).json({ success: false, error: 'User is already a member of this project.' });
        }
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/project-members/:id
// @desc    Update a project member
// @access  Protected (Org User Only)
router.put('/:id', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const { project_role, allocation_percent, is_project_admin } = req.body;
        const member = await ProjectMember.findOne({
            where: {
                id: req.params.id,
                organization_id: req.user.organization_id
            }
        });

        if (!member) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }

        await member.update({
            project_role,
            allocation_percent,
            is_project_admin,
            updated_by: req.user.id
        });

        res.json({ success: true, data: member });
    } catch (err) {
        console.error('Error updating project member:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   DELETE /api/project-members/:id
// @desc    Remove a member from project
// @access  Protected (Org User Only)
router.delete('/:id', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const member = await ProjectMember.findOne({
            where: {
                id: req.params.id,
                organization_id: req.user.organization_id
            }
        });

        if (!member) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }

        await member.update({ deleted_by: req.user.id });
        await member.destroy();

        res.json({ success: true, message: 'Member removed' });
    } catch (err) {
        console.error('Error removing project member:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
