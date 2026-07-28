/**
 * Browser Device Fingerprinting Utility
 * Gathers hardware & software signals to generate a unique device hash
 */
export async function generateDeviceFingerprint() {
  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const platform = navigator.platform;
  const screenResolution = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;

  // Canvas fingerprinting
  let canvasHash = '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('SmartAttend-ERP-Fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('SmartAttend-ERP-Fingerprint', 4, 17);
      canvasHash = canvas.toDataURL().slice(-50);
    }
  } catch (e) {
    canvasHash = 'canvas-disabled';
  }

  // Combine raw string features
  const rawString = `${userAgent}|${language}|${platform}|${screenResolution}|${timezone}|${hardwareConcurrency}|${canvasHash}`;

  // Simple Hash Function (SHA-256 equivalent)
  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fingerprintHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return {
    userAgent,
    language,
    platform,
    screenResolution,
    timezone,
    hardwareConcurrency,
    canvasHash,
    fingerprintHash,
  };
}
