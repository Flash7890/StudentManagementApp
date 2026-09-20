import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTimetable, fetchTimetable, createTimetableEntry, deleteTimetableEntry } from '../../features/timetable/timetableSlice';
import { fetchCourses } from '../../features/courses/courseSlice';
import { fetchFaculty } from '../../features/faculty/facultySlice';
import { PageHeader, LoadingScreen, Modal, ConfirmDialog, PendingApprovalBanner } from '../../components/common';
import { useForm } from 'react-hook-form';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_COLORS = {
  Monday: 'bg-blue-50 border-blue-200 text-blue-800',
  Tuesday: 'bg-green-50 border-green-200 text-green-800',
  Wednesday: 'bg-purple-50 border-purple-200 text-purple-800',
  Thursday: 'bg-orange-50 border-orange-200 text-orange-800',
  Friday: 'bg-pink-50 border-pink-200 text-pink-800',
  Saturday: 'bg-gray-50 border-gray-200 text-gray-800',
};

const TimetablePage = () => {
  const dispatch = useDispatch();
  const { entries, loading } = useSelector((s) => s.timetable);
  const { courses } = useSelector((s) => s.courses);
  const { faculty } = useSelector((s) => s.faculty);
  const { user, profileLinked } = useSelector((s) => s.auth);

  const [addModal, setAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (profileLinked === false && user?.role === 'student') return;
    dispatch(fetchMyTimetable());
    if (user?.role === 'admin') {
      dispatch(fetchCourses({ limit: 100 }));
      dispatch(fetchFaculty({ limit: 100 }));
    }
  }, [user, profileLinked]);

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = entries.filter(e => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const onSubmit = async (data) => {
    await dispatch(createTimetableEntry(data));
    setAddModal(false);
    reset();
    dispatch(fetchMyTimetable());
  };

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteTimetableEntry(deleteId));
    setDeleting(false);
    setDeleteId(null);
  };

  if (loading) return <LoadingScreen />;

  if (user?.role === 'student' && profileLinked === false) {
    return (
      <div>
        <PageHeader title="My Timetable" />
        <div className="card"><PendingApprovalBanner title="Timetable Unavailable" /></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Timetable"
        subtitle="Weekly class schedule"
        action={user?.role === 'admin' && (
          <button onClick={() => setAddModal(true)} className="btn-primary">Add Entry</button>
        )}
      />

      {entries.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">
          <p className="text-4xl mb-2">📅</p>
          <p>No timetable entries yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS.map((day) => {
            if (byDay[day].length === 0) return null;
            return (
              <div key={day} className={`rounded-xl border p-4 ${DAY_COLORS[day]}`}>
                <h3 className="font-bold text-sm mb-3 uppercase tracking-wide">{day}</h3>
                <div className="space-y-2">
                  {byDay[day].map((e) => (
                    <div key={e._id} className="bg-white rounded-lg p-3 shadow-sm relative">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{e.course?.title}</p>
                          <p className="text-xs text-gray-400 font-mono">{e.course?.code}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {e.startTime} – {e.endTime}
                            {e.room && <span className="ml-2">· Room {e.room}</span>}
                          </p>
                          {e.faculty?.userId?.name && (
                            <p className="text-xs text-gray-400 mt-0.5">{e.faculty.userId.name}</p>
                          )}
                        </div>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => setDeleteId(e._id)}
                            className="text-gray-300 hover:text-red-500 text-lg leading-none"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Timetable Entry">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
            <select {...register('course', { required: true })} className="input-field">
              <option value="">Select course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
            <select {...register('faculty')} className="input-field">
              <option value="">Select faculty (optional)</option>
              {faculty.map(f => <option key={f._id} value={f._id}>{f.userId?.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day *</label>
              <select {...register('day', { required: true })} className="input-field">
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input {...register('room')} className="input-field" placeholder="e.g. A-101" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input {...register('startTime', { required: true })} type="time" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
              <input {...register('endTime', { required: true })} type="time" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input {...register('department')} className="input-field" placeholder="e.g. Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select {...register('semester')} className="input-field">
                <option value="">Any</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Adding...' : 'Add Entry'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Entry"
        message="Remove this timetable entry?"
      />
    </div>
  );
};

export default TimetablePage;