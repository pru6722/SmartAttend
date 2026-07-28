import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckCircle,
  History,
  User,
  PlusCircle,
  FileText,
  Users,
  Building2,
  Activity,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/join', label: 'Join Attendance', icon: CheckCircle },
    { to: '/student/history', label: 'Attendance History', icon: History },
    { to: '/student/exams', label: 'Semester Exams', icon: GraduationCap },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/session/create', label: 'Start Session', icon: PlusCircle },
    { to: '/teacher/reports', label: 'Session Reports', icon: FileText },
    { to: '/teacher/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Analytics', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Manage Students', icon: Users },
    { to: '/admin/teachers', label: 'Manage Teachers', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: Activity },
  ];

  const links = role === 'student' ? studentLinks : role === 'teacher' ? teacherLinks : adminLinks;

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] transition-colors duration-300 shadow-sm dark:shadow-none">
      <div className="space-y-1.5">
        <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">
          {role} Navigation
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold transition-all duration-200 text-sm ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-xs font-bold text-slate-800 dark:text-slate-300">Campus Protection Active</p>
        </div>
        <div className="flex items-center gap-2 mt-1.5 pl-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">IP & Device Fingerprinting ON</span>
        </div>
      </div>
    </aside>
  );
};
