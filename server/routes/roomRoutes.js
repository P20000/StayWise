const express = require('express');
const { getRooms, getRoomBySlug, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', getRooms);
router.get('/:slug', getRoomBySlug);
router.post('/', protect, requireRole('Vendor', 'Admin'), upload.array('images', 5), createRoom);
router.put('/:id', protect, requireRole('Vendor', 'Admin'), upload.array('images', 5), updateRoom);
router.delete('/:id', protect, requireRole('Vendor', 'Admin'), deleteRoom);

module.exports = router;
