const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const getAllUsers = async ({ page = 1, limit = 20, role, search, isActive }) => {
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateUser = async (id, updates) => {
  const restricted = ['password', 'refreshToken', 'passwordResetToken'];
  restricted.forEach((f) => delete updates[f]);

  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateProfile = async (userId, updates, avatarPath) => {
  const allowed = ['name'];
  const filtered = {};
  allowed.forEach((f) => { if (updates[f] !== undefined) filtered[f] = updates[f]; });
  if (avatarPath) filtered.avatar = avatarPath;

  const user = await User.findByIdAndUpdate(userId, filtered, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(400, 'Current password incorrect');

  user.password = newPassword;
  await user.save();
  return user;
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, updateProfile, changePassword };