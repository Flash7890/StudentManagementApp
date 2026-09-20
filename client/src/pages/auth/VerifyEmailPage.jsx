import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, resendOtp, clearRegistrationPending } from '../../features/auth/authSlice';

const MAX_RESEND = 3;
const COOLDOWN_SEC = 60;

const VerifyEmailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, pendingEmail } = useSelector((s) => s.auth);
  const [digits, setDigits] = useState(['','','','','','']);
  const inputs = useRef([]);
  const [resendCount, setResendCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    setTimer(COOLDOWN_SEC);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    if (resendCount >= MAX_RESEND || timer > 0 || loading) return;
    dispatch(resendOtp({ email: pendingEmail })).then((action) => {
      if (resendOtp.fulfilled.match(action)) {
        setResendCount((c) => c + 1);
        startTimer();
      }
    });
  };

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputs.current[i+1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i-1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) return;
    dispatch(verifyEmail({ email: pendingEmail, otp })).then((action) => {
      if (verifyEmail.fulfilled.match(action)) navigate('/dashboard');
    });
  };

  const otp = digits.join('');

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-surface-subtle p-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at 15% 10%, rgba(6,182,212,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 90%, rgba(14,116,144,0.10) 0%, transparent 55%)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-primary-700 leading-none">USMS</h1>
          <p className="text-primary-400 mt-2 text-sm font-light tracking-widest uppercase">
            University Student Management
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-primary-100/60 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-primary-900">Check your email</h2>
            <p className="text-primary-400 mt-2 text-xs font-light">
              We sent a 6-digit code to<br />
              <span className="font-medium text-primary-600">{pendingEmail || 'your email'}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="flex-1 min-w-0 max-w-[3rem] h-12 text-center text-xl font-semibold border-2 rounded-2xl outline-none transition-all
                    focus:border-primary-400 focus:ring-2 focus:ring-primary-100
                    border-primary-100 text-primary-900 bg-surface-subtle"
                />
              ))}
            </div>

            {error && (
              <p className="text-rose-400 text-xs text-center mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary w-full py-3 disabled:opacity-40"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <p className="text-center text-xs text-primary-400 mt-6">
            <button
              type="button"
              onClick={() => {
                dispatch(clearRegistrationPending());
                navigate('/register');
              }}
              className="text-primary-600 hover:underline font-medium"
            >Wrong Email? Go back</button>
          </p>

          <div className="text-center mt-4">
            {resendCount < MAX_RESEND ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || loading}
                className="text-xs text-primary-500 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {timer > 0
                  ? `Resend OTP in ${timer}s`
                  : `Resend OTP${resendCount > 0 ? ` (${MAX_RESEND - resendCount} left)` : ''}`}
              </button>
            ) : (
              <p className="text-xs text-primary-400">Maximum resend attempts reached.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;