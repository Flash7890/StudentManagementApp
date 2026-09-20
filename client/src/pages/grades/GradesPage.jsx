import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyGrades } from '../../features/grades/gradeSlice';
import { PageHeader, LoadingScreen, Badge, PendingApprovalBanner } from '../../components/common';

const gradeColor = (grade) => {
  if (!grade) return 'gray';
  if (['A+','A','A-'].includes(grade)) return 'green';
  if (['B+','B','B-'].includes(grade)) return 'blue';
  if (['C+','C','C-'].includes(grade)) return 'yellow';
  return 'red';
};

const GradesPage = () => {
  const dispatch = useDispatch();
  const { myGrades, loading } = useSelector((s) => s.grades);
  const { user, profileLinked } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user?.role === 'student' && profileLinked) dispatch(fetchMyGrades());
  }, [user, profileLinked]);

  if (loading) return <LoadingScreen />;

  if (user?.role !== 'student') {
    return (
      <div>
        <PageHeader title="Grades" subtitle="Manage student grades for your courses" />
        <div className="card">
          <p className="text-gray-500 text-sm mb-4">
            Select a course to view and manage grades.
          </p>
          <Link to="/courses" className="btn-primary inline-block">View My Courses</Link>
        </div>
      </div>
    );
  }

  if (user?.role === 'student' && profileLinked === false) {
    return (
      <div>
        <PageHeader title="My Grades" />
        <div className="card"><PendingApprovalBanner title="Grades Unavailable" /></div>
      </div>
    );
  }

  const totalCredits = myGrades.reduce((acc, g) => acc + (g.course?.credits || 0), 0);
  const totalPoints = myGrades.reduce((acc, g) => {
    const points = { 'A+': 4.0, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7,
      'C+': 2.3, C: 2.0, 'C-': 1.7, 'D+': 1.3, D: 1.0, F: 0.0 };
    return acc + (points[g.grade] || 0) * (g.course?.credits || 0);
  }, 0);
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';

  return (
    <div>
      <PageHeader
        title="My Grades"
        action={<Link to="/grades/transcript" className="btn-secondary">View Transcript</Link>}
      />

      {/* GPA Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{gpa}</p>
          <p className="text-sm text-gray-500 mt-1">Cumulative GPA</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-800">{myGrades.length}</p>
          <p className="text-sm text-gray-500 mt-1">Courses Graded</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-800">{totalCredits}</p>
          <p className="text-sm text-gray-500 mt-1">Total Credits</p>
        </div>
      </div>

      {myGrades.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📊</p>
          <p>No published grades yet</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Course</th>
                <th className="table-header">Credits</th>
                <th className="table-header">Internal</th>
                <th className="table-header">Midterm</th>
                <th className="table-header">Final</th>
                <th className="table-header">Total</th>
                <th className="table-header">Grade</th>
                <th className="table-header">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myGrades.map((g) => (
                <tr key={g._id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <p className="font-medium">{g.course?.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{g.course?.code}</p>
                  </td>
                  <td className="table-cell text-center">{g.course?.credits}</td>
                  <td className="table-cell text-center">{g.internal ?? '—'}</td>
                  <td className="table-cell text-center">{g.midterm ?? '—'}</td>
                  <td className="table-cell text-center">{g.final ?? '—'}</td>
                  <td className="table-cell text-center font-semibold">{g.total ?? '—'}</td>
                  <td className="table-cell">
                    <Badge color={gradeColor(g.grade)}>{g.grade || '—'}</Badge>
                  </td>
                  <td className="table-cell text-center font-semibold text-primary-600">
                    {g.gradePoints?.toFixed(1) ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GradesPage;