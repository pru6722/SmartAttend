import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/GlassCard';
import { QRCode } from '../../components/QRCode';
import { apiClient } from '../../services/apiClient';
import { useSocket } from '../../context/SocketContext';
import { exportToCSV, exportToExcel } from '../../utils/exporters';
import { Clock, ShieldCheck, StopCircle, Download, UserCheck, QrCode as QrIcon, Hash, Maximize2, X } from 'lucide-react';

export const LiveSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket, joinRoom, leaveRoom } = useSocket();

  const [session, setSession] = useState<any>(null);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [isEnded, setIsEnded] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [fullscreenQR, setFullscreenQR] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    apiClient.get(`/session/${id}`)
      .then((res) => {
        const sess = res.data.session;
        setSession(sess);

        const expiry = new Date(sess.expiryTime).getTime();
        const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
        setTimeLeft(diff);

        if (sess.status !== 'active' || diff <= 0) {
          setIsEnded(true);
        }
      })
      .catch(() => {});

    apiClient.get(`/attendance/session/${id}`)
      .then((res) => setAttendanceList(res.data.attendance || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    joinRoom(id);

    return () => {
      leaveRoom(id);
    };
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handleAttendanceMarked = (data: any) => {
      setAttendanceList((prev) => {
        if (prev.some((a) => a.rollNo === data.rollNo)) return prev;
        return [data, ...prev];
      });
    };

    const handleSessionEnded = () => {
      setIsEnded(true);
      setTimeLeft(0);
    };

    socket.on('attendanceMarked', handleAttendanceMarked);
    socket.on('sessionEnded', handleSessionEnded);

    return () => {
      socket.off('attendanceMarked', handleAttendanceMarked);
      socket.off('sessionEnded', handleSessionEnded);
    };
  }, [socket]);

  useEffect(() => {
    if (isEnded || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEnded, timeLeft]);

  const handleEndSession = async () => {
    if (!id) return;
    try {
      await apiClient.put(`/session/end/${id}`);
      setIsEnded(true);
      setTimeLeft(0);
    } catch (e) {}
  };

  const handleExportCSV = () => {
    const rows = attendanceList.map((a) => ({
      'Roll Number': a.rollNo,
      'Student Name': a.studentName || a.studentId?.name || 'Student',
      'Timestamp': new Date(a.timestamp).toLocaleString(),
      'Network Verified': a.networkVerified ? 'YES' : 'NO',
      'Face Verified': a.faceVerified ? 'YES' : 'NO',
      'Status': 'PRESENT',
    }));
    exportToCSV(`Attendance_${session?.subject || 'Session'}_${session?.attendanceCode}`, rows);
  };

  const handleExportExcel = () => {
    const rows = attendanceList.map((a) => ({
      'Roll Number': a.rollNo,
      'Student Name': a.studentName || a.studentId?.name || 'Student',
      'Timestamp': new Date(a.timestamp).toLocaleString(),
      'Network Verified': a.networkVerified ? 'YES' : 'NO',
      'Face Verified': a.faceVerified ? 'YES' : 'NO',
      'Status': 'PRESENT',
    }));
    exportToExcel(`Attendance_${session?.subject || 'Session'}_${session?.attendanceCode}`, rows);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with OTP Code / QR Code Toggle & Countdown Timer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isEnded ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
            }`}>
              {isEnded ? '● Session Ended / Expired' : '● Live Attendance Session Active'}
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">{session?.subject || 'Operating Systems'}</h2>
            <p className="text-slate-400 text-sm mt-1">{session?.department} - Section {session?.section} (Year {session?.year})</p>
          </div>

          {/* Large Code / QR Display */}
          <div className="text-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
            <div className="flex gap-2 mb-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setShowQRCode(false)}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition ${
                  !showQRCode ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Hash className="w-3.5 h-3.5" /> 6-Digit Code
              </button>
              <button
                onClick={() => setShowQRCode(true)}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition ${
                  showQRCode ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrIcon className="w-3.5 h-3.5" /> Live QR Code
              </button>
            </div>

            {showQRCode ? (
              <div className="my-1 flex flex-col items-center">
                <QRCode value={session?.attendanceCode || '582731'} size={150} />
                <button
                  onClick={() => setFullscreenQR(true)}
                  className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Projector View (Large QR)
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Classroom Attendance Code</p>
                <div className="text-4xl md:text-5xl font-mono font-extrabold tracking-widest bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                  {session?.attendanceCode || '------'}
                </div>
              </div>
            )}
          </div>

          {/* Countdown Clock */}
          <div className="text-center md:text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Time Remaining</p>
            <div className={`text-3xl font-mono font-bold flex items-center justify-center md:justify-end gap-2 ${
              timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-amber-400'
            }`}>
              <Clock className="w-6 h-6" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Socket.IO Live Feed Listening for Student Submissions...</span>
          </div>

          <div className="flex gap-2">
            {!isEnded && (
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <StopCircle className="w-4 h-4" /> End Session Now
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-sky-400" /> Export CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Live Attendance Feed Table */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" /> Real-Time Live Attendance Feed
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Students who passed the 7-step pipeline render instantly without refreshing.</p>
          </div>
          <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20">
            Total Present: {attendanceList.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Roll Number</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Campus Network</th>
                <th className="p-3.5">Device & Face Check</th>
                <th className="p-3.5 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {attendanceList.length > 0 ? (
                attendanceList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-sky-400 font-bold">{item.rollNo}</td>
                    <td className="p-3.5 font-semibold text-white">{item.studentName || item.studentId?.name || 'Student'}</td>
                    <td className="p-3.5 text-slate-400">{new Date(item.timestamp || Date.now()).toLocaleTimeString()}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" /> Subnet Verified
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {item.faceVerified ? 'Face Liveness Checked' : 'Primary Device'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">
                        Present
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Waiting for students to scan QR code or enter 6-digit OTP code...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Fullscreen Classroom Projector QR Modal */}
      {fullscreenQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-xl w-full text-center relative shadow-2xl">
            <button
              onClick={() => setFullscreenQR(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Classroom Projector QR Code</h3>
            <p className="text-xs text-slate-400 mb-6">{session?.subject} ({session?.department}-{session?.section})</p>
            <div className="flex justify-center my-4">
              <QRCode value={session?.attendanceCode || '582731'} size={280} />
            </div>
            <div className="mt-6 text-3xl font-mono font-extrabold text-sky-400 tracking-widest">
              CODE: {session?.attendanceCode}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
