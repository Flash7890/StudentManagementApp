const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth.validator');

router.post('/register', registerValidator, validate, ctrl.register);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/resend-otp', ctrl.resendOtp);
router.post('/login', loginValidator, validate, ctrl.login);
router.post('/logout', protect, ctrl.logout);
router.post('/refresh-token', ctrl.refreshToken);
router.post('/forgot-password', forgotPasswordValidator, validate, ctrl.forgotPassword);
router.patch('/reset-password/:token', resetPasswordValidator, validate, ctrl.resetPassword);
router.get('/me', protect, ctrl.getMe);

module.exports = router;