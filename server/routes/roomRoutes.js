const express = require('express');
const { getRooms, getRoomBySlug, createRoom } = require('../controllers/roomController');
const { protect, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', getRooms);
router.get('/:slug', getRoomBySlug);
router.post('/', protect, requireRole('Vendor', 'Admin'), upload.array('images', 5), createRoom);

module.exports = router;
