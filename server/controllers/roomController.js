const Room = require('../models/Room');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

exports.getRooms = async (req, res, next) => {
  try {
    const { location, style, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    const query = {};
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

    const skip = (Number(page) - 1) * Number(limit);

    const rooms = await Room.find(query)
      .populate('vendor', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

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
