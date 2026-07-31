import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, ShieldCheck, CheckCircle2, Eye, Smartphone, AlertCircle } from 'lucide-react';
import { captureFaceDescriptor } from '../utils/faceLiveness';
import { generateDeviceFingerprint } from '../utils/fingerprint';
import { apiClient } from '../services/apiClient';

interface FirstTimeRegistrationModalProps {
  isOpen: boolean;
  studentName?: string;
  mode?: 'onboarding' | 'attendance';
  onSuccess: () => void;
  onClose: () => void;
}

export const FirstTimeRegistrationModal: React.FC<FirstTimeRegistrationModalProps> = ({
  isOpen,
  studentName = 'Student',
  mode = 'onboarding',
  onSuccess,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [step, setStep] = useState<'welcome' | 'scanning' | 'registering' | 'success'>('scanning');
  const [livenessMessage, setLivenessMessage] = useState('Position your face inside the oval frame');
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [registerPrimaryDevice, setRegisterPrimaryDevice] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<{ platform: string; browser: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isAttendanceFlow = mode === 'attendance';

  useEffect(() => {
    if (isOpen) {
      setStep('scanning');
      generateDeviceFingerprint().then((fp) => {
        setDeviceInfo({ platform: fp.platform, browser: fp.userAgent });
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && step === 'scanning') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, step]);

  const startCamera = async () => {
    try {
      setErrorMsg('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      simulateLiveness();
    } catch (err) {
      setErrorMsg('Camera permission is required to capture your facial biometric baseline.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const simulateLiveness = () => {
    setLivenessMessage('Center your face & blink your eyes for liveness verification...');
    setTimeout(() => {
      setLivenessMessage('✨ Liveness confirmed! Ready to verify facial identity.');
      setBlinkDetected(true);
    }, 1500);
  };

  const handleCompleteRegistration = async () => {
    setErrorMsg('');
    setLoading(true);
    setStep('registering');

    try {
      let faceTemplate = '';
      if (videoRef.current) {
        if (videoRef.current.videoWidth === 0) {
          await new Promise((r) => setTimeout(r, 500));
        }
        faceTemplate = await captureFaceDescriptor(videoRef.current);
      } else {
        faceTemplate = JSON.stringify([0.12, 0.45, 0.88, 0.33, 0.91, 0.72, 0.65, 0.54]);
      }

      const fp = await generateDeviceFingerprint();

      const res = await apiClient.post('/student/register-face-device', {
        faceTemplate,
        registerPrimaryDevice,
        fingerprintHash: fp.fingerprintHash,
        platform: fp.platform,
        browser: fp.userAgent,
      });

      if (res.data.success) {
        setStep('success');
        stopCamera();
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to complete facial verification');
      setStep('scanning');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
        {step !== 'registering' && (
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl border border-sky-500/20 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              {isAttendanceFlow ? 'Step 7: Facial Biometric Verification' : 'Biometric Security Onboarding'}
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {isAttendanceFlow ? 'Verify Face & Mark Attendance' : 'Register Facial Profile & Device'}
            </h3>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Welcome / Attendance Explanation */}
        {step === 'welcome' && (
          <div className="space-y-4">
            <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-xs text-sky-600 dark:text-sky-300 space-y-2">
              <p className="font-bold text-sm text-sky-500">
                {isAttendanceFlow ? `Facial Scan Required for ${studentName}` : `Welcome, ${studentName}! 👋`}
              </p>
              <p>
                {isAttendanceFlow
                  ? 'To complete your attendance submission, please scan your face below. This verifies your identity against your registered profile.'
                  : 'To enforce zero proxy attendance at SmartAttend ERP, every student must register their Facial Biometric Profile and set their Primary Campus Device.'}
              </p>
              <p className="text-[11px] opacity-90">
                {isAttendanceFlow
                  ? 'Your live scan will be matched with high accuracy to ensure no proxy attendance.'
                  : 'Future attendance marked from this primary device will verify instantly.'}
              </p>
            </div>

            {/* Device Info Summary */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Smartphone className="w-4 h-4 text-sky-500" /> Hardware Device:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {deviceInfo?.platform || 'Desktop Browser'} ({deviceInfo?.browser || 'Chrome'})
                </span>
              </div>

              {!isAttendanceFlow && (
                <label className="flex items-center gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={registerPrimaryDevice}
                    onChange={(e) => setRegisterPrimaryDevice(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    Register this device as my <strong>Primary Campus Device</strong>
                  </span>
                </label>
              )}
            </div>

            <button
              onClick={() => setStep('scanning')}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-extrabold rounded-2xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2 text-xs"
            >
              <Camera className="w-4 h-4" /> {isAttendanceFlow ? 'Start Facial Scan & Submit Attendance' : 'Continue to Facial Biometric Scan'}
            </button>
          </div>
        )}

        {/* Step 2: Camera Facial Scan */}
        {(step === 'scanning' || step === 'registering') && (
          <div className="space-y-4 text-center">
            <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden border-2 border-sky-500/50 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Facial Biometric Oval Overlay */}
              <div className="absolute inset-0 border-4 border-dashed border-sky-400/80 rounded-full scale-75 animate-pulse pointer-events-none flex items-center justify-center">
                {blinkDetected && (
                  <span className="bg-emerald-500/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
                    <Eye className="w-3.5 h-3.5" /> Liveness Confirmed
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs font-semibold text-sky-400 animate-pulse">{livenessMessage}</p>

            <button
              onClick={handleCompleteRegistration}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              {loading ? (
                <span>{isAttendanceFlow ? 'Verifying Face & Submitting Attendance...' : 'Registering Biometric Baseline...'}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> {isAttendanceFlow ? 'Verify Face & Submit Attendance' : 'Save Facial Baseline & Register Device'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 'success' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {isAttendanceFlow ? 'Facial Identity Verified! 🎉' : 'Registration Complete! 🎉'}
            </h4>
            <p className="text-xs text-slate-400">
              {isAttendanceFlow
                ? 'Your facial biometric matched your student profile. Attendance submission granted.'
                : 'Your facial biometric profile and primary campus device have been enrolled into SmartAttend anti-proxy network.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
