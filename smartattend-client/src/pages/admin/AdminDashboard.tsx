import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { Users, Building2, BookOpen, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/admin/analytics')
      .then((res) => setAnalytics(res.data.analytics))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Institutional Analytics Overview</h2>
        <p className="text-slate-400 text-sm mt-1">Real-time attendance rates, student statistics, and low-attendance alert monitoring.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="p-4 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Enrolled Students</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{analytics?.totalStudents || 2}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Faculty Teachers</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{analytics?.totalTeachers || 1}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Departments</p>
            <h3 className="text-2xl font-extrabold text-purple-400 mt-1">{analytics?.totalDepartments || 2}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Students Below 75%</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{analytics?.lowAttendanceCount || 0}</h3>
          </div>
        </GlassCard>
      </div>

      {/* Low Attendance Watchlist */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Attendance Watchlist (&lt; 75% Threshold)
          </h3>
          <span className="text-xs text-slate-400">Automated Institution Warning System</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Roll Number</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Attendance %</th>
                <th className="p-3.5 rounded-r-xl">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {analytics?.studentStats?.map((s: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-mono text-sky-400 font-bold">{s.rollNo}</td>
                  <td className="p-3.5 font-semibold text-white">{s.name}</td>
                  <td className="p-3.5 text-slate-400">{s.department}</td>
                  <td className="p-3.5 font-bold text-emerald-400">{s.percentage}%</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      s.percentage < 75 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {s.percentage < 75 ? 'At Risk' : 'Satisfactory'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
