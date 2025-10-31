const express = require('express');
const { getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');

const router = express.Router();

router.get('/', protect, authorize('superadmin'), getAllUsers);
router.put('/:id', protect, authorize('superadmin'), logAction('UPDATE', 'User'), updateUser);
router.delete('/:id', protect, authorize('superadmin'), logAction('DELETE', 'User'), deleteUser);

module.exports = router;
