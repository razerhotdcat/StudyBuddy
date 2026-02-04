import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIManagerBubbleProps {
  /** 표시할 메시지. null이면 말풍선 숨김 */
  message: string | null;
  /** 말풍선 위치: bottom-right | bottom-left */
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

/**
 * AI 점주의 작은 알림/말풍선. 사용자 영수증 내용을 가리지 않도록 작은 폰트·하단 고정.
 */
export const AIManagerBubble: React.FC<AIManagerBubbleProps> = ({
  message,
  position = 'bottom-right',
  className = '',
}) => {
  const positionClasses =
    position === 'bottom-right' ? 'right-4 bottom-4' : 'left-4 bottom-4';

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`fixed z-40 max-w-[200px] rounded-lg border border-brand-lime/70 bg-[#1a1a1a]/95 px-3 py-2 shadow-lg ${positionClasses} ${className}`}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-[9px] font-bold text-brand-lime uppercase tracking-wider mb-0.5">
            Manager
          </p>
          <p className="text-[11px] text-gray-200 leading-snug break-words">
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
