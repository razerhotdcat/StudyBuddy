import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { ZigzagEdge } from './ZigzagEdge';
import type { SquareFeedItem } from '../firebase';

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
};

interface SquareReceiptCardProps {
  item: SquareFeedItem;
  onReaction: (item: SquareFeedItem) => void;
  isReacting: boolean;
}

export const SquareReceiptCard: React.FC<SquareReceiptCardProps> = ({ item, onReaction, isReacting }) => {
  const [stamp, setStamp] = useState<'fire' | 'respect' | null>(null);

  const handleFire = () => {
    if (isReacting) return;
    setStamp('fire');
    onReaction(item);
    setTimeout(() => setStamp(null), 800);
  };

  const handleRespect = () => {
    if (isReacting) return;
    setStamp('respect');
    onReaction(item);
    setTimeout(() => setStamp(null), 800);
  };

  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto rounded-t-lg overflow-visible receipt-paper"
      style={{ background: '#FFFFFF', color: '#000000', boxShadow: '0 8px 24px -4px rgba(0,0,0,0.25)' }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider" style={{ color: '#000000' }}>
            {item.authorLabel} 님
          </span>
          <span className="text-[10px] font-bold bg-brand-lime/90 text-black px-2 py-0.5 rounded">
            {formatDuration(item.minutes)}
          </span>
        </div>
        <p className="text-sm font-bold leading-tight line-clamp-2 mb-2" style={{ color: '#000000' }}>
          &quot;{item.subject}&quot;
        </p>
        <p className="text-[10px] uppercase tracking-widest" style={{ color: '#000000' }}>Flow Receipt</p>
      </div>

      <div className="flex items-center justify-center gap-2 px-4 py-2 border-t border-dashed border-gray-200">
        <button
          type="button"
          onClick={handleFire}
          disabled={isReacting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-lime/70 text-brand-lime hover:bg-brand-lime hover:text-black transition-colors disabled:opacity-50 text-xs font-bold"
        >
          <Flame size={14} />
          FIRE
        </button>
        <button
          type="button"
          onClick={handleRespect}
          disabled={isReacting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-lime/70 text-brand-lime hover:bg-brand-lime hover:text-black transition-colors disabled:opacity-50 text-xs font-bold"
        >
          <span aria-hidden>🫡</span>
          RESPECT
        </button>
      </div>

      <div className="mt-auto">
        <ZigzagEdge fill="#FCFCFC" height={12} />
      </div>

      <AnimatePresence>
        {stamp && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.25 }}
          >
            <span
              className="font-black text-4xl md:text-5xl uppercase tracking-widest select-none"
              style={{
                color: stamp === 'fire' ? '#ccff00' : '#1a1a1a',
                textShadow: '0 0 20px rgba(204,255,0,0.6)',
                transform: 'rotate(-8deg)',
              }}
            >
              {stamp === 'fire' ? '🔥 FIRE' : '🫡 RESPECT'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
