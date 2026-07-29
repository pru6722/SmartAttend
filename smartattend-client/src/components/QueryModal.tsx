import React, { useState } from 'react';
import { X, Send, HelpCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface QueryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueryModal: React.FC<QueryModalProps> = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await apiClient.post('/queries', { subject, message });
      if (res.data.success) {
        setSuccessMsg('Query submitted to Admin Helpdesk. Track updates under Profile.');
        setSubject('');
        setMessage('');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1800);
      }
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl border border-sky-500/20">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Submit Helpdesk Query</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Send profile update requests or attendance queries to Admin</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
              Query Subject / Topic
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Request Name Correction / Attendance Review"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
              Detailed Query Message
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your details or requested changes here..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white text-sm outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : 'Send Query to Admin'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
