import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle2, Upload, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { decodeQRCodeFromImage, extractAttendanceCode } from '../utils/qrDecoder';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScannedCode('');
      setUploadedPreview(null);
      setManualCodeInput('');
      setIsSuccess(false);
      setErrorMsg('');

      startCamera();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      let s: MediaStream;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch (e) {
        s = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play().catch(() => {});
      }
      startContinuousScanLoop();
    } catch (err) {
      setErrorMsg('Camera access unavailable. Upload a QR image screenshot below or confirm code.');
    }
  };

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

  const startContinuousScanLoop = () => {
    const scanFrame = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        // BarcodeDetector API check
        if ('BarcodeDetector' in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = extractAttendanceCode(barcodes[0].rawValue);
              if (code) {
                triggerSuccess(code);
                return;
              }
            }
          } catch (e) {}
        }

        // Pure JS Frame Decoder fallback
        try {
          const decoded = decodeQRCodeFromImage(videoRef.current);
          if (decoded) {
            const code = extractAttendanceCode(decoded);
            if (code) {
              triggerSuccess(code);
              return;
            }
          }
        } catch (e) {}
      }

      animFrameId.current = requestAnimationFrame(scanFrame);
    };

    animFrameId.current = requestAnimationFrame(scanFrame);
  };

  const triggerSuccess = (code: string) => {
    stopScanner();
    setScannedCode(code);
    setIsSuccess(true);
    setTimeout(() => {
      onScanSuccess(code);
      onClose();
    }, 400);
  };

  // Upload QR Image / Screenshot Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedPreview(dataUrl);

      const img = new Image();
      img.onload = async () => {
        let foundCode: string | null = null;

        if ('BarcodeDetector' in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await detector.detect(img);
            if (barcodes.length > 0) {
              foundCode = extractAttendanceCode(barcodes[0].rawValue);
            }
          } catch (err) {}
        }

        if (!foundCode) {
          foundCode = decodeQRCodeFromImage(img);
        }

        if (!foundCode) {
          foundCode = extractAttendanceCode(file.name);
        }

        if (foundCode) {
          triggerSuccess(foundCode);
        } else {
          // Display quick confirmation helper if standard barcode scanner was unreadable
          setErrorMsg('QR Image uploaded! Enter the 6-digit code printed on your image below to confirm.');
        }
      };
      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleManualConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCodeInput.length === 6) {
      triggerSuccess(manualCodeInput);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl border border-sky-500/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Classroom QR Scanner</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Point camera at classroom screen or upload QR screenshot</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Video / Upload Preview Display */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square border border-slate-800 flex items-center justify-center shadow-inner">
          {uploadedPreview ? (
            <img src={uploadedPreview} alt="Uploaded QR" className="w-full h-full object-contain" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}

          {/* Reticle Overlay */}
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
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>QR Code Decoded: {scannedCode} — Submitting...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm">
              <Upload className="w-4 h-4 text-sky-500" />
              <span>Upload QR Image / Screenshot</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {uploadedPreview && (
              <form onSubmit={handleManualConfirm} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code shown on image..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-sky-400 text-center outline-none"
                />
                <button
                  type="submit"
                  disabled={manualCodeInput.length !== 6}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold rounded-xl text-xs disabled:opacity-50 flex items-center gap-1 shadow"
                >
                  <Check className="w-4 h-4" /> Confirm
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
