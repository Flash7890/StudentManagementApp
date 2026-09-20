const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, phone, dateOfBirth, gender, program, semester, batch, designation, qualification, experience } = req.body;
  const { user } = await authService.register({ name, email, password, role, department, phone, dateOfBirth, gender, program, semester, batch, designation, qualification, experience });
  res.status(201).json(new ApiResponse(201, { user }, 'Registration successful. Please check your email to verify your account.'));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { user, accessToken, refreshToken, profileLinked } = await authService.verifyEmail({ email, otp });
  res
    .status(200)
    .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json(new ApiResponse(200, { user, accessToken, refreshToken, profileLinked }, 'Email verified successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken, profileLinked } = await authService.login({ email, password });
  res
    .status(200)
    .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json(new ApiResponse(200, { user, accessToken, refreshToken, profileLinked }, 'Login successful'));
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  res
    .status(200)
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const { accessToken, refreshToken: newRefresh } = await authService.refreshAccessToken(token);
  res
    .status(200)
    .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie('refreshToken', newRefresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json(new ApiResponse(200, { accessToken, refreshToken: newRefresh }, 'Token refreshed'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const resetUrlBase = `${process.env.CLIENT_URL}/reset-password`;
  await authService.forgotPassword(req.body.email, resetUrlBase);
  res.status(200).json(new ApiResponse(200, null, 'Password reset email sent'));
});

const resetPassword = asyncHandler(async (req, res) => {
  const user = await authService.resetPassword(req.params.token, req.body.password);
  res.status(200).json(new ApiResponse(200, user, 'Password reset successful'));
});

const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const Student = require('../models/Student');
  const Faculty = require('../models/Faculty');
  let profileLinked = true;
  if (user.role === 'student') profileLinked = !!(await Student.findOne({ userId: user._id }));
  else if (user.role === 'faculty') profileLinked = !!(await Faculty.findOne({ userId: user._id }));
  res.status(200).json(new ApiResponse(200, { ...user.toJSON(), profileLinked }, 'User fetched'));
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.resendOtp(email);
  res.status(200).json(new ApiResponse(200, null, 'OTP resent successfully'));
});

module.exports = { register, verifyEmail, login, logout, refreshToken, forgotPassword, resetPassword, getMe, resendOtp };