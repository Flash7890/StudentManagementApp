import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './features/auth/authSlice';
import { connectSocket, disconnectSocket } from './services/socket';
import { addNotification } from './features/notifications/notificationSlice';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Lazy-loaded pages — one bad import never crashes the whole app
const LoginPage        = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage    = lazy(() => import('./pages/auth/VerifyEmailPage'));
const DashboardPage    = lazy(() => import('./pages/dashboard/DashboardPage'));
const StudentsPage     = lazy(() => import('./pages/students/StudentsPage'));
const StudentDetailPage = lazy(() => import('./pages/students/StudentDetailPage'));
const StudentFormPage  = lazy(() => import('./pages/students/StudentFormPage'));
const FacultyPage      = lazy(() => import('./pages/faculty/FacultyPage'));
const FacultyDetailPage = lazy(() => import('./pages/faculty/FacultyDetailPage'));
const FacultyFormPage  = lazy(() => import('./pages/faculty/FacultyFormPage'));
const CoursesPage      = lazy(() => import('./pages/courses/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/courses/CourseDetailPage'));
const CourseFormPage   = lazy(() => import('./pages/courses/CourseFormPage'));
const AttendancePage   = lazy(() => import('./pages/attendance/AttendancePage'));
const MarkAttendancePage = lazy(() => import('./pages/attendance/MarkAttendancePage'));
const GradesPage       = lazy(() => import('./pages/grades/GradesPage'));
const TranscriptPage   = lazy(() => import('./pages/grades/TranscriptPage'));
const CourseGradesPage = lazy(() => import('./pages/grades/CourseGradesPage'));
const TimetablePage    = lazy(() => import('./pages/timetable/TimetablePage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const ProfilePage      = lazy(() => import('./pages/profile/ProfilePage'));
const PendingRegistrationsPage = lazy(() => import('./pages/admin/PendingRegistrationsPage'));
const AssistantPage    = lazy(() => import('./pages/ai/AssistantPage'));

// Per-route loading spinner
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
  </div>
);

// Wrap each lazy route safely
const SafePage = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

function App() {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((s) => s.auth);

  useEffect(() => {
    if (accessToken) dispatch(getMe());
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (!user?._id) return;
    let socket;
    try {
      socket = connectSocket(user._id);
      socket.on('notification', (data) => dispatch(addNotification(data)));
    } catch (e) {
      console.warn('Socket connection failed:', e);
    }
    return () => { try { disconnectSocket(); } catch {} };
  }, [user?._id, dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"          element={<SafePage>{!user ? <LoginPage /> : <Navigate to="/dashboard" />}</SafePage>} />
      <Route path="/register"       element={<SafePage>{!user ? <RegisterPage /> : <Navigate to="/dashboard" />}</SafePage>} />
      <Route path="/forgot-password" element={<SafePage><ForgotPasswordPage /></SafePage>} />
      <Route path="/reset-password/:token" element={<SafePage><ResetPasswordPage /></SafePage>} />
      <Route path="/verify-email" element={<SafePage><VerifyEmailPage /></SafePage>} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard"    element={<SafePage><DashboardPage /></SafePage>} />
          <Route path="/profile"      element={<SafePage><ProfilePage /></SafePage>} />
          <Route path="/notifications" element={<SafePage><NotificationsPage /></SafePage>} />
          <Route path="/assistant"    element={<SafePage><AssistantPage /></SafePage>} />
          <Route path="/timetable"    element={<SafePage><TimetablePage /></SafePage>} />
          <Route path="/attendance"   element={<SafePage><AttendancePage /></SafePage>} />
          <Route path="/grades"       element={<SafePage><GradesPage /></SafePage>} />
          <Route path="/grades/transcript" element={<SafePage><TranscriptPage /></SafePage>} />
          <Route path="/courses"      element={<SafePage><CoursesPage /></SafePage>} />
          <Route path="/courses/:id"  element={<SafePage><CourseDetailPage /></SafePage>} />

          {/* Admin + Faculty */}
          <Route element={<RoleRoute roles={['admin', 'faculty']} />}>
            <Route path="/students"              element={<SafePage><StudentsPage /></SafePage>} />
            <Route path="/students/:id"          element={<SafePage><StudentDetailPage /></SafePage>} />
            <Route path="/faculty"               element={<SafePage><FacultyPage /></SafePage>} />
            <Route path="/faculty/:id"           element={<SafePage><FacultyDetailPage /></SafePage>} />
            <Route path="/attendance/mark"       element={<SafePage><MarkAttendancePage /></SafePage>} />
            <Route path="/grades/course/:courseId" element={<SafePage><CourseGradesPage /></SafePage>} />
          </Route>

          {/* Admin only */}
          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/registrations"        element={<SafePage><PendingRegistrationsPage /></SafePage>} />
            <Route path="/students/new"         element={<SafePage><StudentFormPage /></SafePage>} />
            <Route path="/students/:id/edit"    element={<SafePage><StudentFormPage /></SafePage>} />
            <Route path="/faculty/new"          element={<SafePage><FacultyFormPage /></SafePage>} />
            <Route path="/faculty/:id/edit"     element={<SafePage><FacultyFormPage /></SafePage>} />
            <Route path="/courses/new"          element={<SafePage><CourseFormPage /></SafePage>} />
            <Route path="/courses/:id/edit"     element={<SafePage><CourseFormPage /></SafePage>} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;