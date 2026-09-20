import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../../features/dashboard/dashboardSlice';
import { MdPeople, MdSchool, MdBook, MdTrendingUp } from 'react-icons/md';
import { StatCard, LoadingScreen, PageHeader } from '../../components/common';

// Charts loaded dynamically so a missing package never blanks the page
const useCharts = () => {
  const [charts, setCharts] = useState({ Bar: null, Doughnut: null, ready: false });
  useEffect(() => {
    Promise.all([import('chart.js'), import('react-chartjs-2')])
      .then(([cjs, rcjs]) => {
        const {
          Chart, CategoryScale, LinearScale, BarElement,
          Title, Tooltip, Legend, ArcElement,
        } = cjs;
        Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
        setCharts({ Bar: rcjs.Bar, Doughnut: rcjs.Doughnut, ready: true });
      })
      .catch(() => setCharts({ Bar: null, Doughnut: null, ready: true }));
  }, []);
  return charts;
};

const ChartPlaceholder = ({ label }) => (
  <div className="h-40 flex items-center justify-center bg-surface-subtle rounded-2xl">
    <p className="text-primary-300 text-sm">{label}</p>
  </div>
);

const AdminDashboard = ({ data }) => {
  const { Bar, Doughnut, ready } = useCharts();
  const deptLabels = (data.enrollmentByDept || []).map(d => d._id);
  const deptCounts = (data.enrollmentByDept || []).map(d => d.count);
  const statusLabels = (data.studentsByStatus || []).map(d => d._id);
  const statusCounts = (data.studentsByStatus || []).map(d => d.count);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students"    value={data.overview?.totalStudents}  icon={MdPeople}    color="blue"   />
        <StatCard title="Total Faculty"     value={data.overview?.totalFaculty}   icon={MdSchool}    color="green"  />
        <StatCard title="Active Courses"    value={data.overview?.totalCourses}   icon={MdBook}      color="purple" />
        <StatCard title="Active Enrollments" value={data.enrollments?.active}    icon={MdTrendingUp} color="orange" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-display text-lg text-primary-800 mb-4">Enrollments by Department</h3>
          {!ready ? (
            <ChartPlaceholder label="Loading chart..." />
          ) : Bar && deptLabels.length > 0 ? (
            <Bar
              data={{ labels: deptLabels, datasets: [{ label: 'Enrollments', data: deptCounts, backgroundColor: '#06b6d4', borderRadius: 6 }] }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          ) : (
            <ChartPlaceholder label="No enrollment data yet" />
          )}
        </div>
        <div className="card">
          <h3 className="font-display text-lg text-primary-800 mb-4">Student Status</h3>
          {!ready ? (
            <ChartPlaceholder label="Loading chart..." />
          ) : Doughnut && statusLabels.length > 0 ? (
            <Doughnut
              data={{
                labels: statusLabels,
                datasets: [{ data: statusCounts, backgroundColor: ['#06b6d4', '#f43f5e', '#8b5cf6', '#f59e0b'] }],
              }}
              options={{ responsive: true }}
            />
          ) : (
            <ChartPlaceholder label="No student data yet" />
          )}
        </div>
      </div>
    </div>
  );
};

const FacultyDashboard = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <StatCard title="My Courses"     value={data.totalCourses}  icon={MdBook}   color="blue"  />
      <StatCard title="Total Students" value={data.studentCount}  icon={MdPeople} color="green" />
    </div>
    <div className="card">
      <h3 className="font-display text-lg text-primary-800 mb-4">My Courses</h3>
      {data.courses?.length > 0 ? (
        <div className="space-y-2">
          {data.courses.map(c => (
            <div key={c._id} className="flex items-center justify-between p-3 bg-surface-subtle rounded-2xl">
              <div>
                <p className="font-medium text-primary-800">{c.title}</p>
                <p className="text-xs text-primary-400">{c.code} · {c.credits} credits</p>
              </div>
              <span className="badge bg-primary-50 text-primary-600">{c.department}</span>
            </div>
          ))}
        </div>
      ) : <p className="text-primary-300 text-sm">No courses assigned yet</p>}
    </div>
  </div>
);

const StudentDashboard = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard title="Enrolled Courses" value={data.enrolledCourses}        icon={MdBook}      color="blue"   />
      <StatCard title="Current GPA"      value={data.gpa?.toFixed(2) || '—'} icon={MdTrendingUp} color="green"  />
      <StatCard title="Grades Published" value={data.grades?.length}          icon={MdSchool}    color="purple" />
    </div>
    <div className="card">
      <h3 className="font-display text-lg text-primary-800 mb-4">My Courses</h3>
      {data.enrollments?.length > 0 ? (
        <div className="space-y-2">
          {data.enrollments.map(e => (
            <div key={e._id} className="flex items-center justify-between p-3 bg-surface-subtle rounded-2xl">
              <div>
                <p className="font-medium text-primary-800">{e.course?.title}</p>
                <p className="text-xs text-primary-400">{e.course?.code} · {e.course?.credits} credits</p>
              </div>
              <span className="badge bg-emerald-50 text-emerald-600 capitalize">{e.status}</span>
            </div>
          ))}
        </div>
      ) : <p className="text-primary-300 text-sm">Not enrolled in any courses yet</p>}
    </div>
  </div>
);

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(s => s.dashboard);
  const { user } = useSelector(s => s.auth);

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'User'}!`}
        subtitle={new Date().toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })}
      />
      {data && user?.role === 'admin'   && <AdminDashboard   data={data} />}
      {data && user?.role === 'faculty' && <FacultyDashboard data={data} />}
      {data && user?.role === 'student' && <StudentDashboard data={data} />}
      {!data && !loading && (
        <div className="card text-center py-16 text-primary-400">
          <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-300 text-xl font-light">—</span>
          </div>
          <p className="font-display text-lg text-primary-600">Dashboard unavailable</p>
          <p className="text-sm mt-1.5 text-primary-400 font-light">Try refreshing the page or contact support if the issue persists.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;