import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { captureFaceDescriptor } from '../utils/faceLiveness';

interface FaceCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFaceVerified: (template: string) => void;
}

export const FaceCameraModal: React.FC<FaceCameraModalProps> = ({ isOpen, onClose, onFaceVerified }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [livenessPrompt, setLivenessPrompt] = useState('Position your face in the box and blink once');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } })
        .then((s) => {
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setErrorMsg('Camera access denied or unavailable. Please enable camera permissions.');
        });
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    setLivenessPrompt('Analyzing camera liveness & extracting biometric template...');

    setTimeout(async () => {
      if (videoRef.current) {
        const descriptor = await captureFaceDescriptor(videoRef.current);
        setIsCapturing(false);
        onFaceVerified(descriptor);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Unrecognized Device Detected</h3>
            <p className="text-xs text-slate-400">Step 7 Face Liveness Verification Required</p>
          </div>
        </div>

        {errorMsg ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm mb-4">
            {errorMsg}
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video mb-4 border border-slate-800 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
            <div className="absolute inset-0 border-2 border-dashed border-sky-400/50 rounded-full m-8 pointer-events-none animate-pulse flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-sky-400/30" />
            </div>
          </div>
        )}

        <p className="text-xs text-center text-sky-400 bg-sky-500/10 py-2 px-3 rounded-xl mb-6 border border-sky-500/20 font-medium">
          {livenessPrompt}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCapture}
            disabled={isCapturing || !!errorMsg}
            className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            <span>{isCapturing ? 'Verifying...' : 'Verify Face'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
