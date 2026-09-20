import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { loginUser } from '../../features/auth/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => dispatch(loginUser(data));

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle p-4"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(6,182,212,0.12) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 90%, rgba(14,116,144,0.10) 0%, transparent 55%)
        `
      }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl text-primary-700 leading-none">USMS</h1>
          <p className="text-primary-400 mt-2 text-sm font-light tracking-widest uppercase">
            University Student Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card border border-primary-100/60 p-8">
          <h2 className="font-display text-2xl text-primary-900 mb-6">Sign in</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-primary-500 mb-1.5 uppercase tracking-widest">
                Email
              </label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                type="email"
                className="input-field"
                placeholder="you@university.edu"
              />
              {errors.email && <p className="text-rose-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-primary-500 mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-rose-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end pt-1">
              <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-600 transition-colors tracking-wide">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-primary-400 mt-6">
            No account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;