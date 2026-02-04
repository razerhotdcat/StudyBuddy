import React from 'react';
import { ReceiptTopStrip } from './ReceiptTopStrip';
import { ZigzagEdge } from './ZigzagEdge';

const RECEIPT_FONT = '"JetBrains Mono", ui-monospace, monospace';
const RECEIPT_BG = '#FCFCFC';

interface ReceiptFrameProps {
  children: React.ReactNode;
  /** 영수증 상단 코멘트 (AI 점주 / 감성 문구) */
  caption?: string;
  className?: string;
  /** 최소 글자 크기 18px 유지 */
  fontSize?: number;
}

export const ReceiptFrame: React.FC<ReceiptFrameProps> = ({
  children,
  caption,
  className = '',
  fontSize = 18,
}) => {
  return (
    <div
      className={`rounded-xl overflow-hidden border border-gray-200 shadow-xl w-full max-w-[min(100%,42rem)] mx-auto px-0 md:px-0 flex flex-col ${className}`}
      style={{
        fontFamily: RECEIPT_FONT,
        fontSize: Math.max(18, fontSize),
        background: RECEIPT_BG,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2), 0 12px 24px -8px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)',
      }}
    >
      <ReceiptTopStrip />
      {caption && (
        <div className="shrink-0 px-4 pb-2">
          <p className="text-center text-gray-600 font-medium italic" style={{ fontSize: Math.max(16, fontSize - 2) }}>
            {caption}
          </p>
        </div>
      )}
      <div className="p-4 text-black flex-1 min-h-0">
        {children}
      </div>
      <div className="shrink-0">
        <ZigzagEdge fill={RECEIPT_BG} height={14} />
      </div>
    </div>
  );
};
