const express = require('express');
const { createBookingWithLock, getMyBookings, getVendorBookings, cancelBookingLock } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All booking actions require JWT authentication

router.post('/', createBookingWithLock);
router.post('/:id/cancel-lock', cancelBookingLock);
router.get('/my-bookings', getMyBookings);
router.get('/vendor-bookings', getVendorBookings);

module.exports = router;
