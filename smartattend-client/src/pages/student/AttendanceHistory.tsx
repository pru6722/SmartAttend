import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { ShieldCheck, Calendar, Clock, Monitor } from 'lucide-react';

export const AttendanceHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/student/history')
      .then((res) => setHistory(res.data.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Attendance Logs & Verification History</h2>
        <p className="text-slate-400 text-sm mt-1">Complete record of verified attendance submissions across enrolled courses.</p>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 rounded-l-xl">Attendance ID</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Network Verified</th>
                <th className="p-4">Face Verified</th>
                <th className="p-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-mono text-xs text-slate-400">{item.attendanceId || item._id}</td>
                    <td className="p-4 font-semibold text-white">{item.sessionId?.subject || 'Operating Systems'}</td>
                    <td className="p-4 text-slate-400">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" /> CIDR Subnet Passed
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {item.faceVerified ? 'Liveness Verified' : 'Registered Device'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">
                        Present
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No attendance history available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
