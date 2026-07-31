import React, { useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { generateDeviceFingerprint } from '../../utils/fingerprint';
import { FaceCameraModal } from '../../components/FaceCameraModal';
import { BiometricVerificationModal } from '../../components/BiometricVerificationModal';
import { QRScannerModal } from '../../components/QRScannerModal';
import { apiClient } from '../../services/apiClient';
import { KeyRound, ShieldAlert, CheckCircle2, Wifi, Smartphone, Camera, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { FirstTimeRegistrationModal } from '../../components/FirstTimeRegistrationModal';

export const JoinSession: React.FC = () => {
  const navigate = useNavigate();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<any>(null);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [pendingSubmissionCode, setPendingSubmissionCode] = useState<string>('');
  const [primaryDeviceName, setPrimaryDeviceName] = useState<string>('Primary Device');

  const handleSubmit = async (
    e?: React.FormEvent,
    faceTemplate?: string,
    codeOverride?: string,
    biometricVerified?: boolean
  ) => {
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
        biometricVerified: Boolean(biometricVerified),
      };

      // 2. Submit to backend 7-Step Verification Pipeline
      const res = await apiClient.post('/attendance/mark', payload);

      if (res.data.success) {
        setStatusMessage({
          type: 'success',
          title: 'Attendance Verified & Marked Successfully!',
          details: `Subject: ${res.data.data?.session?.subject || 'Class Session'} | Campus Network & Biometric Identity Verified.`,
        });
        setTimeout(() => navigate('/student/dashboard'), 2500);
      }
    } catch (err: any) {
      const errData = err.response?.data;

      // Handle missing facial registration baseline -> Auto-trigger FirstTimeRegistrationModal
      if (errData?.requiresRegistration || errData?.step === 'STEP_7_REGISTER_FACE' || errData?.message?.includes('registration')) {
        setPendingSubmissionCode(codeToSubmit);
        setShowFirstTimeModal(true);
      } else if (biometricVerified && (errData?.step === 'STEP_7_DEVICE_FACE' || errData?.message?.includes('Biometric') || errData?.message?.includes('mismatch'))) {
        // If biometric was already attempted and failed (facial mismatch / proxy attempt), display error alert directly
        setStatusMessage({
          type: 'error',
          title: 'Facial Biometric Match Failed!',
          details: errData?.message || 'Facial biometric did not match registered student profile photo. Proxy attendance blocked.',
        });
      } else if (!biometricVerified && (errData?.requiresBiometric || errData?.differentDevice || errData?.step === 'STEP_7_DEVICE_FACE')) {
        // First encounter of secondary device -> Trigger Biometric Liveness Scan Modal
        setPendingSubmissionCode(codeToSubmit);
        if (errData?.primaryDeviceName) {
          setPrimaryDeviceName(errData.primaryDeviceName);
        }
        setShowBiometricModal(true);
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
    handleSubmit(undefined, template, pendingSubmissionCode);
  };

  const handleBiometricVerified = (faceTemplate: string) => {
    setShowBiometricModal(false);
    handleSubmit(undefined, faceTemplate, pendingSubmissionCode, true);
  };

  const handleQRScanned = (code: string) => {
    setAttendanceCode(code);
    handleSubmit(undefined, undefined, code);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 px-2 sm:px-0">
      <GlassCard className="text-center p-5 sm:p-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <KeyRound className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Join Attendance Session</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Scan the live classroom QR Code or enter the 6-digit dynamic code shown on your teacher's screen.
        </p>

        {statusMessage && (
          <div className={`mt-5 p-3.5 sm:p-4 rounded-2xl border text-left flex items-start gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
            <div>
              <h4 className="font-bold text-xs sm:text-sm">{statusMessage.title}</h4>
              <p className="text-[11px] sm:text-xs opacity-90 mt-0.5">{statusMessage.details}</p>
            </div>
          </div>
        )}

        {/* Camera QR Scanner Shortcut Banner */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowQRModal(true)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2.5 font-bold transition text-sm"
          >
            <QrCode className="w-5 h-5" />
            <span>Scan Classroom Screen QR Code</span>
          </button>
        </div>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">or enter code</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={attendanceCode}
                onChange={(e) => setAttendanceCode(e.target.value.replace(/\D/g, ''))}
                placeholder="582731"
                required
                className="w-full text-center text-2xl sm:text-3xl font-mono tracking-widest font-extrabold bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-sky-500 rounded-2xl py-3.5 text-sky-600 dark:text-sky-400 placeholder-slate-300 dark:placeholder-slate-700 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Campus Wi-Fi Check</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Hardware Hash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Face Liveness</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || attendanceCode.length !== 6}
            className="w-full py-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold rounded-2xl shadow-xl transition disabled:opacity-40 text-sm"
          >
            {loading ? 'Verifying 7-Step Pipeline...' : 'Submit Attendance Code'}
          </button>
        </form>
      </GlassCard>

      {/* QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        onScanSuccess={handleQRScanned}
      />

      {/* Secondary / Friend Device Biometric Face Modal */}
      <BiometricVerificationModal
        isOpen={showBiometricModal}
        primaryDeviceName={primaryDeviceName}
        onClose={() => setShowBiometricModal(false)}
        onVerified={handleBiometricVerified}
      />

      {/* First-Time Mandatory Facial Scan Registration Modal */}
      <FirstTimeRegistrationModal
        isOpen={showFirstTimeModal}
        mode="attendance"
        onClose={() => setShowFirstTimeModal(false)}
        onSuccess={() => {
          setShowFirstTimeModal(false);
          if (pendingSubmissionCode) {
            handleSubmit(undefined, undefined, pendingSubmissionCode);
          }
        }}
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
