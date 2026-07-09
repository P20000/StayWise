const User = require('../models/User');

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, aiPreferenceVector, vendorLocation } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (aiPreferenceVector && Array.isArray(aiPreferenceVector)) {
      fieldsToUpdate.aiPreferenceVector = aiPreferenceVector;
    }
    if (vendorLocation) {
      fieldsToUpdate.vendorLocation = vendorLocation;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
