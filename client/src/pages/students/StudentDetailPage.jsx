import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchStudentById } from '../../features/students/studentSlice';
import { fetchStudentEnrollments } from '../../features/enrollment/enrollmentSlice';
import { LoadingScreen, Badge, statusColor, PageHeader } from '../../components/common';

const StudentDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { student, loading } = useSelector((s) => s.students);
  const { studentEnrollments } = useSelector((s) => s.enrollment);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchStudentById(id));
    dispatch(fetchStudentEnrollments(id));
  }, [id]);

  if (loading || !student) return <LoadingScreen />;

  const s = student;

  return (
    <div>
      <PageHeader
        title="Student Profile"
        action={
          user?.role === 'admin' && (
            <Link to={`/students/${id}/edit`} className="btn-primary">Edit Student</Link>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Personal */}
        <div className="card space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-3xl font-bold mx-auto mb-3">
              {s.userId?.name?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{s.userId?.name}</h2>
            <p className="text-gray-500 text-sm">{s.userId?.email}</p>
            <div className="mt-2">
              <Badge color={statusColor(s.status)}>{s.status}</Badge>
            </div>
          </div>
          <div className="border-t pt-4 space-y-3">
            {[
              ['Student ID', s.studentId],
              ['Department', s.department],
              ['Program', s.program || '—'],
              ['Semester', s.semester],
              ['Batch', s.batch || '—'],
              ['CGPA', s.cgpa?.toFixed(2) || '—'],
              ['Phone', s.phone || '—'],
              ['Gender', s.gender || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Enrollments */}
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-800 mb-4">Enrolled Courses</h3>
          {studentEnrollments.length === 0 ? (
            <p className="text-gray-400 text-sm">No enrollments yet</p>
          ) : (
            <div className="space-y-2">
              {studentEnrollments.map((e) => (
                <div key={e._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{e.course?.title}</p>
                    <p className="text-xs text-gray-500">{e.course?.code} · {e.course?.credits} credits</p>
                  </div>
                  <Badge color={statusColor(e.status)}>{e.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;