import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  fetchPendingRegistrations,
  approveRegistration,
  rejectRegistration,
} from '../../features/registrations/registrationSlice';
import { PageHeader, LoadingScreen, Badge, Modal } from '../../components/common';
import { MdCheck, MdClose, MdPerson, MdSchool } from 'react-icons/md';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics', 'Mechanical Engineering',
  'Civil Engineering', 'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'Other',
];

const PendingRegistrationsPage = () => {
  const dispatch = useDispatch();
  const { registrations, pagination, loading } = useSelector((s) => s.registrations);

  const [statusFilter, setStatusFilter] = useState('pending');
  const [approveTarget, setApproveTarget] = useState(null); // registration to approve
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const watchRole = approveTarget?.role;

  useEffect(() => {
    dispatch(fetchPendingRegistrations({ status: statusFilter }));
  }, [statusFilter]);

  useEffect(() => {
    if (approveTarget) {
      reset({
        department: approveTarget.department || '',
        phone: approveTarget.phone || '',
        gender: approveTarget.gender || '',
        dateOfBirth: approveTarget.dateOfBirth ? new Date(approveTarget.dateOfBirth).toISOString().split('T')[0] : '',
        program: approveTarget.program || '',
        semester: approveTarget.semester || 1,
        batch: approveTarget.batch || '',
        enrollmentYear: approveTarget.enrollmentYear || new Date().getFullYear(),
        designation: approveTarget.designation || '',
        qualification: approveTarget.qualification || '',
        experience: approveTarget.experience || 0,
      });
    }
  }, [approveTarget]);

  const onApprove = async (data) => {
    setSubmitting(true);
    await dispatch(approveRegistration({ id: approveTarget._id, data }));
    setSubmitting(false);
    setApproveTarget(null);
  };

  const onReject = async () => {
    setSubmitting(true);
    await dispatch(rejectRegistration({ id: rejectTarget._id, reason: rejectReason }));
    setSubmitting(false);
    setRejectTarget(null);
    setRejectReason('');
  };

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        title="Registration Requests"
        subtitle="Review and approve student / faculty registration submissions"
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize border transition-colors
              ${statusFilter === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'text-gray-600 border-gray-300 hover:border-primary-400'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {registrations.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-medium">No {statusFilter} registrations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const u = reg.userId;
            return (
              <div key={reg._id} className="card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
                      {u?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800">{u?.name}</p>
                        <Badge color={reg.role === 'student' ? 'blue' : 'purple'}>
                          {reg.role === 'student' ? <MdPerson className="inline mr-1" /> : <MdSchool className="inline mr-1" />}
                          {reg.role}
                        </Badge>
                        <Badge color={reg.status === 'pending' ? 'yellow' : reg.status === 'approved' ? 'green' : 'red'}>
                          {reg.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{u?.email}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                        <span>Dept: <span className="text-gray-600 font-medium">{reg.department}</span></span>
                        {reg.gender && (
                          <span>Gender: <span className="text-gray-600 font-medium capitalize">{reg.gender}</span></span>
                        )}
                        {reg.dateOfBirth && (
                          <span>DOB: <span className="text-gray-600 font-medium">{new Date(reg.dateOfBirth).toLocaleDateString()}</span></span>
                        )}
                        {reg.role === 'student' && reg.program && (
                          <span>Program: <span className="text-gray-600 font-medium">{reg.program}</span></span>
                        )}
                        {reg.role === 'student' && reg.semester && (
                          <span>Sem: <span className="text-gray-600 font-medium">{reg.semester}</span></span>
                        )}
                        {reg.role === 'faculty' && reg.designation && (
                          <span>Designation: <span className="text-gray-600 font-medium">{reg.designation}</span></span>
                        )}
                        {reg.phone && <span>Phone: <span className="text-gray-600 font-medium">{reg.phone}</span></span>}
                        <span>Applied: <span className="text-gray-600 font-medium">{new Date(reg.createdAt).toLocaleDateString()}</span></span>
                      </div>
                      {reg.status === 'rejected' && reg.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1">Rejection reason: {reg.rejectionReason}</p>
                      )}
                    </div>
                  </div>

                  {reg.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setApproveTarget(reg)}
                        className="btn-primary flex items-center gap-1 text-sm py-1.5 px-3"
                      >
                        <MdCheck size={16} /> Approve
                      </button>
                      <button
                        onClick={() => { setRejectTarget(reg); setRejectReason(''); }}
                        className="btn-secondary flex items-center gap-1 text-sm py-1.5 px-3 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <MdClose size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        title={`Approve Registration — ${approveTarget?.userId?.name}`}
        size="lg"
      >
        <p className="text-sm text-gray-500 mb-4">
          Review and edit the details below. A {approveTarget?.role} profile will be created when you confirm.
        </p>
        <form onSubmit={handleSubmit(onApprove)} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} className="input-field" placeholder="+91 ..." />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input {...register('dateOfBirth')} type="date" className="input-field" />
            </div>
          </div>

          {/* Student-specific fields */}
          {watchRole === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                <input {...register('program')} className="input-field" placeholder="e.g. B.Tech, MBA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input {...register('semester', { min: 1, max: 12 })} type="number" min="1" max="12" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <input {...register('batch')} className="input-field" placeholder="e.g. 2024-2028" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Year</label>
                <input {...register('enrollmentYear')} type="number" className="input-field" />
              </div>
            </div>
          )}

          {/* Faculty-specific fields */}
          {watchRole === 'faculty' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input {...register('designation')} className="input-field" placeholder="e.g. Assistant Professor" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input {...register('qualification')} className="input-field" placeholder="e.g. Ph.D" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                <input {...register('experience')} type="number" min="0" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <input {...register('joinDate')} type="date" className="input-field" />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2 justify-end">
            <button type="button" onClick={() => setApproveTarget(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Approving...' : 'Confirm & Approve'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject confirmation */}
      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject Registration"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-3">
          Rejecting <strong>{rejectTarget?.userId?.name}</strong>. Provide a reason (optional):
        </p>
        <textarea
          className="input-field resize-none"
          rows={3}
          placeholder="Reason for rejection..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
        <div className="flex gap-3 mt-4 justify-end">
          <button onClick={() => setRejectTarget(null)} className="btn-secondary">Cancel</button>
          <button
            onClick={onReject}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {submitting ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PendingRegistrationsPage;