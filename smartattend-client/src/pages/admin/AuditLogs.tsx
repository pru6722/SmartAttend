import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { Activity, ShieldCheck } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/admin/audit-logs')
      .then((res) => setLogs(res.data.logs || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Activity Audit Logs</h2>
        <p className="text-slate-400 text-sm mt-1">Immutable security log tracking user logins, session creations, and verification events.</p>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Timestamp</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5 rounded-r-xl">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/30 transition text-xs">
                  <td className="p-3.5 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-sky-400">{log.action}</td>
                  <td className="p-3.5 text-slate-200">{log.performedBy}</td>
                  <td className="p-3.5 uppercase font-semibold text-slate-400">{log.role}</td>
                  <td className="p-3.5 font-mono text-emerald-400">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="p-3.5 text-slate-400">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
