const express = require('express');
const router = express.Router();
const Permission = require('../models/Permission');
const authMiddleware = require('../middleware/authMiddleware');
const organizationUserMiddleware = require('../middleware/organizationUserMiddleware');
const { Op } = require('sequelize');

// @route   GET /api/permissions
// @desc    Get all permissions (Global + Organization specific)
// @access  Protected (Org User Only)
router.get('/', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const permissions = await Permission.findAll({
            where: {
                [Op.or]: [
                    { organization_id: null }, // Global permissions
                    { organization_id: req.user.organization_id } // Org specific permissions
                ]
            },
            order: [['code', 'ASC']]
        });
        res.json({ success: true, data: permissions });
    } catch (err) {
        console.error('Error fetching permissions:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/permissions
// @desc    Create a new permission
// @access  Protected (Org User Only - likely Admin role check needed in real app)
router.post('/', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const { code, description } = req.body;

        const newPermission = await Permission.create({
            organization_id: req.user.organization_id, // Default to Org specific
            code: code.toUpperCase(), // Ensure uppercase code
            description,
            created_by: req.user.id,
            updated_by: req.user.id
        });

        res.status(201).json({ success: true, data: newPermission });
    } catch (err) {
        console.error('Error creating permission:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(200).json({ success: false, error: 'Permission Code already exists.' });
        }
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/permissions/:id
// @desc    Update a permission
// @access  Protected (Org User Only)
router.put('/:id', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        const { code, description } = req.body;
        
        // Only allow updating permissions belonging to the org
        const permission = await Permission.findOne({
            where: {
                id: req.params.id,
                organization_id: req.user.organization_id
            }
        });

        if (!permission) {
            return res.status(404).json({ success: false, error: 'Permission not found or cannot edit global permission' });
        }

        await permission.update({
            code: code.toUpperCase(),
            description,
            updated_by: req.user.id
        });

        res.json({ success: true, data: permission });
    } catch (err) {
        console.error('Error updating permission:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(200).json({ success: false, error: 'Permission Code already exists.' });
        }
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   DELETE /api/permissions/:id
// @desc    Delete a permission
// @access  Protected (Org User Only)
router.delete('/:id', authMiddleware, organizationUserMiddleware, async (req, res) => {
    try {
        // Only allow deleting permissions belonging to the org
        const permission = await Permission.findOne({
            where: {
                id: req.params.id,
                organization_id: req.user.organization_id
            }
        });

        if (!permission) {
            return res.status(404).json({ success: false, error: 'Permission not found or cannot delete global permission' });
        }

        await permission.update({ deleted_by: req.user.id });
        await permission.destroy();

        res.json({ success: true, message: 'Permission deleted' });
    } catch (err) {
        console.error('Error deleting permission:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
