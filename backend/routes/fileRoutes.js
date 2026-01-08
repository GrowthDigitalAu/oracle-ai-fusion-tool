const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all files
router.get('/files', fileController.getFiles);

// Create file record
router.post('/files', fileController.createFile);

// Get single file
router.get('/files/:id', fileController.getFileById);

// Update file
router.put('/files/:id', fileController.updateFile);

// Delete file
router.delete('/files/:id', fileController.deleteFile);

module.exports = router;
