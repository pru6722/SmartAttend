import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { apiClient } from '../../services/apiClient';
import { FileText, Download, Calendar, Users } from 'lucide-react';
import { exportToCSV, exportToExcel } from '../../utils/exporters';

export const TeacherReports: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/session/teacher')
      .then((res) => setSessions(res.data.sessions || []))
      .catch(() => {});
  }, []);

  const handleDownloadSessionCSV = async (sessionId: string, subject: string) => {
    try {
      const res = await apiClient.get(`/reports/session/${sessionId}`);
      const reportData = res.data.report || [];
      const rows = reportData.map((r: any) => ({
        'Roll No': r.rollNo,
        'Name': r.name,
        'Department': r.department,
        'Section': r.section,
        'Subject': r.subject,
        'Status': r.status,
        'Timestamp': r.timestamp ? new Date(r.timestamp).toLocaleString() : 'N/A',
        'Network Verified': r.networkVerified ? 'YES' : 'NO',
        'Device ID': r.deviceId,
      }));
      exportToCSV(`Attendance_Report_${subject}_${sessionId}`, rows);
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Attendance Reports & Exports</h2>
        <p className="text-slate-400 text-sm mt-1">Download daily, monthly, and subject-wise attendance logs in CSV or Excel format.</p>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 rounded-l-xl">Date & Time</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Department & Sec</th>
                <th className="p-4">OTP Code</th>
                <th className="p-4 rounded-r-xl">Export Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sessions.map((s) => (
                <tr key={s._id} className="hover:bg-slate-800/30 transition">
                  <td className="p-4 text-slate-400">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-semibold text-white">{s.subject}</td>
                  <td className="p-4 text-slate-400">{s.department} - Section {s.section}</td>
                  <td className="p-4 font-mono font-bold text-sky-400">{s.attendanceCode}</td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleDownloadSessionCSV(s._id, s.subject)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-lg flex items-center gap-1 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV Report
                    </button>
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
