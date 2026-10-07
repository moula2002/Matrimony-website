import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import signupBg from '../assets/signup_bg.png';
import brandLogo from '../assets/logo_transparent.png';
import navbarName from '../assets/navbar_name.png';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 grid grid-cols-12 font-sans">
      {/* Left Column: Brand & Hero Image */}
      <div 
        className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-cover bg-center text-white relative"
        style={{ backgroundImage: `url(${signupBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#5D34F7]/90 to-[#4024DB]/95 mix-blend-multiply" />
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 relative z-10 cursor-pointer" onClick={() => navigate('/')}>
          <img src={brandLogo} alt="Logo" className="w-12 h-12 object-contain filter brightness-0 invert" />
        </div>

        {/* Dynamic Title */}
        <div className="space-y-4 relative z-10">
          <h2 className="text-4xl font-black leading-tight tracking-tight">Secure Your Account</h2>
          <p className="text-white/80 leading-relaxed font-medium">
            Reset your password below to regain full access to your personalized matches, chats, and connections.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-sm text-white/60 relative z-10">
          © 2026 Familiess Matrimony. Safe & Secured.
        </div>
      </div>

      {/* Right Column: Reset password Form Panel */}
      <div className="col-span-12 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 bg-white relative">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2" onClick={() => navigate('/')}>
          <img src={brandLogo} alt="Logo" className="w-9 h-9 object-contain brand-logo-black" />
        </div>

        <div className="max-w-[440px] w-full space-y-8 animate-in fade-in duration-300">
          {success ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 text-emerald-500 shadow-sm animate-pulse">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Password Reset Successful!</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your password has been successfully updated. You can now log in with your new password.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer text-[15px]"
              >
                Go to Log In
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">New Password</h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Please enter and confirm your new password below.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm font-semibold w-full">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 w-full">
                {/* Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <FontAwesomeIcon icon={faLock} className="text-sm" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5D34F7] focus:ring-4 focus:ring-[#5D34F7]/10 focus:outline-none rounded-2xl text-slate-800 placeholder-slate-400 text-[15px] transition w-full"
                    placeholder="New password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="text-xs" />
                  </button>
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <FontAwesomeIcon icon={faLock} className="text-sm" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5D34F7] focus:ring-4 focus:ring-[#5D34F7]/10 focus:outline-none rounded-2xl text-slate-800 placeholder-slate-400 text-[15px] transition w-full"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="text-xs" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] text-white font-extrabold rounded-2xl hover:shadow-[0_8px_25px_rgba(93,52,247,0.25)] transition duration-200 cursor-pointer shadow-md disabled:opacity-50 text-[15px]"
                >
                  {isLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
