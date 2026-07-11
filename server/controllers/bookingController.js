const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { getRedisClient } = require('../config/redis');

// Rule #6: Stateless High-Concurrency Slot Locking
// Ensures two guests attempting to book the exact same room & date range simultaneously
// are governed by atomic Redis lock keys before writing to MongoDB.
exports.createBookingWithLock = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate, totalAmount } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: '[BOOKING_ERROR] Room ID and check-in/out dates are required.',
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: '[ROOM_NOT_FOUND] Target suite no longer exists.',
      });
    }

    // Generate atomic lock key for the date window
    const lockKey = `lock:room:${roomId}:${new Date(checkInDate).toISOString().slice(0, 10)}`;
    const redis = getRedisClient();

    // Try to acquire distributed lock with 15-minute TTL (`SETNX lockKey userId EX 900`)
    const acquired = await redis.setNX(lockKey, req.user.id);
    if (!acquired) {
      return res.status(409).json({
        success: false,
        message: '[CONCURRENCY_LOCK] This suite slot is currently being reserved by another guest. Please try again in 15 minutes or select alternative dates.',
      });
    }

    // Set TTL explicitly for our memory fallback / redis pool
    await redis.set(lockKey, req.user.id, { EX: 900 });

    const booking = await Booking.create({
      guest: req.user.id,
      room: roomId,
      checkInDate,
      checkOutDate,
      totalAmount: totalAmount || room.basePrice,
      status: 'PENDING_SLOT_LOCK',
      lockExpiry: new Date(Date.now() + 15 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      message: '[SLOT_LOCKED] Room slot successfully locked for 15 minutes pending payment finalization.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user.id })
      .populate('room', 'title location basePrice images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

exports.getVendorBookings = async (req, res, next) => {
  try {
    const vendorRooms = await Room.find({ vendor: req.user.id });
    const roomIds = vendorRooms.map(r => r._id);
    
    const bookings = await Booking.find({ room: { $in: roomIds } })
      .populate('room', 'title location basePrice images')
      .populate('guest', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
