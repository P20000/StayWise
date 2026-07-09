const express = require('express');
const { updateProfile, getUsers } = require('../controllers/userController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.put('/profile', protect, express.json(), updateProfile);
router.get('/', protect, requireRole('Admin'), getUsers);

module.exports = router;
