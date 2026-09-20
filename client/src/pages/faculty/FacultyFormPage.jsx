import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  fetchFaculty, fetchFacultyById, createFaculty, updateFaculty, deleteFaculty,
} from '../../features/faculty/facultySlice';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import {
  PageHeader, SearchBar, Badge, Pagination, LoadingScreen,
  ConfirmDialog, EmptyState, statusColor,
} from '../../components/common';

const DEPARTMENTS = ['Computer Science','Electrical Engineering','Mechanical Engineering',
  'Civil Engineering','Business Administration','Mathematics','Physics','Chemistry','Biology'];
  
export const FacultyFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { member, loading } = useSelector((s) => s.faculty);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => { if (isEdit) dispatch(fetchFacultyById(id)); }, [id]);
  useEffect(() => {
    if (isEdit && member) {
      reset({ name: member.userId?.name, email: member.userId?.email, department: member.department,
        designation: member.designation, qualification: member.qualification, experience: member.experience, phone: member.phone, status: member.status });
    }
  }, [member, isEdit]);

  const onSubmit = async (data) => {
    const result = isEdit
      ? await dispatch(updateFaculty({ id, data }))
      : await dispatch(createFaculty(data));
    if (!result.error) navigate(isEdit ? `/faculty/${id}` : '/faculty');
  };

  if (isEdit && loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Faculty' : 'Add Faculty'} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input {...register('name', { required: 'Required' })} className="input-field" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input {...register('email', { required: 'Required' })} type="email" className="input-field" disabled={isEdit} />
            </div>
            {!isEdit && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input {...register('password', { required: !isEdit && 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} type="password" className="input-field" />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select {...register('department', { required: 'Required' })} className="input-field">
                <option value="">Select</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input {...register('designation')} className="input-field" placeholder="e.g. Assistant Professor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input {...register('qualification')} className="input-field" placeholder="e.g. PhD" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input {...register('experience')} type="number" className="input-field" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} className="input-field" />
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...register('status')} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FacultyFormPage;