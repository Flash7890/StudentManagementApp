const Faculty = require('../models/Faculty');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');

const generateFacultyId = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Faculty.countDocuments();
  return `FAC${year}${String(count + 1).padStart(4, '0')}`;
};

const getAllFaculty = async ({ page = 1, limit = 20, department, status, search }) => {
  const query = {};
  if (department) query.department = department;
  if (status) query.status = status;

  if (search) {
    const users = await User.find({
      role: 'faculty',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    query.$or = [
      { userId: { $in: users.map((u) => u._id) } },
      { facultyId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [faculty, total] = await Promise.all([
    Faculty.find(query)
      .populate('userId', 'name email avatar')
      .populate('assignedCourses', 'title code')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Faculty.countDocuments(query),
  ]);

  return {
    faculty,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

const getFacultyById = async (id) => {
  const faculty = await Faculty.findById(id)
    .populate('userId', 'name email avatar isActive')
    .populate('assignedCourses', 'title code credits department');
  if (!faculty) throw new ApiError(404, 'Faculty not found');
  return faculty;
};

const getFacultyByUserId = async (userId) => {
  const faculty = await Faculty.findOne({ userId })
    .populate('userId', 'name email avatar')
    .populate('assignedCourses', 'title code credits');
  if (!faculty) throw new ApiError(404, 'Faculty profile not found');
  return faculty;
};

const createFaculty = async (userData, facultyData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ ...userData, role: 'faculty' });
  const facultyId = await generateFacultyId();

  const faculty = await Faculty.create({
    userId: user._id,
    facultyId,
    ...facultyData,
  });

  return { user, faculty };
};

const updateFaculty = async (id, updates) => {
  const faculty = await Faculty.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate('userId', 'name email avatar');
  if (!faculty) throw new ApiError(404, 'Faculty not found');
  return faculty;
};

const deleteFaculty = async (id) => {
  const faculty = await Faculty.findById(id);
  if (!faculty) throw new ApiError(404, 'Faculty not found');
  await User.findByIdAndDelete(faculty.userId);
  await faculty.deleteOne();
  return faculty;
};

const getFacultyStudents = async (facultyId) => {
  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw new ApiError(404, 'Faculty not found');

  const enrollments = await Enrollment.find({
    course: { $in: faculty.assignedCourses },
    status: 'active',
  })
    .populate({ path: 'student', populate: { path: 'userId', select: 'name email avatar' } })
    .populate('course', 'title code');

  return enrollments;
};

module.exports = {
  getAllFaculty,
  getFacultyById,
  getFacultyByUserId,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyStudents,
};