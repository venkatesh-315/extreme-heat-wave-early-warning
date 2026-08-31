const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Get Profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, user.toPublicJSON(), 'User profile retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * Update Profile / Preferences
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferredLocation, preferredLocationName, alertSettings, department, title } = req.body;
    const user = await User.findById(req.user._id || req.user.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (department) user.department = department;
    if (title) user.title = title;
    if (preferredLocation) user.preferredLocation = preferredLocation;
    if (preferredLocationName) user.preferredLocationName = preferredLocationName;
    if (alertSettings) {
      user.alertSettings = {
        ...user.alertSettings,
        ...alertSettings,
      };
    }

    await user.save();

    return successResponse(res, user.toPublicJSON(), 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * List all users (Admin/Authority only)
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return successResponse(res, users, 'Users retrieved successfully', 200, { count: users.length });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
};
