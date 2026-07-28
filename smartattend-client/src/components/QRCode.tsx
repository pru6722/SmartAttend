import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export const QRCode: React.FC<QRCodeProps> = ({ value, size = 180 }) => {
  // Deterministic SVG QR Matrix generator based on string hash
  const generateMatrix = (str: string) => {
    const grid = 15;
    const matrix: boolean[][] = Array(grid).fill(false).map(() => Array(grid).fill(false));

    // Corner Finder Patterns
    const addFinder = (r: number, c: number) => {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const isEdge = i === 0 || i === 4 || j === 0 || j === 4;
          const isCenter = i === 2 && j === 2;
          matrix[r + i][c + j] = isEdge || isCenter;
        }
      }
    };

    addFinder(0, 0);
    addFinder(0, grid - 5);
    addFinder(grid - 5, 0);

    // Fill data modules deterministically
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        const inFinder = (r < 5 && c < 5) || (r < 5 && c >= grid - 5) || (r >= grid - 5 && c < 5);
        if (!inFinder) {
          matrix[r][c] = Math.abs((hash ^ (r * 31 + c * 17))) % 3 === 0;
        }
      }
    }

    return { grid, matrix };
  };

  const { grid, matrix } = generateMatrix(value || 'AUTO-OTP');
  const cellSize = size / grid;

  return (
    <div className="inline-block p-4 bg-white rounded-2xl shadow-xl border border-slate-200">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {matrix.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0f172a"
                rx={1}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
