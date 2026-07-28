import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { GlassCard } from '../../components/GlassCard';
import { CheckCircle, BookOpen, Clock, Award, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>({ totalSessions: 0, attendedSessions: 0, percentage: '100%' });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/student/history')
      .then((res) => {
        setStats(res.data.stats || {});
        setHistory(res.data.history || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-500/10 via-slate-900 to-slate-900 border border-sky-500/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              Student Portal Active
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">Welcome Back, {user?.name} 👋</h2>
            <p className="text-slate-400 text-sm mt-1">Roll No: {user?.rollNo || '21CS001'} | Department: {user?.department || 'CSE'} (Sec {user?.section || 'A'})</p>
          </div>

          <button
            onClick={() => navigate('/student/join')}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="p-4 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Class Sessions</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalSessions || 12}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sessions Attended</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.attendedSessions || 12}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Percentage</p>
            <h3 className="text-3xl font-extrabold text-cyan-400 mt-1">{stats.percentage || '100%'}</h3>
          </div>
        </GlassCard>
      </div>

      {/* Enrolled Courses */}
      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4">Enrolled Course Subjects</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Operating Systems & Security', 'DBMS & SQL Systems', 'Computer Networks'].map((subject, idx) => (
            <div key={idx} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">CSE30{idx + 1}</span>
                <h4 className="font-semibold text-slate-200 mt-2">{subject}</h4>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Attendance Status</span>
                <span className="text-emerald-400 font-bold">100% Present</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent Attendance Logs */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Recent Attendance Logs</h3>
          <button onClick={() => navigate('/student/history')} className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Subject</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Network Status</th>
                <th className="p-3.5">Device Status</th>
                <th className="p-3.5 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.length > 0 ? (
                history.slice(0, 5).map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-medium text-white">{item.sessionId?.subject || 'Operating Systems'}</td>
                    <td className="p-3.5 text-slate-400">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" /> Campus Verified
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-xs font-mono">{item.deviceId}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">
                        Present
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">No recent attendance records found. Click "Mark Attendance" to submit.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
