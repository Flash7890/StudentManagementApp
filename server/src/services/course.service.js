const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');

const getAllCourses = async ({ page = 1, limit = 20, department, semester, status, search, facultyId }) => {
  const query = {};
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);
  if (status) query.status = status;
  if (facultyId) query.faculty = facultyId;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate({ path: 'faculty', populate: { path: 'userId', select: 'name email' } })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Course.countDocuments(query),
  ]);

  return {
    courses,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

const getCourseById = async (id) => {
  const course = await Course.findById(id).populate({
    path: 'faculty',
    populate: { path: 'userId', select: 'name email avatar' },
  });
  if (!course) throw new ApiError(404, 'Course not found');
  return course;
};

const createCourse = async (data) => {
  const existing = await Course.findOne({ code: data.code.toUpperCase() });
  if (existing) throw new ApiError(409, 'Course code already exists');
  const course = await Course.create(data);
  return course;
};

const updateCourse = async (id, updates) => {
  if (updates.code) {
    const existing = await Course.findOne({ code: updates.code.toUpperCase(), _id: { $ne: id } });
    if (existing) throw new ApiError(409, 'Course code already exists');
  }
  const course = await Course.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!course) throw new ApiError(404, 'Course not found');
  return course;
};

const deleteCourse = async (id) => {
  const course = await Course.findById(id);
  if (!course) throw new ApiError(404, 'Course not found');
  // Remove from faculty
  await Faculty.updateMany({ assignedCourses: id }, { $pull: { assignedCourses: id } });
  await course.deleteOne();
  return course;
};

const assignFaculty = async (courseId, facultyId) => {
  const [course, faculty] = await Promise.all([
    Course.findById(courseId),
    Faculty.findById(facultyId),
  ]);
  if (!course) throw new ApiError(404, 'Course not found');
  if (!faculty) throw new ApiError(404, 'Faculty not found');

  // Remove course from previous faculty
  if (course.faculty) {
    await Faculty.findByIdAndUpdate(course.faculty, { $pull: { assignedCourses: courseId } });
  }

  course.faculty = facultyId;
  await course.save();

  if (!faculty.assignedCourses.includes(courseId)) {
    faculty.assignedCourses.push(courseId);
    await faculty.save();
  }

  return course;
};

const getCourseStudents = async (courseId) => {
  const enrollments = await Enrollment.find({ course: courseId, status: 'active' }).populate({
    path: 'student',
    populate: { path: 'userId', select: 'name email avatar' },
  });
  return enrollments;
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  assignFaculty,
  getCourseStudents,
};