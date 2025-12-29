const express = require('express');
const router = express.Router();
const OrganizationUserRole = require('../models/OrganizationUserRole');
const OrganizationUser = require('../models/OrganizationUser');
const Role = require('../models/Role');
const authMiddleware = require('../middleware/authMiddleware');
const organizationUserMiddleware = require('../middleware/organizationUserMiddleware');

// @route   GET /api/organization-user-roles
// @desc    Get all user-role assignments for the organization
// @access  Protected (Org User Only)
router.get('/', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const userRoles = await OrganizationUserRole.findAll({
            where: {
                organization_id: req.user.organization_id
            },
            include: [
                {
                    model: OrganizationUser,
                    attributes: ['id', 'full_name', 'email']
                },
                {
                    model: Role,
                    attributes: ['id', 'name', 'description']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: userRoles });
    } catch (err) {
        console.error('Error fetching user roles:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/organization-user-roles
// @desc    Assign a role to a user
// @access  Protected (Org User Only)
router.post('/', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const { organization_user_id, role_id } = req.body;

        // Verify User belongs to Organization
        const user = await OrganizationUser.findOne({
            where: { id: organization_user_id, organization_id: req.user.organization_id }
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found in this organization' });
        }

        // Verify Role belongs to Organization
        const role = await Role.findOne({
             where: { id: role_id, organization_id: req.user.organization_id }
        });

        if (!role) {
             return res.status(404).json({ success: false, error: 'Role not found in this organization' });
        }

        const newAssignment = await OrganizationUserRole.create({
            organization_id: req.user.organization_id,
            organization_user_id,
            role_id,
            created_by: req.user.id,
            updated_by: req.user.id
        });

        const completeData = await OrganizationUserRole.findOne({
            where: { id: newAssignment.id },
            include: [
                { model: OrganizationUser, attributes: ['id', 'full_name', 'email'] },
                { model: Role, attributes: ['id', 'name'] }
            ]
        });

        res.status(201).json({ success: true, data: completeData });
    } catch (err) {
        console.error('Error assigning role to user:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, error: 'User already has this role.' });
        }
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/organization-user-roles/:id
// @desc    Update a user role assignment
// @access  Protected (Org User Only)
router.put('/:id', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const { organization_user_id, role_id } = req.body;

        const assignment = await OrganizationUserRole.findOne({
            where: {
                id: req.params.id,
                organization_id: req.user.organization_id
            }
        });

        if (!assignment) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }

        // Perform checks if changing user or role
        if (organization_user_id) {
             const user = await OrganizationUser.findOne({
                where: { id: organization_user_id, organization_id: req.user.organization_id }
            });
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (role_id) {
             const role = await Role.findOne({
                where: { id: role_id, organization_id: req.user.organization_id }
            });
            if (!role) return res.status(404).json({ success: false, error: 'Role not found' });
        }

        await assignment.update({
            organization_user_id,
            role_id,
            updated_by: req.user.id
        });

        const updatedData = await OrganizationUserRole.findOne({
            where: { id: assignment.id },
             include: [
                { model: OrganizationUser, attributes: ['id', 'full_name', 'email'] },
                { model: Role, attributes: ['id', 'name'] }
            ]
        });

        res.json({ success: true, data: updatedData });

    } catch (err) {
        console.error('Error updating user role:', err);
         if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, error: 'Assignment already exists.' });
        }
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   DELETE /api/organization-user-roles/:id
// @desc    Remove a role from a user
// @access  Protected (Org User Only)
router.delete('/:id', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const assignment = await OrganizationUserRole.findOne({
            where: {
                id: req.params.id,
                organization_id: req.user.organization_id
            }
        });

        if (!assignment) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }

        await assignment.update({ deleted_by: req.user.id });
        await assignment.destroy();

        res.json({ success: true, message: 'Role removed from user' });
    } catch (err) {
        console.error('Error removing role from user:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
