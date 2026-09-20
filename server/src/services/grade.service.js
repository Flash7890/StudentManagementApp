const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');
const { calculateGPA, getLetterGrade, GRADE_POINTS } = require('../utils/gpaCalculator');

const calculateTotal = (internal, midterm, final) => {
  // Weights: internal 20%, midterm 30%, final 50%
  return Math.round(internal * 0.2 + midterm * 0.3 + final * 0.5);
};

const assignGrade = async (studentId, courseId, { internal, midterm, final, remarks, gradedBy }) => {
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found');

  const total = calculateTotal(internal, midterm, final);
  const letter = getLetterGrade(total);
  const gradePoints = GRADE_POINTS[letter];

  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });

  const grade = await Grade.findOneAndUpdate(
    { student: studentId, course: courseId },
    {
      internal,
      midterm,
      final,
      total,
      grade: letter,
      gradePoints,
      remarks,
      gradedBy,
      enrollment: enrollment?._id,
      semester: (await Student.findById(studentId))?.semester,
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    },
    { new: true, upsert: true, runValidators: true }
  );

  return grade;
};

const publishGrades = async (courseId, actorUserId) => {
  const result = await Grade.updateMany({ course: courseId }, { $set: { isPublished: true } });

  // Notify students
  const grades = await Grade.find({ course: courseId }).populate('student', 'userId');
  const course = await Course.findById(courseId);

  const notifications = grades.map((g) => ({
    recipient: g.student.userId,
    title: 'Grades Released',
    message: `Your grade for ${course.title} has been published: ${g.grade}`,
    type: 'grade',
    link: `/grades`,
    sender: actorUserId,
  }));

  await Notification.insertMany(notifications);

  return result;
};

const getStudentGrades = async (studentId) => {
  return Grade.find({ student: studentId, isPublished: true })
    .populate('course', 'title code credits')
    .sort({ createdAt: -1 });
};

const getStudentTranscript = async (studentId) => {
  const student = await Student.findById(studentId).populate('userId', 'name email');
  if (!student) throw new ApiError(404, 'Student not found');

  const grades = await Grade.find({ student: studentId, isPublished: true })
    .populate('course', 'title code credits semester department')
    .sort({ semester: 1 });

  // Group by semester
  const bySmester = {};
  grades.forEach((g) => {
    const sem = g.semester || 'N/A';
    if (!bySmester[sem]) bySmester[sem] = [];
    bySmester[sem].push(g);
  });

  // Calculate semester GPAs
  const semesters = Object.keys(bySmester).map((sem) => {
    const gs = bySmester[sem];
    const gpa = calculateGPA(gs.map((g) => ({ grade: g.grade, credits: g.course.credits })));
    return { semester: sem, grades: gs, gpa };
  });

  const overallGPA = calculateGPA(
    grades.map((g) => ({ grade: g.grade, credits: g.course.credits }))
  );

  return { student, semesters, overallGPA, totalCourses: grades.length };
};

const getCourseGrades = async (courseId) => {
  return Grade.find({ course: courseId })
    .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
    .sort({ total: -1 });
};

module.exports = { assignGrade, publishGrades, getStudentGrades, getStudentTranscript, getCourseGrades };