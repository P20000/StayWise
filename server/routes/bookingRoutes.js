const express = require('express');
const { createBookingWithLock, getMyBookings, getVendorBookings } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All booking actions require JWT authentication

router.post('/', createBookingWithLock);
router.get('/my-bookings', getMyBookings);
router.get('/vendor-bookings', getVendorBookings);

module.exports = router;
