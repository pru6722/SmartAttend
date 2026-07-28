import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { PlusCircle, Clock, Users, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/session/teacher')
      .then((res) => setSessions(res.data.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Teacher Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Teacher Control Center
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">Welcome, {user?.name}</h2>
          <p className="text-slate-400 text-sm mt-1">Department: {user?.department || 'CSE'} | Manage sessions, generate 2-min OTPs & view live attendance.</p>
        </div>

        <button
          onClick={() => navigate('/teacher/session/create')}
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Start Attendance Session</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sessions Conducted</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{sessions.length}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-4 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Section</p>
            <h3 className="text-3xl font-extrabold text-sky-400 mt-1">CSE - Sec A</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Attendance Rate</p>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-1">94.2%</h3>
          </div>
        </GlassCard>
      </div>

      {/* Past Sessions List */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Recent Attendance Sessions</h3>
          <button onClick={() => navigate('/teacher/reports')} className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
            View All Reports <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Session ID</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Class / Section</th>
                <th className="p-3.5">OTP Code</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sessions.length > 0 ? (
                sessions.map((sess) => (
                  <tr key={sess._id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-mono text-xs text-slate-400">{sess.sessionId}</td>
                    <td className="p-3.5 font-semibold text-white">{sess.subject}</td>
                    <td className="p-3.5 text-slate-400">{sess.department} - Sec {sess.section} (Yr {sess.year})</td>
                    <td className="p-3.5 font-mono text-sky-400 font-bold">{sess.attendanceCode}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        sess.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {sess.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => navigate(`/teacher/session/live/${sess._id}`)}
                        className="text-xs font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg"
                      >
                        {sess.status === 'active' ? 'View Live Feed' : 'Report'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No sessions created yet. Click "Start Attendance Session" to begin.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
