import React, { useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { generateDeviceFingerprint } from '../../utils/fingerprint';
import { FaceCameraModal } from '../../components/FaceCameraModal';
import { QRScannerModal } from '../../components/QRScannerModal';
import { apiClient } from '../../services/apiClient';
import { KeyRound, ShieldAlert, CheckCircle2, Wifi, Smartphone, Camera, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const JoinSession: React.FC = () => {
  const navigate = useNavigate();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<any>(null);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [pendingSubmissionData, setPendingSubmissionData] = useState<any>(null);

  const handleSubmit = async (e?: React.FormEvent, faceTemplate?: string, codeOverride?: string) => {
    if (e) e.preventDefault();
    const codeToSubmit = codeOverride || attendanceCode;
    if (!codeToSubmit || codeToSubmit.length !== 6) return;

    setStatusMessage(null);
    setLoading(true);

    try {
      // 1. Gather browser device fingerprint hash
      const fp = await generateDeviceFingerprint();

      const payload = {
        attendanceCode: codeToSubmit,
        fingerprintHash: fp.fingerprintHash,
        platform: fp.platform,
        browser: fp.userAgent,
        faceTemplate: faceTemplate || undefined,
      };

      // 2. Submit to backend 7-Step Verification Pipeline
      const res = await apiClient.post('/attendance/mark', payload);

      if (res.data.success) {
        setStatusMessage({
          type: 'success',
          title: 'Attendance Verified & Marked Successfully!',
          details: `Subject: ${res.data.data?.session?.subject || 'Class Session'} | Campus Network & Device Hash Verified.`,
        });
        setTimeout(() => navigate('/student/dashboard'), 2500);
      }
    } catch (err: any) {
      const errData = err.response?.data;

      // Check if Step 7 failed due to unknown device needing face verification
      if (errData?.step === 'STEP_7_DEVICE_FACE' && !faceTemplate) {
        setPendingSubmissionData(codeToSubmit);
        setShowFaceModal(true);
      } else {
        setStatusMessage({
          type: 'error',
          title: errData?.message || 'Verification Failed',
          details: errData?.step ? `Pipeline Triggered Breakpoint: ${errData.step}` : 'Failed to connect to verification server',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFaceVerified = (template: string) => {
    setShowFaceModal(false);
    handleSubmit(undefined, template, pendingSubmissionData);
  };

  const handleQRScanned = (code: string) => {
    setAttendanceCode(code);
    handleSubmit(undefined, undefined, code);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <GlassCard className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Join Active Attendance Session</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Scan the live classroom QR Code or enter the 6-digit dynamic code shown on your teacher's screen.
        </p>

        {statusMessage && (
          <div className={`mt-6 p-4 rounded-2xl border text-left flex items-start gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <ShieldAlert className="w-6 h-6 shrink-0" />}
            <div>
              <h4 className="font-bold text-sm">{statusMessage.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{statusMessage.details}</p>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)} className="mt-8 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              Attendance Session Verification
            </label>

            {/* Input & QR Scanner Trigger side-by-side */}
            <div className="flex gap-3 items-center">
              <input
                type="text"
                maxLength={6}
                value={attendanceCode}
                onChange={(e) => setAttendanceCode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 582731"
                required
                className="flex-1 text-center text-3xl font-mono tracking-widest font-extrabold bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-sky-500 rounded-2xl py-4 text-sky-600 dark:text-sky-400 placeholder-slate-400 dark:placeholder-slate-700 outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                title="Scan QR Code with Camera"
                className="h-16 px-5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1 shrink-0 font-bold transition"
              >
                <QrCode className="w-6 h-6" />
                <span className="text-[10px] uppercase tracking-wider">Scan QR</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-left p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-emerald-500" />
              <span>Network Check</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-500" />
              <span>Device Hash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-500" />
              <span>Camera Liveness</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || attendanceCode.length !== 6}
            className="w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/25 transition disabled:opacity-50 text-base"
          >
            {loading ? 'Executing Verification Pipeline...' : 'Submit Attendance Code'}
          </button>
        </form>
      </GlassCard>

      {/* QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        onScanSuccess={handleQRScanned}
      />

      {/* Camera Face Modal */}
      <FaceCameraModal
        isOpen={showFaceModal}
        onClose={() => setShowFaceModal(false)}
        onFaceVerified={handleFaceVerified}
      />
    </div>
  );
};
