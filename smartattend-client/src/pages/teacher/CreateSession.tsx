import React, { useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { Play, Clock, Wifi, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateSession: React.FC = () => {
  const navigate = useNavigate();

  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('3');
  const [section, setSection] = useState('A');
  const [subject, setSubject] = useState('Operating Systems & Security');
  const [networkMask, setNetworkMask] = useState('/24');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/session/start', {
        department,
        year: Number(year),
        section,
        subject,
        networkIdentifier: networkMask,
      });

      const session = res.data.session;
      navigate(`/teacher/session/live/${session._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Start Attendance Session</h2>
        <p className="text-slate-400 text-sm mt-1">Generates a 6-digit OTP code active for a strict 2-minute attendance window.</p>
      </div>

      <GlassCard>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleStartSession} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="CSE">CSE - Computer Science</option>
                <option value="ECE">ECE - Electronics & Comm</option>
                <option value="MECH">MECH - Mechanical</option>
                <option value="CIVIL">CIVIL - Civil Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Year of Study</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Campus Network Subnet Mask</label>
              <select
                value={networkMask}
                onChange={(e) => setNetworkMask(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="/24">Standard Classroom (/24 - 255 IPs)</option>
                <option value="/16">Entire Campus Network (/16)</option>
                <option value="/22">Building / Lab Subnet (/22)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Subject Course Name</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="e.g. Operating Systems & Security"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5"><Shield className="w-4 h-4" /> Anti-Proxy Verification Active</p>
            <p className="opacity-90">Upon clicking start, a 6-digit code will display with a 2-minute countdown timer. Live attendance will update in real-time via Socket.IO.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 text-base mt-6"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{loading ? 'Initializing Session...' : 'Start 2-Minute Attendance Session'}</span>
          </button>
        </form>
      </GlassCard>
    </div>
  );
};
