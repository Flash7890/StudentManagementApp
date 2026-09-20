import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchCourseGrades, assignGrade, publishGrades } from '../../features/grades/gradeSlice';
import { fetchCourseEnrollments } from '../../features/enrollment/enrollmentSlice';
import { fetchCourseById } from '../../features/courses/courseSlice';
import { PageHeader, LoadingScreen, Badge, Modal, ConfirmDialog } from '../../components/common';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const gradeColor = (g) => {
  if (!g) return 'gray';
  if (['A+','A','A-'].includes(g)) return 'green';
  if (['B+','B','B-'].includes(g)) return 'blue';
  if (['C+','C','C-'].includes(g)) return 'yellow';
  return 'red';
};

const CourseGradesPage = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const { courseGrades, loading } = useSelector((s) => s.grades);
  const { courseEnrollments } = useSelector((s) => s.enrollment);
  const { course } = useSelector((s) => s.courses);

  const [gradeModal, setGradeModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    dispatch(fetchCourseById(courseId));
    dispatch(fetchCourseGrades(courseId));
    dispatch(fetchCourseEnrollments(courseId));
  }, [courseId]);

  const openGradeModal = (enrollment) => {
    setSelectedStudent(enrollment);
    const existing = courseGrades.find(g => g.student?._id === enrollment.student._id);
    reset({
      internal: existing?.internal || 0,
      midterm: existing?.midterm || 0,
      final: existing?.final || 0,
      remarks: existing?.remarks || '',
    });
    setGradeModal(true);
  };

  const onGradeSubmit = async (data) => {
    await dispatch(assignGrade({
      studentId: selectedStudent.student._id,
      courseId,
      internal: Number(data.internal),
      midterm: Number(data.midterm),
      final: Number(data.final),
      remarks: data.remarks,
    }));
    setGradeModal(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    await dispatch(publishGrades(courseId));
    dispatch(fetchCourseGrades(courseId));
    setPublishing(false);
    setPublishConfirm(false);
  };

  if (loading) return <LoadingScreen />;

  const unpublishedCount = courseGrades.filter(g => !g.isPublished).length;

  return (
    <div>
      <PageHeader
        title={`Grades — ${course?.title || ''}`}
        subtitle={`${course?.code} · ${courseEnrollments.length} students enrolled`}
        action={
          unpublishedCount > 0 && (
            <button onClick={() => setPublishConfirm(true)} className="btn-primary">
              Publish {unpublishedCount} Grade{unpublishedCount > 1 ? 's' : ''}
            </button>
          )
        }
      />

      {courseEnrollments.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">No students enrolled in this course</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Student</th>
                <th className="table-header text-center">Internal</th>
                <th className="table-header text-center">Midterm</th>
                <th className="table-header text-center">Final</th>
                <th className="table-header text-center">Total</th>
                <th className="table-header text-center">Grade</th>
                <th className="table-header text-center">Published</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courseEnrollments.map((e) => {
                const grade = courseGrades.find(g => g.student?._id === e.student._id);
                return (
                  <tr key={e.student._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center">
                          {e.student?.userId?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{e.student?.userId?.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{e.student?.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-center">{grade?.internal ?? '—'}</td>
                    <td className="table-cell text-center">{grade?.midterm ?? '—'}</td>
                    <td className="table-cell text-center">{grade?.final ?? '—'}</td>
                    <td className="table-cell text-center font-semibold">{grade?.total ?? '—'}</td>
                    <td className="table-cell text-center">
                      {grade?.grade ? <Badge color={gradeColor(grade.grade)}>{grade.grade}</Badge> : '—'}
                    </td>
                    <td className="table-cell text-center">
                      {grade ? (
                        <Badge color={grade.isPublished ? 'green' : 'yellow'}>
                          {grade.isPublished ? 'Yes' : 'No'}
                        </Badge>
                      ) : '—'}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => openGradeModal(e)}
                        className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1 rounded-full font-medium"
                      >
                        {grade ? 'Edit' : 'Add'} Grade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Grade Modal */}
      <Modal open={gradeModal} onClose={() => setGradeModal(false)} title={`Assign Grade — ${selectedStudent?.student?.userId?.name}`}>
        <form onSubmit={handleSubmit(onGradeSubmit)} className="space-y-4">
          <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            Weights: Internal 20% · Midterm 30% · Final 50%
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal (0–100)</label>
              <input {...register('internal', { required: true, min: 0, max: 100 })} type="number" className="input-field" min="0" max="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Midterm (0–100)</label>
              <input {...register('midterm', { required: true, min: 0, max: 100 })} type="number" className="input-field" min="0" max="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final (0–100)</label>
              <input {...register('final', { required: true, min: 0, max: 100 })} type="number" className="input-field" min="0" max="100" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input {...register('remarks')} className="input-field" placeholder="Optional remarks..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setGradeModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={publishConfirm}
        onClose={() => setPublishConfirm(false)}
        onConfirm={handlePublish}
        loading={publishing}
        title="Publish Grades"
        message={`This will publish ${unpublishedCount} grades and notify students. This action cannot be undone.`}
        confirmText="Publish"
      />
    </div>
  );
};

export default CourseGradesPage;