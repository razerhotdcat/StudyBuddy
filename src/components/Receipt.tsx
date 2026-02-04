import React from 'react';
import { motion } from 'framer-motion';
import type { StudyItem, ThoughtNote } from '../types';

interface ReceiptProps {
  items?: StudyItem[];
  tempItem?: StudyItem | null;
  // 타이머 모드에서 사용하는 실시간 진행 중 정보
  timerSeconds?: number;
  timerSubject?: string | null;
  isPrinting?: boolean;
  // 실시간 생각 노트 (타이머 작동 중)
  liveThoughtNotes?: ThoughtNote[];
  className?: string;
  date?: string;
  /** AI 점주 정산: 오늘의 성장 요약 한 줄 */
  aiGrowthSummary?: string | null;
  /** AI 점주 정산: 점주의 한마디 */
  aiManagerNote?: string | null;
  /** AI 실시간 격려/팩폭 멘트 (사이드바) */
  aiLiveComment?: string | null;
  /** 정산 요약 로딩 중 */
  aiSettlementLoading?: boolean;
  /** AI 점주 한마디 (MANAGER'S LOG, 추후 AI API 연동) */
  managerComment?: string | null;
  /** MANAGER'S LOG 기본 문구용 별명/이름 (없으면 '사용자') */
  userDisplayName?: string | null;
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
};

const formatTimer = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

export const Receipt: React.FC<ReceiptProps> = ({ 
  items,
  tempItem,
  timerSeconds = 0,
  timerSubject,
  isPrinting,
  liveThoughtNotes = [],
  date = '2024.05.21',
  className = '',
  aiGrowthSummary,
  aiManagerNote,
  aiLiveComment,
  aiSettlementLoading = false,
  managerComment,
  userDisplayName,
}) => {
  const baseItems = items && items.length > 0 ? items : [];
  const hasItems = baseItems.length > 0;
  const totalMinutes = baseItems.reduce((sum, item) => sum + item.duration, 0);
  const totalTime = formatDuration(totalMinutes);

  const showTemp = !!tempItem && (tempItem.subject.trim() !== '' || tempItem.duration > 0);
  const showTimer = !!timerSubject && timerSeconds >= 0;
  const paperGrowth = Math.min(timerSeconds / 1800, 0.15);

  const allInsights = baseItems.filter(item => item.keyInsight).map(item => item.keyInsight!);
  const allFlowLogs = baseItems.filter(item => item.flowLog).map(item => item.flowLog!);
  const topInsight = allInsights.length > 0 ? allInsights.reduce((a, b) => (a.length >= b.length ? a : b)) : null;

  const defaultManagerLog = `${userDisplayName || '사용자'} 님, 오늘의 기록을 시작합니다.`;
  const managerLogText = managerComment ?? defaultManagerLog;

  const isEmpty = !hasItems && !showTemp && !showTimer;
  const textBlack = '#000000';
  const receiptShadow = '0 25px 50px -12px rgba(0,0,0,0.22), 0 12px 24px -8px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.1)';
  const fontScale = 1.1;

  /* 지그재그 하단: clip-path polygon */
  const zigzagBottom =
    'polygon(0 0, 100% 0, 100% 100%, 96.5% 96%, 93% 100%, 89.5% 96%, 86% 100%, 82.5% 96%, 79% 100%, 75.5% 96%, 72% 100%, 68.5% 96%, 65% 100%, 61.5% 96%, 58% 100%, 54.5% 96%, 51% 100%, 47.5% 96%, 44% 100%, 40.5% 96%, 37% 100%, 33.5% 96%, 30% 100%, 26.5% 96%, 23% 100%, 19.5% 96%, 16% 100%, 12.5% 96%, 9% 100%, 5.5% 96%, 2% 100%, 0 100%)';

  // 세션이 누적될 때 영수증 높이/레이아웃을 부드럽게 확장
  const prevLengthRef = React.useRef(baseItems.length);
  const prevLength = prevLengthRef.current;
  React.useEffect(() => {
    prevLengthRef.current = baseItems.length;
  }, [baseItems.length]);

  return (
    <div className={`pb-8 overflow-visible ${className}`.trim()} aria-hidden={false}>
    <motion.div
      layout
      className="relative font-mono w-full max-w-[95vw] md:max-w-[500px] mx-auto overflow-visible receipt-paper"
      style={{
        background: '#FFFFFF',
        color: textBlack,
        boxShadow: receiptShadow,
        clipPath: zigzagBottom,
        paddingBottom: 24,
        fontSize: `${fontScale}rem`,
      }}
      initial={false}
      animate={{ scaleY: 1 + paperGrowth }}
    >
      <div className="absolute -top-2 left-0 w-full h-4 rounded-t-lg -z-10" style={{ background: '#f5f5f5' }} />

      <div className="p-8 pb-20 relative z-10 leading-relaxed font-bold" style={{ background: '#FFFFFF', fontSize: '1em', color: '#000000' }}>
        {isPrinting && (
          <div className="absolute top-5 right-5 text-[0.95em] font-mono tracking-[0.3em] text-brand-lime animate-pulse font-bold" style={{ color: textBlack }}>
            PRINTING...
          </div>
        )}

        {/* 헤더: SB, 날짜, 실시간 타이머 동기화 */}
        <div className="flex flex-col items-center mb-8 space-y-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-brand-lime font-bold text-[1.4em] mb-2" style={{ background: textBlack }}>
            SB
          </div>
          <h2 className="text-[1.35em] font-bold tracking-widest uppercase" style={{ color: textBlack }}>Study Buddy</h2>
          <p className="text-[0.9em] font-bold uppercase tracking-widest leading-relaxed" style={{ color: textBlack }}>Flow Receipt · Session Log</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-[1em] font-bold" style={{ color: textBlack }}>{date}</span>
            {showTimer && (
              <span className="text-[1.15em] font-bold font-mono tabular-nums" style={{ color: textBlack }}>
                ▶ {formatTimer(timerSeconds)}
              </span>
            )}
          </div>
        </div>

        {isEmpty ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <p className="text-[1.05em] font-bold leading-relaxed max-w-[320px]" style={{ color: textBlack }}>
              기록을 시작하면 이곳에 당신의 역사가 인쇄됩니다
            </p>
          </div>
        ) : (
        <>
        {/* 1. MISSION TITLE (활동명) */}
        <div className="mb-8">
          <p className="text-[0.75em] font-bold uppercase tracking-widest mb-2" style={{ color: textBlack }}>MISSION TITLE</p>
          <div className="space-y-3">
            {baseItems.map((item, idx) => {
              const isNew = baseItems.length > prevLength && idx >= prevLength;
              return (
                <motion.div
                  key={`${item.subject}-${idx}`}
                  layout
                  className="flex justify-between items-start leading-snug"
                  style={{ color: textBlack, fontSize: '1.1em' }}
                  initial={isNew ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                >
                  <span className="font-bold break-words flex-1">
                    {item.mode === 'target' && <span className="text-brand-lime mr-1">◉</span>}
                    {item.subject}
                  </span>
                  <span className="font-bold shrink-0 ml-2">{formatDuration(item.duration)}</span>
                </motion.div>
              );
            })}
            {showTimer && (
              <motion.div
                className="flex justify-between items-start bg-brand-lime/15 p-2 rounded leading-snug"
                style={{ color: textBlack, fontSize: '1.1em' }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <span className="font-bold break-words flex-1">▶ {timerSubject}</span>
                <span className="font-bold font-mono tabular-nums">{formatTimer(timerSeconds)}</span>
              </motion.div>
            )}
            {showTemp && tempItem && (
              <motion.div className="flex justify-between items-start leading-snug" style={{ color: textBlack, fontSize: '1.1em' }}>
                <span className="font-bold italic break-words flex-1">{tempItem.subject || '입력 중...'}</span>
                <span className="font-bold shrink-0 ml-2">{tempItem.duration > 0 ? formatDuration(tempItem.duration) : '...m'}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* 2. CORE EXTRACTION (핵심 인사이트) */}
        <div className="mb-8">
          <p className="text-[0.75em] font-bold uppercase tracking-widest mb-2" style={{ color: textBlack }}>CORE EXTRACTION</p>
          <div className="space-y-3">
            {baseItems.map((item, idx) =>
              item.keyInsight ? (
                <motion.div key={`insight-${idx}`} className="pl-3 border-l-2 border-brand-lime/50 py-1.5 rounded-r bg-brand-lime/10" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                  <p className="text-[1em] font-bold leading-relaxed" style={{ color: textBlack }}>{item.keyInsight}</p>
                </motion.div>
              ) : null
            )}
            {showTemp && tempItem?.keyInsight && (
              <div className="pl-3 border-l-2 border-brand-lime/40 py-1.5 rounded-r bg-brand-lime/10 italic">
                <p className="text-[1em] font-bold leading-relaxed" style={{ color: textBlack }}>{tempItem.keyInsight}</p>
              </div>
            )}
            {baseItems.length === 0 && !showTemp && !topInsight && (
              <p className="text-[0.95em] text-gray-500 italic">—</p>
            )}
            {topInsight && baseItems.every(i => !i.keyInsight) && (
              <div className="pl-3 border-l-2 border-brand-lime/40 py-1.5 rounded-r bg-brand-lime/10">
                <p className="text-[1em] font-bold leading-relaxed" style={{ color: textBlack }}>{topInsight}</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. FLOW STREAM (몰입 로그) */}
        <div className="mb-8">
          <p className="text-[0.75em] font-bold uppercase tracking-widest mb-2" style={{ color: textBlack }}>FLOW STREAM</p>
          <div className="space-y-2">
            {allFlowLogs.length > 0 && allFlowLogs.map((log, idx) => (
              <motion.div key={idx} className="text-[1em] font-bold leading-relaxed pl-2 border-l-2 border-gray-300" style={{ color: textBlack }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>{log}</motion.div>
            ))}
            {tempItem?.flowLog && (
              <div className="text-[1em] font-bold leading-relaxed pl-2 border-l-2 border-brand-lime/40 italic" style={{ color: textBlack }}>{tempItem.flowLog}</div>
            )}
            {allFlowLogs.length === 0 && !tempItem?.flowLog && (
              <p className="text-[0.95em] text-gray-500 italic">—</p>
            )}
          </div>
        </div>

        {/* Live Thoughts (타이머 중) */}
        {showTimer && liveThoughtNotes.length > 0 && (
          <div className="mb-8">
            <p className="text-[0.75em] font-bold uppercase tracking-wider mb-2 text-brand-lime">✦ LIVE THOUGHTS</p>
            <div className="space-y-1.5">
              {liveThoughtNotes.map((note, idx) => (
                <div key={`${note.timestamp}-${idx}`} className="flex gap-2 items-start text-[0.95em] pl-2 border-l-2 border-brand-lime/50" style={{ color: textBlack }}>
                  <span className="font-mono font-bold shrink-0">{note.timestamp}</span>
                  <span className="font-bold leading-relaxed">{note.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center space-y-2">
          <p className="text-[0.85em] text-center uppercase font-bold" style={{ color: textBlack }}>Thank you for your process</p>
          <div className="text-[0.75em] font-mono tracking-widest space-y-0.5 text-center" style={{ color: textBlack }}>
            <p>STORE ID: 0012-9938</p>
            <p>REG# 38 · TERMINAL 12</p>
          </div>
        </div>
        </>
        )}

        {/* 4. MANAGER'S LOG (항상 표시: 빈 상태에서도 "ㅇㅇ 님, 오늘의 기록을 시작합니다.") */}
        <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
          <p className="text-[0.75em] font-bold uppercase tracking-widest mb-2" style={{ color: textBlack }}>MANAGER&apos;S LOG</p>
          {(aiGrowthSummary != null || aiManagerNote != null || aiSettlementLoading) ? (
            <div className="rounded-lg border-2 border-brand-lime bg-brand-lime/15 p-3">
              {aiSettlementLoading ? (
                <p className="text-[1.1em] font-bold italic" style={{ color: textBlack }}>정산 중...</p>
              ) : (
                <>
                  {aiGrowthSummary && <p className="text-[1.1em] font-bold leading-relaxed mb-1" style={{ color: textBlack }}>{aiGrowthSummary}</p>}
                  {aiManagerNote && <p className="text-[1em] font-bold italic leading-relaxed" style={{ color: textBlack }}>— {aiManagerNote}</p>}
                </>
              )}
            </div>
          ) : (
            <p className="text-[1.05em] font-bold leading-relaxed italic" style={{ color: textBlack }}>
              {managerLogText}
            </p>
          )}
        </div>
      </div>

      {/* 실시간 AI 코멘트: 데스크톱은 영수증 오른쪽 사이드바, 모바일은 영수증 하단 */}
      {aiLiveComment && (
        <>
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-36 min-w-0 rounded-lg border-2 border-brand-lime bg-[#1a1a1a] p-3 shadow-lg shadow-brand-lime/20 hidden sm:block"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            style={{ wordBreak: 'break-word', maxWidth: '11rem' }}
          >
            <p className="text-[9px] font-bold text-brand-lime uppercase tracking-wider mb-1">AI 점주</p>
            <p className="text-xs text-white italic leading-relaxed break-words">{aiLiveComment}</p>
          </motion.div>
          <motion.div
            className="mt-3 rounded-lg border-2 border-brand-lime bg-[#1a1a1a] p-3 shadow-lg sm:hidden"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ wordBreak: 'break-word' }}
          >
            <p className="text-[9px] font-bold text-brand-lime uppercase tracking-wider mb-1">AI 점주</p>
            <p className="text-xs text-white italic leading-relaxed break-words">{aiLiveComment}</p>
          </motion.div>
        </>
      )}

      {/* 영수증 끝 두께감: 미세한 회색 선 (지그재그 바로 위) */}
      <div
        className="absolute left-0 w-full"
        style={{
          bottom: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, #d4d4d4 8%, #d4d4d4 92%, transparent 100%)',
          opacity: 0.9,
        }}
        aria-hidden
      />
    </motion.div>
    </div>
  );
};
