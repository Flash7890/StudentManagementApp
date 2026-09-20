const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const PendingRegistration = require('../models/PendingRegistration');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const generateStudentId = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Student.countDocuments();
  return `STU${year}${String(count + 1).padStart(4, '0')}`;
};

const generateFacultyId = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Faculty.countDocuments();
  return `FAC${year}${String(count + 1).padStart(4, '0')}`;
};

// GET /api/v1/registrations — admin only
const getPendingRegistrations = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const query = { emailVerified: true };
  if (status !== 'all') query.status = status;

  const [registrations, total] = await Promise.all([
    PendingRegistration.find(query)
      .populate('userId', 'name email role isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    PendingRegistration.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      registrations,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    }, 'Pending registrations fetched')
  );
});

// POST /api/v1/registrations/:id/approve — admin only
const approveRegistration = asyncHandler(async (req, res) => {
  const pending = await PendingRegistration.findById(req.params.id).populate('userId');
  if (!pending) throw new ApiError(404, 'Registration not found');
  if (pending.status === 'approved') throw new ApiError(400, 'Already approved');

  const { userId } = pending;

  // Merge admin edits over pending data
  const data = {
    department: req.body.department || pending.department,
    phone: req.body.phone || pending.phone,
    dateOfBirth: req.body.dateOfBirth || pending.dateOfBirth,
    gender: req.body.gender || pending.gender,
  };

  let result;
  if (pending.role === 'student') {
    const studentId = await generateStudentId();
    result = await Student.create({
      userId: userId._id,
      studentId,
      department: data.department,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      program: req.body.program || pending.program,
      semester: req.body.semester || pending.semester || 1,
      batch: req.body.batch || pending.batch,
      enrollmentYear: req.body.enrollmentYear || pending.enrollmentYear || new Date().getFullYear(),
      status: 'active',
    });
  } else if (pending.role === 'faculty') {
    const facultyId = await generateFacultyId();
    result = await Faculty.create({
      userId: userId._id,
      facultyId,
      department: data.department,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      designation: req.body.designation || pending.designation,
      qualification: req.body.qualification || pending.qualification,
      experience: req.body.experience || pending.experience || 0,
      joinDate: req.body.joinDate || new Date(),
      status: 'active',
    });
  }

  pending.status = 'approved';
  await pending.save();

  res.status(200).json(new ApiResponse(200, { pending, profile: result }, 'Registration approved'));
});

// PATCH /api/v1/registrations/:id/reject — admin only
const rejectRegistration = asyncHandler(async (req, res) => {
  const pending = await PendingRegistration.findById(req.params.id);
  if (!pending) throw new ApiError(404, 'Registration not found');
  if (pending.status !== 'pending') throw new ApiError(400, 'Registration already processed');

  pending.status = 'rejected';
  pending.rejectionReason = req.body.reason || 'Not specified';
  await pending.save();

  res.status(200).json(new ApiResponse(200, pending, 'Registration rejected'));
});

// GET /api/v1/registrations/count — badge count for admin
const getPendingCount = asyncHandler(async (req, res) => {
  const count = await PendingRegistration.countDocuments({ status: 'pending', emailVerified: true });
  res.status(200).json(new ApiResponse(200, { count }, 'Count fetched'));
});

module.exports = { getPendingRegistrations, approveRegistration, rejectRegistration, getPendingCount };