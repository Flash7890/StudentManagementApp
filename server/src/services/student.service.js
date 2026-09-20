const Student = require('../models/Student');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const generateStudentId = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Student.countDocuments();
  return `STU${year}${String(count + 1).padStart(4, '0')}`;
};

const getAllStudents = async ({ page = 1, limit = 20, department, semester, status, search }) => {
  const query = {};
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);
  if (status) query.status = status;

  let studentIds = null;
  if (search) {
    const users = await User.find({
      role: 'student',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    const uids = users.map((u) => u._id);
    query.$or = [
      { userId: { $in: uids } },
      { studentId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [students, total] = await Promise.all([
    Student.find(query)
      .populate('userId', 'name email avatar')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Student.countDocuments(query),
  ]);

  return {
    students,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

const getStudentById = async (id) => {
  const student = await Student.findById(id).populate('userId', 'name email avatar isActive');
  if (!student) throw new ApiError(404, 'Student not found');
  return student;
};

const getStudentByUserId = async (userId) => {
  const student = await Student.findOne({ userId }).populate('userId', 'name email avatar');
  if (!student) throw new ApiError(404, 'Student profile not found');
  return student;
};

const createStudent = async (userData, studentData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ ...userData, role: 'student' });
  const studentId = await generateStudentId();

  const student = await Student.create({
    userId: user._id,
    studentId,
    ...studentData,
  });

  return { user, student };
};

const updateStudent = async (id, updates) => {
  const student = await Student.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate('userId', 'name email avatar');
  if (!student) throw new ApiError(404, 'Student not found');
  return student;
};

const deleteStudent = async (id) => {
  const student = await Student.findById(id);
  if (!student) throw new ApiError(404, 'Student not found');
  await User.findByIdAndDelete(student.userId);
  await student.deleteOne();
  return student;
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentByUserId,
  createStudent,
  updateStudent,
  deleteStudent,
};