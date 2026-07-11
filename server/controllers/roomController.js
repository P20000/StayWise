const Room = require('../models/Room');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

exports.getRooms = async (req, res, next) => {
  try {
    const { location, style, minPrice, maxPrice, latitude, longitude, maxDistance, vendor, page = 1, limit = 12 } = req.query;

    const query = {};
    if (vendor) {
      query.vendor = vendor;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (style) {
      query.architecturalStyle = { $regex: style, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }
    if (latitude && longitude) {
      query.locationCoordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: Number(maxDistance) || 500000, // 500km default
        },
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    let roomsQuery = Room.find(query).populate('vendor', 'name email');

    if (latitude && longitude) {
      roomsQuery = roomsQuery.skip(skip).limit(Number(limit));
    } else {
      roomsQuery = roomsQuery.skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    }

    const rooms = await roomsQuery;
    const total = await Room.countDocuments(query);

    res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRoomBySlug = async (req, res, next) => {
  try {
    const room = await Room.findOne({ slug: req.params.slug }).populate('vendor', 'name email');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: '[ROOM_NOT_FOUND] No architectural suite matches the specified slug.',
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    // Rule #9: Stream memory buffer straight to Cloudinary without writing local file
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'staywise_listings',
            resource_type: 'image',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    };

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    } else if (req.body.imageUrls) {
      // Allow passing direct URL strings for testing/seeding
      const urls = Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [req.body.imageUrls];
      uploadedImages = urls.map((url, i) => ({
        url,
        public_id: `staywise_seed_${Date.now()}_${i}`,
      }));
    }

    const slug =
      req.body.slug ||
      req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const roomData = {
      ...req.body,
      vendor: req.user.id,
      slug,
      images: uploadedImages.length > 0 ? uploadedImages : [{
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        public_id: 'staywise_placeholder',
      }],
      amenities: typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities,
      locationCoordinates: req.body.locationCoordinates
        ? (typeof req.body.locationCoordinates === 'string' ? JSON.parse(req.body.locationCoordinates) : req.body.locationCoordinates)
        : undefined,
      roomTiers: req.body.roomTiers
        ? (typeof req.body.roomTiers === 'string' ? JSON.parse(req.body.roomTiers) : req.body.roomTiers)
        : undefined,
    };

    const room = await Room.create(roomData);

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: '[ROOM_NOT_FOUND] Room listing does not exist.'
      });
    }

    // Restrict update to room owner (Vendor) or Admin
    if (room.vendor.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: '[RBAC_DENIED] You do not have permissions to modify this listing.'
      });
    }

    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'staywise_listings',
            resource_type: 'image',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    };

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // Parse coordinates and amenities if supplied as strings
    let updatedData = { ...req.body };
    if (req.body.amenities) {
      updatedData.amenities = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities;
    }
    if (uploadedImages.length > 0) {
      updatedData.images = uploadedImages;
    }

    if (req.body.locationCoordinates) {
      updatedData.locationCoordinates = typeof req.body.locationCoordinates === 'string'
        ? JSON.parse(req.body.locationCoordinates)
        : req.body.locationCoordinates;
    }

    if (req.body.roomTiers) {
      updatedData.roomTiers = typeof req.body.roomTiers === 'string'
        ? JSON.parse(req.body.roomTiers)
        : req.body.roomTiers;
    }

    // Re-generate slug if title is modified
    if (req.body.title && req.body.title !== room.title) {
      updatedData.slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    room = await Room.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: '[ROOM_NOT_FOUND] Room listing does not exist.'
      });
    }

    // Restrict delete to room owner (Vendor) or Admin
    if (room.vendor.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: '[RBAC_DENIED] You do not have permissions to delete this listing.'
      });
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: '[ROOM_DELETED] Room listing deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
