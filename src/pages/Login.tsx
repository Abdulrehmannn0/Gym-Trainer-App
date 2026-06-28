import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
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

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative gradient background blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Brand Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black tracking-tighter text-white italic uppercase">
            GYMTRAINER<span className="text-blue-500 underline decoration-4">PRO</span>
          </h2>
          <p className="mt-3 text-xs font-mono uppercase tracking-widest text-zinc-500">
            STRENGTH & HYPERTROPHY BLUEPRINTS
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900 border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(59,130,246,1)]">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">SIGN IN TO ACCESS</h3>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-4 bg-rose-950/40 border-2 border-rose-800 text-rose-300 font-mono text-xs uppercase"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="NAME@EXAMPLE.COM"
                  className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-blue-500 text-white font-bold text-xs tracking-wider py-3.5 pl-11 pr-4 outline-none transition-all duration-200 uppercase"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-blue-500 text-white font-bold text-xs tracking-wider py-3.5 pl-11 pr-11 outline-none transition-all duration-200 uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 px-4 font-black text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Prompt to register */}
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center text-xs uppercase font-mono tracking-wider">
            <span className="text-zinc-500 font-bold">NEW RECRUIT? </span>
            <button
              onClick={() => onNavigate('register')}
              className="text-blue-400 hover:text-blue-300 font-black underline transition-colors duration-150"
            >
              CREATE AN ACCOUNT NOW
            </button>
          </div>
        </div>

        {/* Helpful instructions for demo testing */}
        <div className="mt-8 text-center text-xs text-zinc-500 bg-zinc-900 border-2 border-zinc-800 p-4 font-mono uppercase tracking-wider">
          <p className="font-black text-white mb-1">TESTING ACCOUNT PRO-TIP:</p>
          <p className="text-[10px] text-zinc-500 leading-normal">YOU CAN INSTANTLY REGISTER ANY EMAIL & PASSWORD CREATION TO INITIATE PREVIEW SYSTEM TESTING IMMEDIATELY.</p>
        </div>
      </motion.div>
    </div>
  );
};
