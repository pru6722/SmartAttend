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
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between transition-colors duration-300">
      {/* Brand Logo & Tag */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center font-black text-white shadow-md shadow-sky-500/20 text-sm">
          SA
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
            SmartAttend
            <span className="text-sky-600 dark:text-sky-400 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
              ERP
            </span>
          </h1>
        </div>
      </div>

      {/* Right User Navigation & Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Animated Sliding Theme Switcher Pill */}
        <ThemeToggle />

        <button 
          title="Notifications"
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-[11px] text-sky-600 dark:text-sky-400 capitalize flex items-center justify-end gap-1 font-semibold">
              <Shield className="w-3 h-3" /> {user?.role} {user?.department ? `• ${user.department}` : ''}
            </p>
          </div>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-sm shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>

          {/* Professional Styled Executive Logout Pill */}
          <button
            onClick={handleLogout}
            title="Sign out of account"
            className="px-2.5 sm:px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
