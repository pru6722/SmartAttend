import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export const QRCode: React.FC<QRCodeProps> = ({ value, size = 200 }) => {
  const qrValue = value || '582731';

  // Deterministic SVG QR Matrix Generator with High Contrast Quiet Zone
  const generateMatrix = (text: string) => {
    const matrixSize = 25;
    const grid = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(false));

    // Corner Finder Patterns (7x7)
    const addFinder = (row: number, col: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            grid[row + r][col + c] = true;
          }
        }
      }
    };

    addFinder(0, 0);
    addFinder(0, matrixSize - 7);
    addFinder(matrixSize - 7, 0);

    // Data hash distribution
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        const isFinder = (r < 8 && c < 8) || (r < 8 && c >= matrixSize - 8) || (r >= matrixSize - 8 && c < 8);
        if (!isFinder) {
          grid[r][c] = ((hash ^ (r * 31 + c * 17)) % 3) === 0;
        }
      }
    }

    return grid;
  };

  const grid = generateMatrix(qrValue);
  const cellSize = size / grid.length;

  return (
    <div className="inline-block p-4 bg-white rounded-2xl shadow-xl border border-slate-200">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="#ffffff" />
        {grid.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.5}
                height={cellSize + 0.5}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
      <div className="mt-2 text-center">
        <span className="font-mono font-bold text-xs tracking-widest text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
          CODE: {qrValue}
        </span>
      </div>
    </div>
  );
};
