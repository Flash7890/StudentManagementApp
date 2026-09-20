import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import studentReducer from '../features/students/studentSlice';
import facultyReducer from '../features/faculty/facultySlice';
import courseReducer from '../features/courses/courseSlice';
import enrollmentReducer from '../features/enrollment/enrollmentSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import gradeReducer from '../features/grades/gradeSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import timetableReducer from '../features/timetable/timetableSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import registrationReducer from '../features/registrations/registrationSlice';
import aiReducer from '../features/ai/aiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    students: studentReducer,
    faculty: facultyReducer,
    courses: courseReducer,
    enrollment: enrollmentReducer,
    attendance: attendanceReducer,
    grades: gradeReducer,
    notifications: notificationReducer,
    timetable: timetableReducer,
    dashboard: dashboardReducer,
    registrations: registrationReducer,
    ai: aiReducer,
  },
});