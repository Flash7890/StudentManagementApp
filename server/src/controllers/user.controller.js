const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Users fetched'));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User fetched'));
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, user, 'User updated'));
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'User deleted'));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  res.status(200).json(new ApiResponse(200, user, 'Profile fetched'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const avatarPath = req.avatarBase64 || undefined;
  const user = await userService.updateProfile(req.user._id, req.body, avatarPath);
  res.status(200).json(new ApiResponse(200, user, 'Profile updated'));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user._id, currentPassword, newPassword);
  res.status(200).json(new ApiResponse(200, null, 'Password changed'));
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword,
};