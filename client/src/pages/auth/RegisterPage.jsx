import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { registerUser } from '../../features/auth/authSlice';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics', 'Mechanical Engineering',
  'Civil Engineering', 'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'Other',
];

const FieldLabel = ({ children }) => (
  <label className="block text-xs font-medium text-primary-500 mb-1.5 uppercase tracking-widest">
    {children}
  </label>
);

const FieldError = ({ message }) =>
  message ? <p className="text-rose-400 text-xs mt-1.5">{message}</p> : null;

const RegisterPage = () => {
  const dispatch = useDispatch();
  const { loading, registrationPending } = useSelector((s) => s.auth);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'student' } });
  const selectedRole = watch('role');

  const onSubmit = (data) => {
    const { confirmPassword, ...rest } = data;
    dispatch(registerUser(rest));
  };

  if (registrationPending) return <Navigate to="/verify-email" />;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-surface-subtle p-4 py-10"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(6,182,212,0.12) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 90%, rgba(14,116,144,0.10) 0%, transparent 55%)
        `
      }}
    >
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-primary-700 leading-none">USMS</h1>
          <p className="text-primary-400 mt-2 text-sm font-light tracking-widest uppercase">
            University Student Management
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-primary-100/60 p-8">
          <h2 className="font-display text-2xl text-primary-900 mb-1">Create Account</h2>
          <p className="text-xs text-primary-400 mb-6 font-light leading-relaxed">
            Your profile will be reviewed and activated by an admin after registration.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Full Name *</FieldLabel>
                <input {...register('name', { required: 'Name required' })} className="input-field" placeholder="John Doe" />
                <FieldError message={errors.name?.message} />
              </div>
              <div>
                <FieldLabel>Role *</FieldLabel>
                <select {...register('role')} className="input-field">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>

            <div>
              <FieldLabel>Email *</FieldLabel>
              <input
                {...register('email', {
                  required: 'Email required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
                type="email" className="input-field" placeholder="you@university.edu"
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Department *</FieldLabel>
                <select {...register('department', { required: 'Department required' })} className="input-field">
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <FieldError message={errors.department?.message} />
              </div>
              <div>
                <FieldLabel>Phone</FieldLabel>
                <input {...register('phone')} className="input-field" placeholder="+91 ..." />
              </div>
              <div>
                <FieldLabel>Date of Birth</FieldLabel>
                <input {...register('dateOfBirth')} type="date" className="input-field" />
              </div>
              <div>
                <FieldLabel>Gender</FieldLabel>
                <select {...register('gender')} className="input-field">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {selectedRole === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-subtle rounded-2xl border border-primary-100">
                <p className="col-span-2 text-xs font-semibold text-primary-500 uppercase tracking-widest">Student Details</p>
                <div>
                  <FieldLabel>Program</FieldLabel>
                  <input {...register('program')} className="input-field" placeholder="e.g. B.Tech, MBA" />
                </div>
                <div>
                  <FieldLabel>Batch</FieldLabel>
                  <input {...register('batch')} className="input-field" placeholder="e.g. 2024-2028" />
                </div>
                <div>
                  <FieldLabel>Current Semester</FieldLabel>
                  <input {...register('semester')} type="number" min="1" max="12" className="input-field" placeholder="1" />
                </div>
              </div>
            )}

            {selectedRole === 'faculty' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-subtle rounded-2xl border border-primary-100">
                <p className="col-span-2 text-xs font-semibold text-primary-500 uppercase tracking-widest">Faculty Details</p>
                <div>
                  <FieldLabel>Designation</FieldLabel>
                  <input {...register('designation')} className="input-field" placeholder="e.g. Assistant Professor" />
                </div>
                <div>
                  <FieldLabel>Qualification</FieldLabel>
                  <input {...register('qualification')} className="input-field" placeholder="e.g. Ph.D, M.Tech" />
                </div>
                <div>
                  <FieldLabel>Experience (years)</FieldLabel>
                  <input {...register('experience')} type="number" min="0" className="input-field" placeholder="0" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Password *</FieldLabel>
                <input
                  {...register('password', {
                    required: 'Password required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Need uppercase, lowercase & number' },
                  })}
                  type="password" className="input-field" placeholder="••••••••"
                />
                <FieldError message={errors.password?.message} />
              </div>
              <div>
                <FieldLabel>Confirm Password *</FieldLabel>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm',
                    validate: (v) => v === watch('password') || 'Passwords do not match',
                  })}
                  type="password" className="input-field" placeholder="••••••••"
                />
                <FieldError message={errors.confirmPassword?.message} />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-xs text-amber-600 font-light leading-relaxed">
              Your profile will be reviewed and activated by a university admin before you can access all features.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-primary-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;