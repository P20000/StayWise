const User = require('../models/User');
const Room = require('../models/Room');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, aiPreferenceVector, vendorLocation, phone, businessDetails, notificationPreferences, twoFactorEnabled, password } = req.body;

    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (aiPreferenceVector && Array.isArray(aiPreferenceVector)) {
      fieldsToUpdate.aiPreferenceVector = aiPreferenceVector;
    }
    if (vendorLocation !== undefined) {
      fieldsToUpdate.vendorLocation = vendorLocation;
    }
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (businessDetails !== undefined) fieldsToUpdate.businessDetails = businessDetails;
    if (notificationPreferences !== undefined) fieldsToUpdate.notificationPreferences = notificationPreferences;
    if (twoFactorEnabled !== undefined) fieldsToUpdate.twoFactorEnabled = twoFactorEnabled;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      fieldsToUpdate.password = await bcrypt.hash(password, salt);
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

exports.deleteProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (user.role === 'Vendor') {
      await Room.deleteMany({ vendor: user._id });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Account successfully deactivated and all associated listings dismantled.',
    });
  } catch (error) {
    next(error);
  }
};
