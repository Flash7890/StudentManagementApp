const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Store in memory — we convert to base64 and save in DB, no disk needed
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMime = /^image\/(jpeg|jpg|png|webp)$/;
  if (allowedMime.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files (jpeg, jpg, png, webp) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
  },
});

// Call after upload.single('avatar') — attaches req.avatarBase64
const toBase64 = (req, res, next) => {
  if (req.file) {
    req.avatarBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }
  next();
};

module.exports = { upload, toBase64 };