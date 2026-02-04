import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="relative w-full max-w-sm rounded-xl border-2 border-brand-lime bg-[#1a1a1a] p-6 shadow-2xl shadow-brand-lime/10"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 20px) 100%, 0 100%)',
          }}
        >
          <div className="border-b border-dashed border-gray-600 pb-4 mb-4">
            <p className="text-[10px] text-brand-lime font-mono uppercase tracking-[0.2em] mb-1">
              Daily Receipt
            </p>
            <h3 className="text-xl font-bold text-white font-mono">
              오늘의 정산을 마칠까요?
            </h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            정산을 완료하고 퇴근하시겠습니까?
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border-2 border-brand-lime text-brand-lime font-bold hover:bg-brand-lime hover:text-black transition-colors"
            >
              더 기록하기
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-3 rounded-lg bg-brand-lime text-black font-bold hover:bg-white transition-colors"
            >
              퇴근하기
            </button>
          </div>

          <p className="text-[10px] text-gray-500 text-center mt-4 font-mono">
            Thank you for your process
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
