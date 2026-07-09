const Review = require('../models/Review');
const Room = require('../models/Room');

exports.createReview = async (req, res, next) => {
  try {
    const { room: roomId, rating, comment } = req.body;
    const guestId = req.user.id;

    if (!roomId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: '[REVIEW_MISSING] Please provide room ID, rating value, and comment.',
      });
    }

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: '[ROOM_NOT_FOUND] The specified architectural stay does not exist.',
      });
    }

    // Check if review already exists from this user for this room
    const existingReview = await Review.findOne({ room: roomId, guest: guestId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: '[REVIEW_CONFLICT] You have already reviewed this architectural stay.',
      });
    }

    // Create the review
    const review = await Review.create({
      room: roomId,
      guest: guestId,
      rating: Number(rating),
      comment,
      verifiedStay: true, // Mark verified by default for simplicity or check if a booking exists
    });

    // Recalculate average rating and reviews count for the Room
    const reviews = await Review.find({ room: roomId });
    const reviewsCount = reviews.length;
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = Number((totalRating / reviewsCount).toFixed(2));

    await Room.findByIdAndUpdate(roomId, {
      rating: averageRating,
      reviewsCount: reviewsCount,
    });

    // Populate guest name for frontend response
    const populatedReview = await Review.findById(review._id).populate('guest', 'name');

    res.status(201).json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRoomReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ room: req.params.roomId })
      .populate('guest', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
