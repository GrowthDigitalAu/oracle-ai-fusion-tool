const express = require('express');
const router = express.Router();
const RolePermission = require('../models/RolePermission');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const authMiddleware = require('../middleware/authMiddleware');
const organizationUserMiddleware = require('../middleware/organizationUserMiddleware');

// @route   GET /api/role-permissions/:roleId
// @desc    Get all permissions for a specific role
// @access  Protected (Org User Only)
router.get('/:roleId', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const rolePermissions = await RolePermission.findAll({
            where: {
                role_id: req.params.roleId,
                organization_id: req.user.organization_id
            },
            include: [{
                model: Permission,
                attributes: ['id', 'code', 'description']
            }]
        });
        res.json({ success: true, data: rolePermissions });
    } catch (err) {
        console.error('Error fetching role permissions:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/role-permissions
// @desc    Assign a permission to a role
// @access  Protected (Org User Only)
router.post('/', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const { role_id, permission_id } = req.body;

        // Verify the role belongs to the organization
        const role = await Role.findOne({
            where: { id: role_id, organization_id: req.user.organization_id }
        });

        if (!role) {
            return res.status(404).json({ success: false, error: 'Role not found or access denied' });
        }

        const newRolePermission = await RolePermission.create({
            organization_id: req.user.organization_id,
            role_id,
            permission_id,
            created_by: req.user.id,
            updated_by: req.user.id
        });

        const completeData = await RolePermission.findOne({
            where: { id: newRolePermission.id },
            include: [{ model: Permission, attributes: ['id', 'code', 'description'] }]
        });

        res.status(201).json({ success: true, data: completeData });
    } catch (err) {
        console.error('Error assigning permission:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, error: 'Permission already assigned to this role.' });
        }
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/role-permissions/:id
// @desc    Update a role permission assignment
// @access  Protected (Org User Only)
router.put('/:id', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const { permission_id } = req.body;

        const rolePermission = await RolePermission.findOne({
            where: {
                id: req.params.id,
                organization_id: req.user.organization_id
            }
        });

        if (!rolePermission) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }

        // Update the permission_id
        await rolePermission.update({
            permission_id,
            updated_by: req.user.id
        });

        // Fetch updated data to return
         const updatedData = await RolePermission.findOne({
            where: { id: rolePermission.id },
            include: [{ model: Permission, attributes: ['id', 'code', 'description'] }]
        });

        res.json({ success: true, data: updatedData });
    } catch (err) {
        console.error('Error updating role permission:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ success: false, error: 'Permission already assigned to this role.' });
        }
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   DELETE /api/role-permissions/:id
// @desc    Remove a permission from a role
// @access  Protected (Org User Only)
router.delete('/:id', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const rolePermission = await RolePermission.findOne({
            where: {
                id: req.params.id,
                organization_id: req.user.organization_id
            }
        });

        if (!rolePermission) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }

        await rolePermission.update({ deleted_by: req.user.id });
        await rolePermission.destroy();

        res.json({ success: true, message: 'Permission removed from role' });
    } catch (err) {
        console.error('Error removing permission:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
