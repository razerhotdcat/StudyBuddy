import React from 'react';
import { motion } from 'framer-motion';
import type { StudySessionDoc, ReceiptDoc } from '../firebase';

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const formatDate = (ts: { toDate: () => Date } | null) => {
  if (!ts) return '—';
  const d = ts.toDate();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

interface ReceiptStackCardProps {
  /** 영수증 한 장 (세션 목록 + 총 시간 + 카테고리 통계) */
  receipt?: ReceiptDoc;
  /** 레거시: 단일 세션 (receipt 없을 때) */
  session?: StudySessionDoc;
  index: number;
  total: number;
  onClick?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const CARD_TOP_OFFSET = 24;
const CARD_STACK_OFFSET = 44;

export const ReceiptStackCard: React.FC<ReceiptStackCardProps> = ({
  receipt,
  session,
  index,
  total,
  onClick,
  onHoverStart,
  onHoverEnd,
}) => {
  const rotation = (index % 5) - 2;
  const topPx = CARD_TOP_OFFSET + index * CARD_STACK_OFFSET;
  const zIndex = total - index;

  if (receipt) {
    const dateStr = formatDate(receipt.createdAt);
    const receiptNumber = receipt.id.slice(-6).toUpperCase();

    return (
      <motion.div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
        className="absolute left-1/2 w-full max-w-sm -translate-x-1/2 cursor-pointer rounded-lg px-5 py-4 font-mono drop-shadow-lg overflow-hidden"
        style={{
          top: topPx,
          zIndex,
          background: '#FFFFFF',
          color: '#000000',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.2)',
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, rotate: rotation }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{
          y: -22,
          scale: 1.06,
          rotate: 5,
          boxShadow: '0 28px 56px -12px rgba(0,0,0,0.4), 0 0 32px rgba(204,255,0,0.25)',
          transition: { duration: 0.25, ease: 'easeOut' },
        }}
      >
        <div className="border-b border-dashed border-gray-200 pb-2 mb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm uppercase tracking-wider" style={{ color: '#000000' }}>
              {dateStr}
            </span>
            <span className="text-xs uppercase tracking-wider" style={{ color: '#6B7280' }}>
              #{receiptNumber}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-xs" style={{ color: '#6B7280' }}>
              {receipt.sessions.length}개 세션
            </span>
            <span className="text-sm font-bold bg-brand-lime/90 px-2 py-0.5 rounded" style={{ color: '#000000' }}>
              {receipt.totalFormatted}
            </span>
          </div>
        </div>
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {receipt.sessions.map((s, i) => (
            <div key={i} className="flex items-start justify-between gap-2 text-sm border-b border-gray-100 pb-1">
              <div className="min-w-0 flex-1">
                <span className="mr-1">{s.categoryEmoji ?? '🎯'}</span>
                <span className="font-medium truncate block" style={{ color: '#000000' }}>{s.subject}</span>
                {s.keyInsight && (
                  <p className="text-xs leading-relaxed line-clamp-1 pl-4" style={{ color: '#6B7280' }}>{s.keyInsight}</p>
                )}
              </div>
              <span className="text-xs font-mono shrink-0" style={{ color: '#10B981' }}>
                {s.elapsedFormatted ?? formatDuration(s.duration)}
              </span>
            </div>
          ))}
        </div>
        {receipt.categoryStats.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>카테고리</p>
            <div className="flex flex-wrap gap-1">
              {receipt.categoryStats.map((stat, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100" style={{ color: '#000000' }}>
                  {stat.categoryEmoji ?? '🎯'} {stat.formatted}
                </span>
              ))}
            </div>
          </div>
        )}
        <p className="mt-2 text-sm uppercase tracking-wider" style={{ color: '#000000' }}>Flow Receipt</p>
      </motion.div>
    );
  }

  if (!session) return null;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      className="absolute left-1/2 w-full max-w-sm -translate-x-1/2 cursor-pointer rounded-lg px-5 py-4 font-mono drop-shadow-lg overflow-hidden"
      style={{
        top: topPx,
        zIndex,
        background: '#FFFFFF',
        color: '#000000',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.2)',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{
        y: -22,
        scale: 1.06,
        rotate: 5,
        boxShadow: '0 28px 56px -12px rgba(0,0,0,0.4), 0 0 32px rgba(204,255,0,0.25)',
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
    >
      <div className="border-b border-dashed border-gray-200 pb-2 mb-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm uppercase tracking-wider" style={{ color: '#000000' }}>
            {formatDate(session.createdAt)}
          </span>
          <span className="text-sm font-bold bg-brand-lime/90 px-2 py-0.5 rounded" style={{ color: '#000000' }}>
            {formatDuration(session.minutes)}
          </span>
        </div>
      </div>
      <p className="text-base font-bold leading-tight line-clamp-2" style={{ color: '#000000' }}>
        {session.mode === 'target' && <span className="text-brand-lime mr-1">◉</span>}
        {session.subject}
      </p>
      {session.keyInsight && (
        <p className="mt-1 text-sm leading-relaxed line-clamp-2 border-l-2 border-brand-lime/50 pl-2" style={{ color: '#000000' }}>
          {session.keyInsight}
        </p>
      )}
      <p className="mt-2 text-sm uppercase tracking-wider" style={{ color: '#000000' }}>Flow Receipt</p>
    </motion.div>
  );
};
