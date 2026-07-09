const express = require('express');
const { createReview, getRoomReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/room/:roomId', getRoomReviews);

module.exports = router;
