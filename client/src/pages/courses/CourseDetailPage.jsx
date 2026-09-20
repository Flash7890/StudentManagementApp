import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  fetchCourses, fetchCourseById, createCourse, updateCourse,
  deleteCourse, assignFacultyToCourse,
} from '../../features/courses/courseSlice';
import { fetchFaculty } from '../../features/faculty/facultySlice';
import { enrollInCourse } from '../../features/enrollment/enrollmentSlice';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdPersonAdd } from 'react-icons/md';
import {
  PageHeader, SearchBar, Badge, Pagination, LoadingScreen,
  ConfirmDialog, EmptyState, Modal, statusColor,
} from '../../components/common';

const DEPARTMENTS = ['Computer Science','Electrical Engineering','Mechanical Engineering',
  'Civil Engineering','Business Administration','Mathematics','Physics','Chemistry','Biology'];

export const CourseDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { course, loading } = useSelector((s) => s.courses);
  const { faculty } = useSelector((s) => s.faculty);
  const { user } = useSelector((s) => s.auth);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    dispatch(fetchCourseById(id));
    if (user?.role === 'admin') dispatch(fetchFaculty({ limit: 100 }));
  }, [id]);

  const handleAssign = async () => {
    if (!selectedFaculty) return;
    setAssigning(true);
    await dispatch(assignFacultyToCourse({ id, facultyId: selectedFaculty }));
    dispatch(fetchCourseById(id));
    setAssigning(false);
    setAssignModal(false);
  };

  if (loading || !course) return <LoadingScreen />;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div>
      <PageHeader
        title={course.title}
        subtitle={`${course.code} · ${course.department}`}
        action={
          <div className="flex gap-2">
            {user?.role === 'admin' && (
              <>
                <button onClick={() => setAssignModal(true)} className="btn-secondary">Assign Faculty</button>
                <Link to={`/courses/${id}/edit`} className="btn-primary">Edit</Link>
              </>
            )}
            {user?.role === 'faculty' && (
              <Link to={`/grades/course/${id}`} className="btn-primary">Manage Grades</Link>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-800">Course Details</h3>
          {[['Code', course.code], ['Credits', course.credits], ['Department', course.department],
            ['Semester', course.semester || '—'], ['Max Students', course.maxStudents],
            ['Status', course.status], ['Faculty', course.faculty?.userId?.name || 'Unassigned']].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span className="text-gray-500">{l}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
          {course.description && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{course.description}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-800 mb-4">Weekly Schedule</h3>
          {course.schedule?.length > 0 ? (
            <div className="space-y-2">
              {course.schedule.map((slot, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-primary-700 w-24">{slot.day}</span>
                  <span className="text-sm text-gray-600">{slot.startTime} – {slot.endTime}</span>
                  {slot.room && <span className="text-xs text-gray-400">Room: {slot.room}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No schedule set</p>
          )}
        </div>
      </div>

      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Faculty">
        <div className="space-y-4">
          <select value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)} className="input-field">
            <option value="">Select faculty member</option>
            {faculty.map(f => (
              <option key={f._id} value={f._id}>{f.userId?.name} — {f.department}</option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <button onClick={() => setAssignModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAssign} disabled={assigning || !selectedFaculty} className="btn-primary">
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;