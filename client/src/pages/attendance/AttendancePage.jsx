import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyAttendanceSummary } from '../../features/attendance/attendanceSlice';
import { PageHeader, LoadingScreen, Badge, PendingApprovalBanner } from '../../components/common';

const AttendancePage = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((s) => s.attendance);
  const { user, profileLinked } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user?.role === 'student' && profileLinked) dispatch(fetchMyAttendanceSummary());
  }, [user, profileLinked]);

  if (loading) return <LoadingScreen />;

  if (user?.role === 'student' && profileLinked === false) {
    return (
      <div>
        <PageHeader title="My Attendance" />
        <div className="card"><PendingApprovalBanner title="Attendance Unavailable" /></div>
      </div>
    );
  }

  if (user?.role === 'faculty' || user?.role === 'admin') {
    return (
      <div>
        <PageHeader
          title="Attendance"
          action={
            <Link to="/attendance/mark" className="btn-primary">Mark Attendance</Link>
          }
        />
        <div className="card">
          <p className="text-gray-500 text-sm">
            Select a course to view or mark attendance. Use the button above to mark attendance for a class.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Attendance" subtitle="Attendance summary across all enrolled courses" />

      {summary.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📋</p>
          <p>No attendance records yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {summary.map((item) => {
            const pct = item.percentage;
            const color = pct >= 75 ? 'green' : pct >= 60 ? 'yellow' : 'red';
            const barColor = pct >= 75 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';

            return (
              <div key={item.course._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.course.title}</h3>
                    <p className="text-xs text-gray-400 font-mono">{item.course.code}</p>
                  </div>
                  <Badge color={color}>{pct}%</Badge>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="font-bold text-gray-800">{item.total}</p>
                    <p className="text-gray-400">Total</p>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <p className="font-bold text-green-700">{item.present}</p>
                    <p className="text-gray-400">Present</p>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <p className="font-bold text-red-700">{item.total - item.present}</p>
                    <p className="text-gray-400">Absent</p>
                  </div>
                </div>

                {pct < 75 && (
                  <p className="text-xs text-red-500 mt-3 bg-red-50 rounded p-2">
                    ⚠️ Below 75% attendance threshold
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;