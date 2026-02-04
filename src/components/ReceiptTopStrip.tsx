import React from 'react';

const RECEIPT_OFF_WHITE = '#FCFCFC';

/** 영수증 상단: 프린터 구멍 + StudyBuddy 픽셀 로고 */
export const ReceiptTopStrip: React.FC<{ className?: string; showLogo?: boolean }> = ({
  className = '',
  showLogo = true,
}) => (
  <div
    className={`shrink-0 flex flex-col items-center pt-3 pb-2 border-b border-dashed border-gray-200 ${className}`}
    style={{ background: RECEIPT_OFF_WHITE }}
  >
    {/* 프린터 구멍 (perforation) */}
    <div className="flex justify-center gap-4 mb-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full border border-gray-300"
          style={{ background: 'rgba(0,0,0,0.06)' }}
          aria-hidden
        />
      ))}
    </div>
    {showLogo && (
      <div className="flex items-center justify-center gap-2">
        {/* 픽셀 아트 느낌 로고: SB 배지 */}
        <div
          className="w-9 h-9 rounded-sm border-2 border-black flex items-center justify-center font-bold text-sm"
          style={{
            background: '#000',
            color: '#CCFF00',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            imageRendering: 'pixelated',
          }}
        >
          SB
        </div>
        <span
          className="font-bold uppercase tracking-widest text-black text-sm"
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            letterSpacing: '0.2em',
          }}
        >
          StudyBuddy
        </span>
      </div>
    )}
  </div>
);
