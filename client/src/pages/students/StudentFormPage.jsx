import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { createStudent, updateStudent, fetchStudentById } from '../../features/students/studentSlice';
import { PageHeader, LoadingScreen } from '../../components/common';

const DEPARTMENTS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];

const StudentFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { student, loading } = useSelector((s) => s.students);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (isEdit) dispatch(fetchStudentById(id));
  }, [id]);

  useEffect(() => {
    if (isEdit && student) {
      reset({
        name: student.userId?.name,
        email: student.userId?.email,
        department: student.department,
        semester: student.semester,
        program: student.program,
        batch: student.batch,
        phone: student.phone,
        gender: student.gender,
        status: student.status,
      });
    }
  }, [student, isEdit]);

  const onSubmit = async (data) => {
    if (isEdit) {
      const result = await dispatch(updateStudent({ id, data }));
      if (!result.error) navigate(`/students/${id}`);
    } else {
      const result = await dispatch(createStudent(data));
      if (!result.error) navigate('/students');
    }
  };

  if (isEdit && loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Student' : 'Add New Student'} />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="card space-y-5">
          <h3 className="font-semibold text-gray-700 border-b pb-2">Account Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input {...register('name', { required: 'Required' })} className="input-field" placeholder="John Doe" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input {...register('email', { required: 'Required' })} type="email" className="input-field" placeholder="student@university.edu" disabled={isEdit} />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input {...register('password', { required: !isEdit && 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} type="password" className="input-field" placeholder="Min 8 characters" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}

          <h3 className="font-semibold text-gray-700 border-b pb-2 pt-2">Academic Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select {...register('department', { required: 'Required' })} className="input-field">
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select {...register('semester')} className="input-field">
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <input {...register('program')} className="input-field" placeholder="e.g. B.Tech" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <input {...register('batch')} className="input-field" placeholder="e.g. 2022-2026" />
            </div>
          </div>

          <h3 className="font-semibold text-gray-700 border-b pb-2 pt-2">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} className="input-field" placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select {...register('gender')} className="input-field">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...register('status')} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Student' : 'Create Student'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentFormPage;