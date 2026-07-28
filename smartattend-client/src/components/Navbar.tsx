import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, Shield, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
          SA
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            SmartAttend
            <span className="text-sky-600 dark:text-sky-400 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
              ERP
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Animated Sliding Theme Switcher Pill */}
        <ThemeToggle />

        <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-sky-600 dark:text-sky-400 capitalize flex items-center justify-end gap-1 font-semibold">
              <Shield className="w-3 h-3" /> {user?.role} {user?.department ? `• ${user.department}` : ''}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sky-500 font-extrabold shadow-sm">
            {user?.name?.charAt(0)}
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
