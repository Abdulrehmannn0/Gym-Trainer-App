import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Dumbbell, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, loginWithGoogle, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setInfoMessage('');
    setSubmitting(true);
    try {
      await login(email, password);
      onNavigate('dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setInfoMessage('');
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      onNavigate('dashboard');
    } catch (err: any) {
      console.error('Google Auth Failed', err);
      setError(err.message || 'Google Auth Failed. Please try again.');
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to receive a reset link.');
      return;
    }
    setError('');
    setInfoMessage('');
    setResettingPassword(true);
    try {
      await sendPasswordReset(email);
      setInfoMessage('Password reset link has been dispatched to your inbox.');
    } catch (err: any) {
      console.error('Password reset failed', err);
      setError(err.message || 'Failed to send reset link. Please verify your email.');
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Dynamic gradient backdrop glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[130px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[130px]" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/25 mb-4">
            <Dumbbell className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
            AzharFit<span className="text-[#7C3AED]">AI</span>
          </h2>
          <p className="mt-1 text-xs text-zinc-500 uppercase tracking-widest font-semibold">
            Train Smart. Live Strong.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/40">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest text-center mb-6">SIGN IN TO SYSTEMS</h3>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold"
            >
              {error}
            </motion.div>
          )}

          {infoMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl text-xs font-semibold"
            >
              {infoMessage}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 text-white font-semibold text-xs py-3.5 pl-11 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  className="text-[9px] font-bold uppercase text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {resettingPassword ? 'DISPATCHING...' : 'FORGOT PASSWORD?'}
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 text-white font-semibold text-xs py-3.5 pl-11 pr-11 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required={!resettingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={submitting || googleSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 px-4 font-bold text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center space-x-2 rounded-xl shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AUTHORIZING ENTRY...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN SYSTEM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Login Splitter */}
          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 border-b border-zinc-800" />
            <span className="relative bg-zinc-900 px-3.5 text-[9px] font-extrabold text-zinc-500 tracking-widest uppercase">OR CONNECT WITH</span>
          </div>

          {/* Google SSO Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleSubmitting || submitting}
            className="w-full bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-zinc-700 hover:text-white disabled:opacity-50"
          >
            {googleSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>SIGN IN WITH GOOGLE</span>
          </button>

          {/* Prompt to register */}
          <div className="mt-6 pt-6 border-t border-zinc-800/60 text-center text-xs uppercase font-semibold">
            <span className="text-zinc-500">NEW RECRUIT? </span>
            <button
              onClick={() => onNavigate('register')}
              className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              CREATE AN ACCOUNT NOW
            </button>
          </div>
        </div>

        {/* Pro testing tip */}
        <div className="mt-6 text-center text-[10px] text-zinc-500 bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl">
          <p className="font-bold text-zinc-400 mb-1">TESTING ACCOUNT PRO-TIP:</p>
          <p className="leading-normal">You can instantly register any email and password credentials to initialize preview system testing immediately.</p>
        </div>
      </motion.div>
    </div>
  );
};
