import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ZigzagEdge } from './ZigzagEdge';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, newLevel }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="relative w-full max-w-sm rounded-t-2xl border-2 border-brand-lime border-b-0 bg-[#1a1a1a] p-8 shadow-2xl shadow-brand-lime/20 text-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-lime/20 border-2 border-brand-lime mb-4">
            <Sparkles className="w-8 h-8 text-brand-lime" />
          </div>
          <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wider mb-1">
            Level Up!
          </h3>
          <p className="text-4xl font-black text-brand-lime mb-4">Lv.{newLevel}</p>
          <p className="text-sm text-gray-400 mb-6">
            영수증 한 장이 당신의 성장 기록이 됐어요.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-brand-lime text-black font-bold hover:bg-white transition-colors"
          >
            확인
          </button>
          <ZigzagEdge fill="#1a1a1a" height={10} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
