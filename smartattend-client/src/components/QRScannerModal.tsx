import React, { useRef, useState, useEffect } from 'react';
import { QrCode, X, CheckCircle2, Upload, AlertCircle, Camera } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScannedCode('');
      setIsSuccess(false);
      setErrorMsg('');

      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
        .then((s) => {
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
          startRealtimeScanner();
        })
        .catch(() => {
          setErrorMsg('Camera access unavailable. Please grant camera permission or upload a QR image.');
        });
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startRealtimeScanner = () => {
    if ('BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      
      const scanLoop = async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              const extracted = extractCodeFromQR(rawValue);
              if (extracted) {
                triggerSuccess(extracted);
                return;
              }
            }
          } catch (e) {}
        }
        animFrameId.current = requestAnimationFrame(scanLoop);
      };

      animFrameId.current = requestAnimationFrame(scanLoop);
    }
  };

  const extractCodeFromQR = (rawText: string): string | null => {
    const match = rawText.match(/\b\d{6}\b/);
    if (match) return match[0];
    if (rawText.length === 6 && /^\d+$/.test(rawText)) return rawText;
    return rawText.trim();
  };

  const triggerSuccess = (code: string) => {
    stopScanner();
    setScannedCode(code);
    setIsSuccess(true);
    setTimeout(() => {
      onScanSuccess(code);
      onClose();
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = async () => {
      if ('BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await detector.detect(img);
          if (barcodes.length > 0) {
            const extracted = extractCodeFromQR(barcodes[0].rawValue);
            if (extracted) {
              triggerSuccess(extracted);
              return;
            }
          }
        } catch (err) {}
      }
    };
    img.src = URL.createObjectURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl border border-sky-500/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Classroom QR Scanner</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Point your camera at the classroom screen QR code</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square mb-4 border border-slate-800 flex items-center justify-center shadow-inner">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Precision Laser Scanning Reticle */}
          <div className={`absolute inset-8 border-2 rounded-2xl pointer-events-none flex flex-col justify-between p-3 transition-colors ${
            isSuccess ? 'border-emerald-400 bg-emerald-500/10' : 'border-sky-400'
          }`}>
            <div className="flex justify-between">
              <div className="w-5 h-5 border-t-4 border-l-4 border-sky-400 rounded-tl"></div>
              <div className="w-5 h-5 border-t-4 border-r-4 border-sky-400 rounded-tr"></div>
            </div>

            {!isSuccess && (
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-pulse shadow-lg shadow-sky-400"></div>
            )}

            <div className="flex justify-between">
              <div className="w-5 h-5 border-b-4 border-l-4 border-sky-400 rounded-bl"></div>
              <div className="w-5 h-5 border-b-4 border-r-4 border-sky-400 rounded-br"></div>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold text-center mb-4 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>QR Code Decoded: {scannedCode} - Submitting Pipeline...</span>
          </div>
        ) : (
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-4">
            Position classroom screen QR code in center frame to auto-detect.
          </p>
        )}

        <div>
          <label className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700">
            <Upload className="w-4 h-4 text-sky-500" />
            <span>Upload QR Image / Screenshot</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
