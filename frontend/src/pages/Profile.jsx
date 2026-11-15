import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Calendar, LogOut, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import ResultCard from '../components/ResultCard';
import { formatDate } from '../utils/formatters';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const res = await authAPI.updateProfile({ name, email });
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#E8ECF4] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-[#3867F5] dark:text-blue-400">
              Account
            </span>
            <span className="text-xs text-[#7C879B] dark:text-slate-400">• Security & Personal Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17243D] dark:text-white tracking-tight">
            User Profile Settings
          </h1>
          <p className="text-sm text-[#7C879B] dark:text-slate-400 mt-1">
            Manage your personal credentials, contact email, and security settings.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold transition-colors shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Form */}
        <ResultCard title="Personal Details" icon={User}>
          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white font-medium focus:outline-none focus:border-[#3867F5]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white font-medium focus:outline-none focus:border-[#3867F5]"
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-[#7C879B]">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(user?.createdAt)}
              </span>

              <button
                type="submit"
                disabled={profileLoading}
                className="px-4 py-2 rounded-xl bg-[#3867F5] hover:bg-[#2B52D9] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
              >
                {profileLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </ResultCard>

        {/* Change Password Form */}
        <ResultCard title="Change Security Password" icon={Lock}>
          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white font-medium focus:outline-none focus:border-[#3867F5]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white font-medium focus:outline-none focus:border-[#3867F5]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white font-medium focus:outline-none focus:border-[#3867F5]"
              />
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-xs shadow-sm transition-all flex items-center gap-1 ml-auto disabled:opacity-50"
              >
                {passwordLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </ResultCard>
      </div>
    </div>
  );
}

