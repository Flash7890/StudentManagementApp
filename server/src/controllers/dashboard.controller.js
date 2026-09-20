const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const dashboardService = require('../services/dashboard.service');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const getDashboard = asyncHandler(async (req, res) => {
  let data;
  
  if (req.user.role === 'admin') {
    data = await dashboardService.getAdminDashboard();
  } else if (req.user.role === 'faculty') {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    // Safety check: Profile doesn't exist yet
    if (!faculty) {
      return res.status(200).json(new ApiResponse(200, {
        totalCourses: 0,
        studentCount: 0,
        courses: [],
        message: "Your faculty profile is incomplete. Please contact an admin."
      }, 'Dashboard fetched (Partial Profile)'));
    }
    
    data = await dashboardService.getFacultyDashboard(faculty._id);
  } else {
    // Student role
    const student = await Student.findOne({ userId: req.user._id });
    
    // Safety check: Profile doesn't exist yet
    if (!student) {
      return res.status(200).json(new ApiResponse(200, {
        enrolledCourses: 0,
        gpa: 0,
        enrollments: [],
        grades: [],
        message: "Your student profile is incomplete. Please contact an admin to set up your student ID and department."
      }, 'Dashboard fetched (Partial Profile)'));
    }
    
    data = await dashboardService.getStudentDashboard(student._id);
  }
  
  res.status(200).json(new ApiResponse(200, data, 'Dashboard fetched'));
});

module.exports = { getDashboard };