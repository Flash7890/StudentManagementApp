import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../../features/courses/courseSlice';
import { fetchCourseEnrollments } from '../../features/enrollment/enrollmentSlice';
import { markAttendance } from '../../features/attendance/attendanceSlice';
import { PageHeader, LoadingScreen } from '../../components/common';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['present', 'absent', 'late'];

const MarkAttendancePage = () => {
  const dispatch = useDispatch();
  const { courses } = useSelector((s) => s.courses);
  const { courseEnrollments } = useSelector((s) => s.enrollment);
  const { user } = useSelector((s) => s.auth);
  const { myProfile: facultyProfile } = useSelector((s) => s.faculty);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses({ limit: 100 }));
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      dispatch(fetchCourseEnrollments(selectedCourse));
    }
  }, [selectedCourse]);

  useEffect(() => {
    // Initialize all to 'present'
    const init = {};
    courseEnrollments.forEach((e) => {
      init[e.student._id] = records[e.student._id] || 'present';
    });
    setRecords(init);
  }, [courseEnrollments]);

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    courseEnrollments.forEach((e) => { updated[e.student._id] = status; });
    setRecords(updated);
  };

  const handleSubmit = async () => {
    if (!selectedCourse || courseEnrollments.length === 0) {
      toast.error('Select a course with enrolled students');
      return;
    }
    setSubmitting(true);
    const recordArray = courseEnrollments.map((e) => ({
      studentId: e.student._id,
      status: records[e.student._id] || 'present',
    }));
    await dispatch(markAttendance({ courseId: selectedCourse, date, records: recordArray }));
    setSubmitting(false);
  };

  const presentCount = Object.values(records).filter(s => s === 'present').length;
  const absentCount = Object.values(records).filter(s => s === 'absent').length;
  const lateCount = Object.values(records).filter(s => s === 'late').length;

  return (
    <div>
      <PageHeader title="Mark Attendance" />

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input-field"
            >
              <option value="">Select course</option>
              {courses.filter(c => c.status === 'active').map((c) => (
                <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
          {courseEnrollments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quick Mark All</label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleMarkAll(s)}
                    className={`text-xs px-2 py-1.5 rounded font-medium capitalize
                      ${s === 'present' ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : s === 'absent' ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                  >
                    All {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCourse && courseEnrollments.length === 0 && (
        <div className="card text-center py-8 text-gray-400">No students enrolled in this course</div>
      )}

      {courseEnrollments.length > 0 && (
        <>
          {/* Summary */}
          <div className="flex gap-4 mb-4 text-sm">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Present: {presentCount}</span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">Absent: {absentCount}</span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">Late: {lateCount}</span>
          </div>

          <div className="card p-0 overflow-hidden mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header">Student ID</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courseEnrollments.map((e) => {
                  const st = e.student;
                  const status = records[st._id] || 'present';
                  return (
                    <tr key={st._id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center">
                            {st.userId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{st.userId?.name}</p>
                            <p className="text-xs text-gray-400">{st.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell font-mono text-xs">{st.studentId}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(st._id, s)}
                              className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors
                                ${status === s
                                  ? s === 'present' ? 'bg-green-500 text-white'
                                    : s === 'absent' ? 'bg-red-500 text-white'
                                    : 'bg-yellow-500 text-white'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Saving...' : 'Save Attendance'}
          </button>
        </>
      )}
    </div>
  );
};

export default MarkAttendancePage;