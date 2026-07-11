const express = require('express');
const { updateProfile, getUsers, deleteProfile } = require('../controllers/userController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.put('/profile', protect, express.json(), updateProfile);
router.delete('/profile', protect, deleteProfile);
router.get('/', protect, requireRole('Admin'), getUsers);

module.exports = router;
