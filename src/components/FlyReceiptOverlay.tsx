import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ZigzagEdge } from './ZigzagEdge';
import { ReceiptTopStrip } from './ReceiptTopStrip';

const RECEIPT_FONT = '"JetBrains Mono", ui-monospace, monospace';
const RECEIPT_BG = '#FCFCFC';

interface FlyReceiptOverlayProps {
  visible: boolean;
  onComplete: () => void;
  /** 발행된 세션 수 (미니 영수증 표시용) */
  sessionCount?: number;
}

export const FlyReceiptOverlay: React.FC<FlyReceiptOverlayProps> = ({
  visible,
  onComplete,
  sessionCount = 0,
}) => {
  const [phase, setPhase] = useState<'print' | 'fly'>('print');
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!visible) return;
    setPhase('print');
    const t = setTimeout(() => setPhase('fly'), 2200);
    return () => clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    if (phase !== 'fly') return;
    const el = document.getElementById('tab-collection');
    if (el) setTargetRect(el.getBoundingClientRect());
    else setTargetRect({ x: window.innerWidth / 2 - 40, y: 60, width: 80, height: 40 } as DOMRect);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'fly' || !targetRect) return;
    const t = setTimeout(onComplete, 700);
    return () => clearTimeout(t);
  }, [phase, targetRect, onComplete]);

  if (!visible) return null;

  const startY = 80;
  const printHeight = Math.min(420, typeof window !== 'undefined' ? window.innerHeight - 160 : 400);
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const endX = targetRect ? targetRect.x + targetRect.width / 2 : centerX;
  const endY = targetRect ? targetRect.y + targetRect.height / 2 : 50;

  const content = (
    <div className="fixed inset-0 z-[100] pointer-events-none flex justify-center" aria-hidden>
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-[280px] max-w-[90vw] rounded-t-lg overflow-hidden border border-gray-200 flex flex-col shadow-xl"
        style={{
          fontFamily: RECEIPT_FONT,
          fontSize: 18,
          background: RECEIPT_BG,
          boxShadow: phase === 'print' ? '0 25px 50px -12px rgba(0,0,0,0.25), 0 12px 24px -8px rgba(0,0,0,0.18)' : '0 8px 24px rgba(0,0,0,0.2)',
        }}
        initial={{ height: 0, opacity: 1, top: startY }}
        animate={
          phase === 'print'
            ? { height: printHeight, opacity: 1, top: startY, scale: 1 }
            : {
                x: endX - centerX,
                y: endY - startY,
                height: 56,
                width: 96,
                scale: 0.32,
                opacity: 0.92,
              }
        }
        transition={
          phase === 'print'
            ? { duration: 2, ease: [0.32, 0.72, 0, 1] }
            : { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
        }
      >
        <ReceiptTopStrip />
        <div className="shrink-0 px-4 pb-2 border-b border-dashed border-gray-200">
          <p className="text-center text-black font-semibold text-sm">Flow Receipt</p>
          <p className="text-center text-black font-medium mt-0.5 text-sm">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </p>
        </div>
        <div className="flex-1 overflow-hidden px-4 py-3">
          <p className="text-black font-bold text-center">
            {sessionCount > 0 ? `세션 ${sessionCount}건 → COLLECTION` : '→ COLLECTION'}
          </p>
          <p className="text-gray-500 text-center text-sm mt-2">성장을 증명하는 영수증</p>
        </div>
        <div className="shrink-0">
          <ZigzagEdge fill={RECEIPT_BG} height={14} />
        </div>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
};
