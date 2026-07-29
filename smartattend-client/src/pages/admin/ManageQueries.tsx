import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { HelpCircle, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

export const ManageQueries: React.FC = () => {
  const [queries, setQueries] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState('');

  const fetchQueries = () => {
    apiClient.get('/queries/admin')
      .then((res) => {
        setQueries(res.data.queries || []);
        setPendingCount(res.data.pendingCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await apiClient.put(`/queries/admin/${id}/resolve`, { adminResponse });
      if (res.data.success) {
        setSelectedTicket(null);
        setAdminResponse('');
        fetchQueries();
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-500/10 via-slate-900 to-slate-900 border border-sky-500/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            Admin Helpdesk Desk
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">Student & Teacher Query Management</h2>
          <p className="text-slate-400 text-sm mt-1">Review profile update requests, name change submissions, and attendance tickets.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-semibold">Pending Action</p>
            <p className="text-2xl font-extrabold text-amber-400">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Query List */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-400" /> Submitted Support Tickets ({queries.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Ticket ID</th>
                <th className="p-3.5">Sender</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Message Details</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {queries.length > 0 ? (
                queries.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-mono text-sky-400 font-bold">{q.ticketId}</td>
                    <td className="p-3.5 font-semibold text-white">
                      {q.senderName}
                      <p className="text-[11px] text-slate-500 font-normal">{q.senderEmail}</p>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        q.senderRole === 'student' ? 'bg-sky-500/10 text-sky-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {q.senderRole}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-white">{q.subject}</td>
                    <td className="p-3.5 text-slate-300 max-w-xs truncate">{q.message}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        q.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {q.status === 'completed' ? 'Completed' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {q.status !== 'completed' ? (
                        <button
                          onClick={() => {
                            setSelectedTicket(q);
                            setAdminResponse('Request approved and profile details updated.');
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolve & Mark Completed
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-emerald-500" /> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No support query tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resolve Query: {selectedTicket.ticketId}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sender: {selectedTicket.senderName} ({selectedTicket.senderEmail})</p>

            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl text-xs text-slate-700 dark:text-slate-300">
              <p className="font-bold text-sky-500 mb-1">Query Subject: {selectedTicket.subject}</p>
              <p>{selectedTicket.message}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Admin Response Note</label>
              <textarea
                rows={3}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleResolve(selectedTicket._id)}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Mark as Completed
              </button>

              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
