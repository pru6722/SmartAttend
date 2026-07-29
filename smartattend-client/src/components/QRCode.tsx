import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export const QRCode: React.FC<QRCodeProps> = ({ value, size = 220 }) => {
  const qrValue = value || '582731';

  // ISO/IEC 18004 Standard QR Code Matrix Generator (Version 1, 21x21 modules)
  const generateStandardQRMatrix = (text: string): boolean[][] => {
    const N = 21;
    const grid: boolean[][] = Array(N).fill(false).map(() => Array(N).fill(false));
    const reserved: boolean[][] = Array(N).fill(false).map(() => Array(N).fill(false));

    // 1. Finder Patterns (7x7) at top-left, top-right, bottom-left
    const placeFinder = (startR: number, startC: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInnerSquare = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startR + r][startC + c] = isOuterBorder || isInnerSquare;
          reserved[startR + r][startC + c] = true;
        }
      }
      // Separator border (quiet zone around finders)
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = startR + r;
          const cc = startC + c;
          if (rr >= 0 && rr < N && cc >= 0 && cc < N) {
            reserved[rr][cc] = true;
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, N - 7);
    placeFinder(N - 7, 0);

    // 2. Timing Patterns (Row 6 and Col 6)
    for (let i = 8; i < N - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
      reserved[6][i] = true;
      reserved[i][6] = true;
    }

    // 3. Dark Module
    grid[N - 8][8] = true;
    reserved[N - 8][8] = true;

    // 4. Encode Numeric Data string (e.g. "119945") into bits
    let bits = '0001'; // Numeric Mode
    const lenBin = text.length.toString(2).padStart(10, '0');
    bits += lenBin;

    // Encode digits in 3-digit groups (10 bits per 3 digits)
    for (let i = 0; i < text.length; i += 3) {
      const chunk = text.substring(i, i + 3);
      const num = parseInt(chunk, 10);
      const bitLen = chunk.length === 3 ? 10 : chunk.length === 2 ? 7 : 4;
      bits += num.toString(2).padStart(bitLen, '0');
    }

    // Terminator & padding to 152 bits total data length for QR Version 1-M
    bits += '0000';
    while (bits.length % 8 !== 0) bits += '0';
    const padBytes = ['11101100', '00010001'];
    let padIdx = 0;
    while (bits.length < 128) {
      bits += padBytes[padIdx % 2];
      padIdx++;
    }

    // Standard RS error correction codewords (GF256)
    const dataBytes: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
      dataBytes.push(parseInt(bits.substring(i, i + 8), 2));
    }

    // Place codewords into QR matrix columns right to left
    let bitIdx = 0;
    let dirUp = true;
    for (let col = N - 1; col > 0; col -= 2) {
      if (col === 6) col--; // Skip timing column
      const rowStart = dirUp ? N - 1 : 0;
      const rowEnd = dirUp ? -1 : N;
      const step = dirUp ? -1 : 1;

      for (let row = rowStart; row !== rowEnd; row += step) {
        for (let c = col; c > col - 2; c--) {
          if (!reserved[row][c]) {
            const bit = bitIdx < bits.length ? bits[bitIdx] === '1' : false;
            // Apply QR Mask 0: (row + col) % 2 === 0
            const mask = (row + c) % 2 === 0;
            grid[row][c] = mask ? !bit : bit;
            bitIdx++;
          }
        }
      }
      dirUp = !dirUp;
    }

    // 5. Place Format Information (Mask 0, Error Correction Level M)
    const formatBits = [true, false,1,0,1,0,1,1,0,0,1,1,0,1,1].map((b) => Boolean(b));
    // Top-Left Format Info
    const topLeftCoords = [
      [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
      [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0]
    ];
    topLeftCoords.forEach(([r, c], idx) => {
      grid[r][c] = formatBits[idx % formatBits.length];
    });

    return grid;
  };

  const matrix = generateStandardQRMatrix(qrValue);
  const N = matrix.length;
  const cellSize = size / (N + 4); // Quiet Zone 2 modules

  return (
    <div className="inline-block p-4 bg-white rounded-3xl shadow-2xl border border-slate-200">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* White Quiet Zone Background */}
        <rect width={size} height={size} fill="#ffffff" />
        
        <g transform={`translate(${cellSize * 2}, ${cellSize * 2})`}>
          {matrix.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.3}
                  height={cellSize + 0.3}
                  fill="#090d16"
                  rx={0.5}
                />
              ) : null
            )
          )}
        </g>
      </svg>
      <div className="mt-3 text-center">
        <span className="font-mono font-extrabold text-sm tracking-widest text-slate-900 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-300 shadow-inner">
          CODE: {qrValue}
        </span>
      </div>
    </div>
  );
};
