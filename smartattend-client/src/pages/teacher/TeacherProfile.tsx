import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { Mail, Shield, BookOpen, Lock, KeyRound, UserCheck, Calendar, Award } from 'lucide-react';

export const TeacherProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  const fetchProfile = () => {
    apiClient.get('/teacher/profile')
      .then((res) => setProfile(res.data.teacher))
      .catch(() => {});
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }

    try {
      await apiClient.put('/teacher/profile', {
        currentPassword,
        password: newPassword,
      });
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPassMsg({ type: '', text: '' });
      }, 1500);
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Faculty Profile & Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage teaching account details, credentials, and password settings.</p>
        </div>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition text-xs"
        >
          <Lock className="w-4 h-4" /> Change Password
        </button>
      </div>

      <GlassCard className="space-y-6">
        {/* Profile Avatar Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-100 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl shadow-emerald-500/20">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Faculty Academic Staff | Role: {user?.role?.toUpperCase()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Department of {profile?.department || user?.department || 'CSE'}</p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold rounded-full shrink-0">
            ● Active Faculty Account
          </span>
        </div>

        {/* Teaching Activity Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Conducted Sessions</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{profile?.stats?.totalSessions || 0}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl border border-sky-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Assigned Courses</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{profile?.stats?.assignedCourses || 1}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Verified Attendance Logs</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{profile?.stats?.totalAttendanceMarked || 0}</p>
            </div>
          </div>
        </div>

        {/* Profile Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Faculty Email Address</p>
            <p className="text-slate-900 dark:text-slate-100 font-bold mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" /> {user?.email}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Academic Department</p>
            <p className="text-slate-900 dark:text-slate-100 font-bold mt-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-500 shrink-0" /> {profile?.department || user?.department || 'CSE'} Department
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-500" /> Change Faculty Password
            </h3>

            {passMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-semibold mb-4 text-center ${
                passMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {passMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
