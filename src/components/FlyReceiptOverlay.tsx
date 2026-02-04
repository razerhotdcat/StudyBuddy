import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

interface FlyReceiptOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

export const FlyReceiptOverlay: React.FC<FlyReceiptOverlayProps> = ({ visible, onComplete }) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!visible) return;
    const el = document.getElementById('tab-collection');
    if (el) setTargetRect(el.getBoundingClientRect());
    else setTargetRect({ x: window.innerWidth / 2 - 40, y: 60, width: 80, height: 40 } as DOMRect);
  }, [visible]);

  if (!visible) return null;

  const startX = typeof window !== 'undefined' ? window.innerWidth / 2 - 80 : 0;
  const startY = typeof window !== 'undefined' ? window.innerHeight * 0.55 : 0;
  const endX = targetRect ? targetRect.x + targetRect.width / 2 - 80 : startX;
  const endY = targetRect ? targetRect.y + targetRect.height / 2 - 50 : 0;

  const content = (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      aria-hidden
    >
      <motion.div
        className="absolute w-40 rounded-lg bg-white font-mono shadow-2xl border-2 border-brand-lime/80 p-3"
        initial={{ x: startX, y: startY, opacity: 1, scale: 1 }}
        animate={{
          x: endX,
          y: endY,
          opacity: 0.3,
          scale: 0.25,
          transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
        }}
        onAnimationComplete={onComplete}
      >
        <div className="text-[10px] font-bold text-black uppercase tracking-wider">Flow Receipt</div>
        <div className="text-[9px] text-gray-500 mt-0.5">→ COLLECTION</div>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
};
