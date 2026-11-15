import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, User, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
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

    try {
      setLoading(true);
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F5F7FC] dark:bg-[#0F172A] transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-[#3867F5] flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all">
            <Brain className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-[#17243D] dark:text-white tracking-tight">
            AI Analyzer
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-[#17243D] dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-[#7C879B] dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#3867F5] dark:text-blue-400 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#1E293B] py-8 px-6 sm:px-10 rounded-3xl border border-[#E8ECF4] dark:border-slate-800 shadow-elevated">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C879B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white text-sm focus:outline-none focus:border-[#3867F5] focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-[#7C879B]/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C879B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white text-sm focus:outline-none focus:border-[#3867F5] focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-[#7C879B]/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C879B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white text-sm focus:outline-none focus:border-[#3867F5] focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-[#7C879B]/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C879B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white text-sm focus:outline-none focus:border-[#3867F5] focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-[#7C879B]/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#3867F5] hover:bg-[#2B52D9] text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

