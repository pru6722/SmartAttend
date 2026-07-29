import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { Calendar, Plus, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const ManageTimetable: React.FC = () => {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);

  const [filter, setFilter] = useState({ department: 'CSE', year: '3', section: 'A' });

  const timingSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '01:00 PM - 02:00 PM (Lunch Break)',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
  ];

  const [formData, setFormData] = useState({
    department: 'CSE',
    year: '3',
    section: 'A',
    dayOfWeek: 'Monday',
    timeSlot: '09:00 AM - 10:00 AM',
    subjectCode: 'CS301',
    subjectTitle: 'Operating Systems & Security',
    teacherName: 'Dr. Alan Turing',
    roomNo: 'Hall 304',
  });

  const fetchTimetable = () => {
    apiClient.get(`/timetable?department=${filter.department}&year=${filter.year}&section=${filter.section}`)
      .then((res) => setTimetable(res.data.timetable || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTimetable();
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      const res = await apiClient.post('/timetable', formData);
      if (res.data.success) {
        setStatus({ type: 'success', message: res.data.message });
        fetchTimetable();
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to add timetable slot' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-500/10 via-slate-900 to-slate-900 border border-sky-500/20 rounded-3xl p-6">
        <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
          Section Schedule Manager
        </span>
        <h2 className="text-2xl font-bold text-white mt-2">Section-Wide Class Timetable Allocation</h2>
        <p className="text-slate-400 text-sm mt-1">Assign class schedules to an entire section at once based on department and year of study.</p>
      </div>

      {/* Section Filter Bar */}
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-sky-400" />
          <span className="text-sm font-bold text-white">Selected Section Filter:</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filter.department}
            onChange={(e) => {
              setFilter({ ...filter, department: e.target.value });
              setFormData({ ...formData, department: e.target.value });
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-bold"
          >
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
            <option value="EEE">EEE</option>
          </select>

          <select
            value={filter.year}
            onChange={(e) => {
              setFilter({ ...filter, year: e.target.value });
              setFormData({ ...formData, year: e.target.value });
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-bold"
          >
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          <select
            value={filter.section}
            onChange={(e) => {
              setFilter({ ...filter, section: e.target.value });
              setFormData({ ...formData, section: e.target.value });
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-bold"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slot Entry Form with Timing Dropdown */}
        <GlassCard className="lg:col-span-1">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-sky-400" /> Add Timetable Slot
          </h3>

          {status && (
            <div className={`mb-4 p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Day of Week</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none focus:border-sky-500"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>

              {/* Timing Dropdown */}
              <div>
                <label className="block text-xs font-bold text-sky-400 uppercase mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Time Slot Dropdown
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white text-xs font-bold outline-none focus:border-sky-500"
                >
                  {timingSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Venue / Room</label>
                <input
                  type="text"
                  required
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subject Title</label>
              <input
                type="text"
                required
                value={formData.subjectTitle}
                onChange={(e) => setFormData({ ...formData, subjectTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Faculty Teacher Name</label>
              <input
                type="text"
                required
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-extrabold rounded-2xl shadow-lg transition text-xs"
            >
              Assign Slot to {filter.department}-{filter.section}
            </button>
          </form>
        </GlassCard>

        {/* Section Timetable Grid */}
        <GlassCard className="lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" /> Active Schedule: {filter.department} (Sec {filter.section}, Year {filter.year})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Day</th>
                  <th className="p-3">Time Slot</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Subject Title</th>
                  <th className="p-3">Faculty</th>
                  <th className="p-3">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {timetable.length > 0 ? (
                  timetable.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-bold text-white">{t.dayOfWeek}</td>
                      <td className="p-3 font-mono text-sky-400 font-bold">{t.timeSlot}</td>
                      <td className="p-3 font-mono text-slate-300">{t.subjectCode}</td>
                      <td className="p-3 font-semibold text-white">{t.subjectTitle}</td>
                      <td className="p-3 text-slate-400">{t.teacherName}</td>
                      <td className="p-3 text-amber-400 font-semibold">{t.roomNo}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No timetable slots published yet for this section.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
