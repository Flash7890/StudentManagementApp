import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTranscript } from '../../features/grades/gradeSlice';
import { PageHeader, LoadingScreen, Badge, PendingApprovalBanner } from '../../components/common';

const gradeColor = (grade) => {
  if (!grade) return 'gray';
  if (['A+','A','A-'].includes(grade)) return 'green';
  if (['B+','B','B-'].includes(grade)) return 'blue';
  if (['C+','C','C-'].includes(grade)) return 'yellow';
  return 'red';
};

const TranscriptPage = () => {
  const dispatch = useDispatch();
  const { transcript, loading } = useSelector((s) => s.grades);
  const { user, profileLinked } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user?.role === 'student' && profileLinked) dispatch(fetchMyTranscript());
  }, [user, profileLinked]);

  if (loading) return <LoadingScreen />;

  if (user?.role === 'student' && profileLinked === false) {
    return (
      <div>
        <PageHeader title="Academic Transcript" />
        <div className="card"><PendingApprovalBanner title="Transcript Unavailable" /></div>
      </div>
    );
  }

  if (!transcript) return <div className="card text-center text-gray-400 py-12">No transcript available</div>;

  const { student, semesters, overallGPA, totalCourses } = transcript;

  return (
    <div>
      <PageHeader title="Academic Transcript" />

      {/* Header Info */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{student?.userId?.name}</h2>
            <p className="text-gray-500 text-sm">{student?.userId?.email}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>ID: <strong>{student?.studentId}</strong></span>
              <span>Dept: <strong>{student?.department}</strong></span>
              <span>Program: <strong>{student?.program || '—'}</strong></span>
            </div>
          </div>
          <div className="text-center bg-primary-50 rounded-xl px-8 py-4">
            <p className="text-4xl font-bold text-primary-700">{overallGPA?.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">Overall GPA</p>
            <p className="text-xs text-gray-400">{totalCourses} courses</p>
          </div>
        </div>
      </div>

      {/* Semester-wise */}
      {semesters.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">No published grades yet</div>
      ) : (
        <div className="space-y-6">
          {semesters.map(({ semester, grades, gpa }) => (
            <div key={semester} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Semester {semester}</h3>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">{gpa.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">Semester GPA</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b">
                      <th className="pb-2 pr-4">Course</th>
                      <th className="pb-2 pr-4 text-center">Credits</th>
                      <th className="pb-2 pr-4 text-center">Total</th>
                      <th className="pb-2 pr-4 text-center">Grade</th>
                      <th className="pb-2 text-center">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {grades.map((g) => (
                      <tr key={g._id}>
                        <td className="py-2 pr-4">
                          <p className="font-medium text-gray-800">{g.course?.title}</p>
                          <p className="text-xs text-gray-400 font-mono">{g.course?.code}</p>
                        </td>
                        <td className="py-2 pr-4 text-center">{g.course?.credits}</td>
                        <td className="py-2 pr-4 text-center">{g.total ?? '—'}</td>
                        <td className="py-2 pr-4 text-center">
                          <Badge color={gradeColor(g.grade)}>{g.grade || '—'}</Badge>
                        </td>
                        <td className="py-2 text-center font-semibold">{g.gradePoints?.toFixed(1) ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranscriptPage;