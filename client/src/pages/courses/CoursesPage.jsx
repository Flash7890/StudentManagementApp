import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchCourses,
  deleteCourse,
} from '../../features/courses/courseSlice';
import { fetchMyStudentProfile } from '../../features/students/studentSlice';
import { enrollInCourse } from '../../features/enrollment/enrollmentSlice';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdPersonAdd } from 'react-icons/md';
import {
  PageHeader, SearchBar, Badge, Pagination, LoadingScreen,
  ConfirmDialog, EmptyState, statusColor, PendingApprovalBanner,
} from '../../components/common';

const DEPARTMENTS = ['Computer Science','Electrical Engineering','Mechanical Engineering',
  'Civil Engineering','Business Administration','Mathematics','Physics','Chemistry','Biology'];

export const CoursesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, pagination, loading } = useSelector((s) => s.courses);
  const { user, profileLinked } = useSelector((s) => s.auth);
  const { myProfile } = useSelector((s) => s.students);

  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [enrollId, setEnrollId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Only fetch courses if student is registered (profileLinked=true) or non-student role
  const load = useCallback(() => {
    if (user?.role === 'student' && !profileLinked) return;
    dispatch(fetchCourses({ page, search, department: dept }));
  }, [page, search, dept, user, profileLinked]);

  useEffect(() => { load(); }, [load]);

  // Only fetch student profile if registered
  useEffect(() => {
    if (user?.role === 'student' && profileLinked) dispatch(fetchMyStudentProfile());
  }, [user, profileLinked]);

  // Show banner for unregistered students — no API calls have fired at this point
  if (user?.role === 'student' && profileLinked === false) {
    return (
      <div>
        <PageHeader title="Courses" />
        <div className="card"><PendingApprovalBanner title="Courses Unavailable" /></div>
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteCourse(deleteId));
    setDeleting(false);
    setDeleteId(null);
  };

  const handleEnroll = async () => {
    if (!myProfile) return;
    setEnrolling(true);
    await dispatch(enrollInCourse({ studentId: myProfile._id, courseId: enrollId }));
    setEnrolling(false);
    setEnrollId(null);
  };

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle={`${pagination?.total ?? 0} courses`}
        action={user?.role === 'admin' && (
          <Link to="/courses/new" className="btn-primary flex items-center gap-2">
            <MdAdd size={18} /> Add Course
          </Link>
        )}
      />
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search courses..." />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }} className="input-field max-w-[200px]">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? <LoadingScreen /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.length === 0 ? (
            <div className="col-span-full"><EmptyState title="No courses found" /></div>
          ) : courses.map(c => (
            <div key={c._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{c.code}</p>
                </div>
                <Badge color="blue">{c.credits} cr</Badge>
              </div>
              <p className="text-sm text-gray-500 mb-3">{c.department}</p>
              <p className="text-xs text-gray-400">
                Faculty: {c.faculty?.userId?.name || <span className="italic">Unassigned</span>}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <Badge color={statusColor(c.status)}>{c.status}</Badge>
                <div className="flex gap-1">
                  <button onClick={() => navigate(`/courses/${c._id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                    <MdVisibility size={16} />
                  </button>
                  {user?.role === 'student' && c.status === 'active' && (
                    <button onClick={() => setEnrollId(c._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Enroll">
                      <MdPersonAdd size={16} />
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <button onClick={() => navigate(`/courses/${c._id}/edit`)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"><MdEdit size={16} /></button>
                      <button onClick={() => setDeleteId(c._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><MdDelete size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Course" message="Are you sure you want to delete this course?" />
      <ConfirmDialog open={!!enrollId} onClose={() => setEnrollId(null)} onConfirm={handleEnroll} loading={enrolling} title="Enroll in Course" message="Confirm enrollment in this course?" confirmText="Enroll" />
    </div>
  );
};

export default CoursesPage;