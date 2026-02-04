import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive } from 'lucide-react';
import { fetchStudySessions, type StudySessionDoc } from '../../firebase';
import { ReceiptStackCard } from '../ReceiptStackCard';
import { ReceiptDetailModal } from '../ReceiptDetailModal';
import { AIManagerBubble } from '../AIManagerBubble';
import { getRandomManagerComment } from '../../lib/managerComments';
import { ZigzagEdge } from '../ZigzagEdge';
import { useTheme } from '../../context/ThemeContext';
import { ReceiptFrame } from '../ReceiptFrame';

const CARD_TOP_OFFSET = 24;
const CARD_STACK_OFFSET = 44;

interface CollectionProps {
  userId: string | null;
}

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
};

export const Collection: React.FC<CollectionProps> = ({ userId }) => {
  const theme = useTheme();
  const [sessions, setSessions] = useState<StudySessionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<StudySessionDoc | null>(null);
  const [hoveredSession, setHoveredSession] = useState<StudySessionDoc | null>(null);
  const [managerMessage, setManagerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setSessions([]);
      setLoading(false);
      setManagerMessage(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchStudySessions(userId)
      .then((data) => {
        setSessions(data);
        if (data.length > 0) setManagerMessage(getRandomManagerComment('collection_index'));
      })
      .catch((e) => {
        console.error('세션 목록 로드 실패', e);
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

  if (sessions.length === 0) {
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
              WORKSHOP에서 활동을 기록하고 [영수증 출력하기]를 누르면 여기에 쌓입니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stackHeight = CARD_TOP_OFFSET + sessions.length * CARD_STACK_OFFSET + 120;
  const totalMeters = (sessions.length * 0.08).toFixed(1);

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
            발행한 플로우 영수증 {sessions.length}장 · 총 <span className="text-brand-lime font-bold">{totalMeters}m</span>
          </p>
        </div>

        <ReceiptFrame caption="AI 점주: 오늘도 한 장 한 장이 당신의 역사가 됩니다." className="max-w-2xl mx-auto mb-6">
          <div className="space-y-2 text-center">
            <p className="font-bold">발행 영수증 {sessions.length}장</p>
            <p className="text-gray-600 text-sm">클릭하여 상세 보기 · 삭제 시 파쇄 효과</p>
          </div>
        </ReceiptFrame>

        <div className="relative mx-auto" style={{ width: '100%', maxWidth: '24rem' }}>
          {/* 스택 뒤 겹겹이 그림자 (종이 뭉치 깊이감) */}
          {sessions.length > 0 && (
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
          {sessions.map((session, index) => (
            <ReceiptStackCard
              key={session.id}
              session={session}
              index={index}
              total={sessions.length}
              onClick={() => setSelectedSession(session)}
              onHoverStart={() => setHoveredSession(session)}
              onHoverEnd={() => setHoveredSession(null)}
            />
          ))}
        </div>
        </div>

        {/* 호버 미리보기: 찢어진 영수증 형태 + 입체감 + 종이 질감 */}
        <AnimatePresence>
          {hoveredSession && (
            <>
              <motion.div
                className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm pointer-events-none"
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="relative w-full max-w-[300px] font-mono overflow-hidden receipt-paper rounded-t-lg"
                  style={{
                    background: '#FFFFFF',
                    color: '#000000',
                    boxShadow: '0 28px 56px -12px rgba(0,0,0,0.4), 0 12px 24px -8px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)',
                    transform: 'rotate(-2deg)',
                  }}
                  initial={{ opacity: 0, scale: 0.9, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: -8 }}
                  exit={{ opacity: 0, scale: 0.9, y: 16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
                  <div className="relative px-4 pt-4 pb-4">
                    <div className="flex flex-col items-center mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-brand-lime font-bold text-xs" style={{ background: '#000000' }}>SB</div>
                      <p className="text-[8px] font-bold uppercase tracking-widest mt-1" style={{ color: '#000000' }}>Flow Receipt</p>
                      <p className="text-[8px] font-mono mt-0.5" style={{ color: '#000000' }}>{hoveredSession.createdAt ? new Date(hoveredSession.createdAt.toDate()).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', year: '2-digit' }) : '—'}</p>
                    </div>
                    <div className="border-t border-dashed border-gray-300 pt-3 mb-3">
                      <p className="text-base font-bold leading-tight line-clamp-1 mb-1" style={{ color: '#000000' }}>
                        {hoveredSession.mode === 'target' && <span className="text-brand-lime mr-1">◉</span>}
                        {hoveredSession.subject}
                      </p>
                      <p className="text-sm font-bold" style={{ color: '#000000' }}>{formatDuration(hoveredSession.minutes)}</p>
                    </div>
                    <p className="text-[10px] text-center italic leading-snug line-clamp-2" style={{ color: '#000000' }}>
                      {hoveredSession.keyInsight || '오늘도 수고했어요.'}
                    </p>
                    <p className="text-[8px] text-center uppercase mt-2 tracking-widest" style={{ color: '#000000' }}>Thank you</p>
                  </div>
                  <ZigzagEdge fill="#f9fafb" height={10} />
                  <div className="px-4 py-1.5 rounded-b" style={{ background: '#f9fafb' }}>
                    <p className="text-[7px] font-mono tracking-widest text-center" style={{ color: '#000000' }}>STORE ID: 0012-9938</p>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <ReceiptDetailModal
        session={selectedSession}
        userId={userId}
        onClose={() => setSelectedSession(null)}
        onDeleted={(deletedId) => {
          setSessions((prev) => prev.filter((s) => s.id !== deletedId));
          setSelectedSession(null);
        }}
      />

      <AIManagerBubble message={managerMessage} position="bottom-right" />
    </section>
  );
};
