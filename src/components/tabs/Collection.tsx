import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive } from 'lucide-react';
import { fetchReceipts, type ReceiptDoc } from '../../firebase';
import { ReceiptStackCard } from '../ReceiptStackCard';
import { AIManagerBubble } from '../AIManagerBubble';
import { getRandomManagerComment } from '../../lib/managerComments';
import { useTheme } from '../../context/ThemeContext';
import { ReceiptFrame } from '../ReceiptFrame';

const CARD_TOP_OFFSET = 24;
const CARD_STACK_OFFSET = 44;

interface CollectionProps {
  userId: string | null;
}

const formatDate = (ts: { toDate: () => Date } | null) => {
  if (!ts) return '—';
  const d = ts.toDate();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export const Collection: React.FC<CollectionProps> = ({ userId }) => {
  const theme = useTheme();
  const [receipts, setReceipts] = useState<ReceiptDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDoc | null>(null);
  const [hoveredReceipt, setHoveredReceipt] = useState<ReceiptDoc | null>(null);
  const [managerMessage, setManagerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setReceipts([]);
      setLoading(false);
      setManagerMessage(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchReceipts(userId)
      .then((data) => {
        setReceipts(data);
        if (data.length > 0) setManagerMessage(getRandomManagerComment('collection_index'));
      })
      .catch((e) => {
        console.error('영수증 목록 로드 실패', e);
        setError('영수증을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center transition-colors" style={{ background: theme.bg, color: theme.text }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-lime border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono opacity-80">LOADING RECEIPTS...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center transition-colors" style={{ background: theme.bg, color: theme.text }}>
        <p className="text-red-400 font-mono text-sm">{error}</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center transition-colors" style={{ background: theme.bg, color: theme.text }}>
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
              <Archive size={40} className="text-brand-lime" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">영수증 창고</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              WORKSHOP에서 활동을 기록하고 [영수증 발행]을 누르면 여기에 쌓입니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stackHeight = CARD_TOP_OFFSET + receipts.length * CARD_STACK_OFFSET + 220;
  const totalMeters = (receipts.length * 0.08).toFixed(1);

  return (
    <section className="py-12 relative overflow-hidden min-h-[70vh] transition-colors" style={{ background: theme.bg, color: theme.text }}>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
            영수증 <span className="text-brand-lime">창고</span>
          </h2>
          <p className="text-base font-mono mb-2 opacity-90">
            성장을 증명하는 영수증 — 당신의 기록이 쌓입니다.
          </p>
          <p className="text-gray-300 text-base font-mono mb-2">
            발행한 플로우 영수증 {receipts.length}장 · 총 <span className="text-brand-lime font-bold">{totalMeters}m</span>
          </p>
        </div>

        <ReceiptFrame caption="AI 점주: 오늘도 한 장 한 장이 당신의 역사가 됩니다." className="max-w-2xl mx-auto mb-6">
          <div className="space-y-2 text-center">
            <p className="font-bold">발행 영수증 {receipts.length}장</p>
            <p className="text-gray-600 text-sm">클릭하여 상세 보기</p>
          </div>
        </ReceiptFrame>

        <div className="relative mx-auto" style={{ width: '100%', maxWidth: '24rem' }}>
          {/* 스택 뒤 겹겹이 그림자 (종이 뭉치 깊이감) */}
          {receipts.length > 0 && (
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 rounded-lg pointer-events-none"
              style={{
                width: 'calc(100% - 8px)',
                height: stackHeight,
                boxShadow: [
                  '0 4px 6px -2px rgba(0,0,0,0.3)',
                  '0 8px 12px -4px rgba(0,0,0,0.25)',
                  '0 12px 18px -6px rgba(0,0,0,0.2)',
                  '0 16px 24px -8px rgba(0,0,0,0.18)',
                  '0 20px 30px -10px rgba(0,0,0,0.15)',
                ].join(', '),
                zIndex: 0,
              }}
              aria-hidden
            />
          )}
        <div
          className="relative mx-auto overflow-y-auto overflow-x-hidden rounded-xl"
          style={{
            minHeight: '420px',
            maxHeight: '70vh',
            width: '100%',
            maxWidth: '24rem',
            paddingBottom: stackHeight,
          }}
        >
          {receipts.map((receipt, index) => (
            <ReceiptStackCard
              key={receipt.id}
              receipt={receipt}
              index={index}
              total={receipts.length}
              onClick={() => setSelectedReceipt(receipt)}
              onHoverStart={() => setHoveredReceipt(receipt)}
              onHoverEnd={() => setHoveredReceipt(null)}
            />
          ))}
        </div>
        </div>

        {/* 영수증 상세 모달 */}
        <AnimatePresence>
          {selectedReceipt && (
            <>
              <motion.div
                className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                onClick={() => setSelectedReceipt(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="fixed inset-0 z-40 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="relative w-full max-w-md font-mono rounded-xl overflow-hidden shadow-2xl"
                  style={{
                    background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
                    border: `1px solid ${theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB'}`,
                  }}
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}>
                    <span className="text-sm uppercase tracking-wider" style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}>
                      {formatDate(selectedReceipt.createdAt)}
                    </span>
                    <span className="text-xs uppercase" style={{ color: theme.mode === 'dark' ? '#999999' : '#6B7280' }}>
                      #{selectedReceipt.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}>
                    <span className="text-sm" style={{ color: theme.mode === 'dark' ? '#999999' : '#6B7280' }}>
                      {selectedReceipt.sessions.length}개 세션
                    </span>
                    <span className="font-bold" style={{ color: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6' }}>
                      {selectedReceipt.totalFormatted}
                    </span>
                  </div>
                  <div className="px-6 py-4 max-h-64 overflow-y-auto space-y-3">
                    {selectedReceipt.sessions.map((s, i) => (
                      <div key={i} className="border-b pb-3" style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="mr-1">{s.categoryEmoji ?? '🎯'}</span>
                          <span className="font-medium flex-1 truncate" style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}>{s.subject}</span>
                          <span className="text-sm font-mono shrink-0" style={{ color: theme.mode === 'dark' ? '#CCFF00' : '#10B981' }}>
                            {s.elapsedFormatted ?? `${s.duration}분`}
                          </span>
                        </div>
                        {s.keyInsight && (
                          <p className="text-xs mt-1 pl-5" style={{ color: theme.mode === 'dark' ? '#999999' : '#6B7280' }}>{s.keyInsight}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedReceipt.categoryStats.length > 0 && (
                    <div className="px-6 py-4 border-t" style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}>
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: theme.mode === 'dark' ? '#999999' : '#6B7280' }}>카테고리별 통계</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedReceipt.categoryStats.map((stat, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: theme.mode === 'dark' ? '#2C2C2E' : '#F3F4F6',
                              color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
                            }}
                          >
                            {stat.categoryEmoji ?? '🎯'} {stat.categoryName ?? stat.categoryId} · {stat.formatted}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(null)}
                      className="px-4 py-2 rounded-lg font-mono text-sm font-bold uppercase"
                      style={{
                        background: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
                        color: theme.mode === 'dark' ? '#000000' : '#FFFFFF',
                      }}
                    >
                      닫기
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
      <AIManagerBubble message={managerMessage} position="bottom-right" />
    </section>
  );
};
