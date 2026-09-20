import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AuthShell = ({ children }) => (
  <div
    className="min-h-screen flex items-center justify-center bg-surface-subtle p-4"
    style={{ backgroundImage: 'radial-gradient(ellipse at 15% 10%, rgba(6,182,212,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 90%, rgba(14,116,144,0.10) 0%, transparent 55%)' }}
  >
    {children}
  </div>
);

export const ForgotPasswordPage = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="bg-white rounded-3xl shadow-card border border-primary-100/60 p-8 w-full max-w-sm">
        <h2 className="font-display text-2xl text-primary-900 mb-2">Forgot Password</h2>
        {sent ? (
          <div className="text-center py-6">
            <p className="text-emerald-600 text-sm font-medium">Reset link sent to your email.</p>
            <Link to="/login" className="text-primary-500 text-xs mt-4 inline-block hover:underline tracking-wide">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <input
              {...register('email', { required: true })}
              type="email"
              className="input-field"
              placeholder="Your email address"
            />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <Link to="/login" className="block text-center text-xs text-primary-400 hover:text-primary-600 tracking-wide">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </AuthShell>
  );
};

export default ForgotPasswordPage;