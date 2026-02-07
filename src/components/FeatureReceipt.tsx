import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt } from './Receipt';
import { Button } from './ui/Button';
import { Printer, Share2, Target, Waves, PenLine, Download, X } from 'lucide-react';
import type { StudyItem, ThoughtNote } from '../types';
import { getAISettlement, getAILiveComment, type ProfileContext } from '../lib/ai';
import { addToSquareFeed, maskDisplayName, addExpOnReceipt } from '../firebase';
import { getRandomManagerComment } from '../lib/managerComments';
import { SoundManager } from '../lib/soundManager';
import { AIManagerBubble } from './AIManagerBubble';

interface FeatureReceiptProps {
  items: StudyItem[];
  onAddItem: (item: StudyItem) => void;
  /** 로고 클릭 등으로 대시보드 초기화 시 true → 영수증 슬라이드아웃 후 onResetComplete 호출 */
  isResetting?: boolean;
  onResetComplete?: () => void;
  /** [영수증 출력하기] 클릭 시 호출 → COLLECTION으로 날아가는 애니메이션 트리거 */
  onPrintReceipt?: () => void;
  /** 프로필(별명, 직업/목표) - AI 점주 페르소나에 사용 */
  profile?: ProfileContext | null;
  /** 광장 익명 라벨용 (displayName 성만 노출) */
  user?: { displayName?: string | null; uid?: string } | null;
  onLevelUp?: (newLevel: number) => void;
}

const LIVE_COMMENT_DEBOUNCE_MS = 90 * 1000; // 90초에 한 번
const LIVE_MILESTONE_MINUTES = [10, 25, 45];

const formatTimer = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

export const FeatureReceipt: React.FC<FeatureReceiptProps> = ({
  items,
  onAddItem,
  isResetting = false,
  onResetComplete,
  onPrintReceipt,
  onLevelUp,
  profile,
  user,
}) => {
  // 모드 선택
  const [mode, setMode] = useState<'flow' | 'target'>('flow');
  
  const [subjectInput, setSubjectInput] = useState('');
  const [keyInsightInput, setKeyInsightInput] = useState('');
  const [dailyNoteInput, setDailyNoteInput] = useState('');
  const [flowLogInput, setFlowLogInput] = useState('');
  
  // 타이머 상태
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerSubject, setTimerSubject] = useState<string | null>(null);
  
  // 타임스탬프 생각 노트
  const [thoughtNotes, setThoughtNotes] = useState<ThoughtNote[]>([]);
  const [currentThought, setCurrentThought] = useState('');

  // AI 점주: 정산 요약 + 라이브 코멘트
  const [aiGrowthSummary, setAiGrowthSummary] = useState<string | null>(null);
  const [aiManagerNote, setAiManagerNote] = useState<string | null>(null);
  const [aiLiveComment, setAiLiveComment] = useState<string | null>(null);
  const [aiSettlementLoading, setAiSettlementLoading] = useState(false);
  const lastLiveCommentAt = useRef<number>(0);
  const lastLiveMilestone = useRef<number>(-1);
  /** 기록 보조용 짧은 매니저 리액션 (메모 작성 시) */
  const [managerReaction, setManagerReaction] = useState<string | null>(null);
  /** 위젯용 오늘의 한마디 (마운트 시 1회) */
  const [widgetOneLiner] = useState(() => getRandomManagerComment('workshop_reaction'));

  /** 워크샵 종료 시퀀스: 인쇄 중 오버레이 → 결과 영수증 모달 → 닫기 시 Collection 이동 */
  const [showPrintingOverlay, setShowPrintingOverlay] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  /** Ejection: FINAL PRINT 시 step 배출 → 완료 후 drop */
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);
  const [isEjectedDropped, setIsEjectedDropped] = useState(false);
  /** ADD SESSION 시 영수증 한 칸 밀려나오는 step (지익- 사운드) */
  const [addSessionStep, setAddSessionStep] = useState(0);
  /** STOP 후 배출구 영수증 대기: 그 자리 고정 + 약 10cm(≈40px) 더 삐져나온 상태 */
  const [peekAfterStop, setPeekAfterStop] = useState<{ subject: string; time: string; memo: string; duration: number } | null>(null);
  /** 지익- 소리와 싱크: 1px 진동만 재생할 때 true */
  const [soundSyncVibrate, setSoundSyncVibrate] = useState(false);

  // 타이머 증가 효과
  React.useEffect(() => {
    if (!isTimerRunning) return;

    const id = window.setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [isTimerRunning]);

  const handleStartTimer = () => {
    const subject = subjectInput.trim();
    if (!subject) {
      window.alert('타이머를 시작하려면 활동명을 입력해주세요.');
      return;
    }
    if (isTimerRunning) {
      return;
    }
    setPeekAfterStop(null);
    setTimerSubject(subject);
    setTimerSeconds(0);
    setThoughtNotes([]);
    setIsTimerRunning(true);
  };

  const handleStopTimer = () => {
    if (!isTimerRunning || !timerSubject) return;
    const minutes = Math.max(1, Math.round(timerSeconds / 60));
    // 타이머를 멈추고 현재 상태를 배출구에 고정 (10cm 더 나와있는 상태로 대기)
    setPeekAfterStop({
      subject: timerSubject,
      time: formatTimer(timerSeconds),
      memo: flowLogInput.trim() || keyInsightInput.trim() || '',
      duration: minutes,
    });
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setTimerSubject(null);
    setSubjectInput('');
    setKeyInsightInput('');
    setDailyNoteInput('');
    setFlowLogInput('');
    setThoughtNotes([]);
    setCurrentThought('');
  };

  /** ADD SESSION: 현재 세션을 영수증에 중간 인쇄, 다음 작업 준비, 지익- 사운드 + 한 칸 밀려나옴 */
  const handleAddSession = () => {
  // 현재 세션의 데이터(목표/시간/메모)를 세션 배열로 중간 인쇄
    const activeSubject = (peekAfterStop?.subject || timerSubject || subjectInput.trim()) || '세션';
    const computedMinutes = isTimerRunning
      ? Math.max(1, Math.round(timerSeconds / 60))
      : peekAfterStop?.duration ?? 0;

    // 유효한 시간 또는 제목이 있을 때만 세션 추가
    if (computedMinutes > 0 || activeSubject !== '세션') {
      onAddItem({
        subject: activeSubject,
        duration: computedMinutes || 1,
        keyInsight: keyInsightInput.trim() || undefined,
        dailyNote: dailyNoteInput.trim() || undefined,
        flowLog: flowLogInput.trim() || undefined,
        mode,
        thoughtNotes: thoughtNotes.length > 0 ? thoughtNotes : undefined,
      });
      // '지익-' 사운드 + 한 칸 밀려나오는 애니메이션 트리거
      SoundManager.playPrinting();
      setAddSessionStep((s) => s + 1);
    }

    // 다음 세션을 위해 입력 및 타이머 초기화, 배출구는 대기 상태로 리셋
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setTimerSubject(null);
    setSubjectInput('');
    setKeyInsightInput('');
    setDailyNoteInput('');
    setFlowLogInput('');
    setThoughtNotes([]);
    setCurrentThought('');
    setPeekAfterStop(null);
  };

  const handleAddThought = () => {
    if (!currentThought.trim() || !isTimerRunning) return;

    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const timestamp = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const newNote = { timestamp, text: currentThought.trim() };

    setThoughtNotes((prev) => {
      const next = [...prev, newNote];
      requestLiveComment({ lastThought: newNote.text, thoughtCount: next.length });
      return next;
    });
    setCurrentThought('');
    const reaction = getRandomManagerComment('workshop_reaction');
    setManagerReaction(reaction);
    window.setTimeout(() => setManagerReaction(null), 4000);
  };

  const handleThoughtKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddThought();
    }
  };

  /** 영수증 출력: 인쇄 사운드 → 밀려나오는 애니 → AI 정산 → 오버레이 → 결과 모달 */
  const handlePrintReceipt = async () => {
    SoundManager.playPrinting();
    setSoundSyncVibrate(true);
    window.setTimeout(() => setSoundSyncVibrate(false), 280);
    setPeekAfterStop(null);
    setIsPrintingReceipt(true);
    const allThoughts: { timestamp: string; text: string }[] = [];
    items.forEach((item) => {
      item.thoughtNotes?.forEach((n) => allThoughts.push({ timestamp: n.timestamp, text: n.text }));
    });
    thoughtNotes.forEach((n) => allThoughts.push({ timestamp: n.timestamp, text: n.text }));

    setAiSettlementLoading(true);
    setAiGrowthSummary(null);
    setAiManagerNote(null);
    try {
      const { growthSummary, managerNote } = await getAISettlement(allThoughts, profile ?? undefined);
      setAiGrowthSummary(growthSummary);
      setAiManagerNote(managerNote);
    } catch (e) {
      console.error(e);
      setAiGrowthSummary('오늘도 한 걸음.');
      setAiManagerNote('내일도 영수증 찍어오세요!');
    } finally {
      setAiSettlementLoading(false);
    }
    const totalMins = items.reduce((a, i) => a + i.duration, 0) + (isTimerRunning ? Math.ceil(timerSeconds / 60) : 0);
    if (totalMins > 0) {
      addToSquareFeed({
        subject: items[0]?.subject ?? timerSubject ?? '활동',
        minutes: totalMins,
        authorLabel: maskDisplayName(profile?.nickname ?? user?.displayName ?? undefined),
      }).catch(() => {});
    }
    if (user?.uid) {
      addExpOnReceipt(user.uid).then(({ leveledUp, newLevel }) => {
        if (leveledUp) onLevelUp?.(newLevel);
      });
    }
    setTimeout(() => {
      setIsPrintingReceipt(false);
      setIsEjectedDropped(true);
      setTimeout(() => {
        setShowPrintingOverlay(true);
      }, 800);
    }, 2400);
  };

  useEffect(() => {
    if (!showPrintingOverlay) return;
    const t = window.setTimeout(() => {
      setShowPrintingOverlay(false);
      setShowResultModal(true);
    }, 2000);
    return () => window.clearTimeout(t);
  }, [showPrintingOverlay]);

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    onPrintReceipt?.();
  };

  /** 실시간 AI 코멘트: 타이머 마일스톤(10/25/45분) 또는 메모 추가 시 */
  const requestLiveComment = React.useCallback(
    (opts: { lastThought?: string; thoughtCount?: number } = {}) => {
      const now = Date.now();
      if (now - lastLiveCommentAt.current < LIVE_COMMENT_DEBOUNCE_MS) return;
      lastLiveCommentAt.current = now;

      const timerMinutes = Math.floor(timerSeconds / 60);
      const count = opts.thoughtCount ?? thoughtNotes.length;
      getAILiveComment(
        {
          timerMinutes,
          lastThought: opts.lastThought,
          thoughtCount: count,
          subject: timerSubject ?? undefined,
        },
        profile ?? undefined
      ).then(setAiLiveComment);
    },
    [timerSeconds, thoughtNotes.length, timerSubject, profile]
  );

  useEffect(() => {
    if (!isTimerRunning) return;
    const minutes = Math.floor(timerSeconds / 60);
    const milestone = LIVE_MILESTONE_MINUTES.find((m) => m === minutes);
    if (milestone != null && lastLiveMilestone.current !== milestone) {
      lastLiveMilestone.current = milestone;
      requestLiveComment({});
    }
  }, [isTimerRunning, timerSeconds, requestLiveComment]);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  const tempItem: StudyItem | null =
    subjectInput.trim() !== '' && !isTimerRunning
      ? {
          subject: subjectInput,
          duration: 0,
          keyInsight: keyInsightInput.trim() || undefined,
          dailyNote: dailyNoteInput.trim() || undefined,
          flowLog: flowLogInput.trim() || undefined,
          mode,
          thoughtNotes: thoughtNotes.length > 0 ? thoughtNotes : undefined,
        }
      : null;

  return (
    <section className="min-h-[calc(100vh-4rem)] py-6 md:py-8 bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* 작업실 그리드 배경 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" aria-hidden />

      <div className="relative z-10 flex h-full min-h-[70vh] w-full">
        {/* 왼쪽 40%: 관제 탑 (Command Center) */}
        <div className="w-[40%] min-w-0 flex-shrink-0 border-r border-gray-800 flex flex-col p-4 md:p-6">
          <h2 className="text-lg font-mono font-bold text-brand-lime uppercase tracking-widest mb-4">COMMAND CENTER</h2>

          <label className="text-[10px] font-mono font-bold text-brand-lime uppercase tracking-wider mb-1">[SUBJECT]</label>
          <input
            type="text"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            placeholder="목표 / 활동명"
            disabled={isTimerRunning}
            className="w-full rounded border-2 border-brand-lime bg-black/60 px-3 py-2.5 font-mono text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime disabled:opacity-70 mb-4"
          />

          <label className="text-[10px] font-mono font-bold text-brand-lime uppercase tracking-wider mb-1">[몰입 메모]</label>
          <textarea
            value={flowLogInput}
            onChange={(e) => setFlowLogInput(e.target.value)}
            placeholder="현재 작업 내용, 몰입 로그..."
            rows={4}
            className="w-full rounded border-2 border-brand-lime bg-black/60 px-3 py-2 font-mono text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime resize-none mb-4"
          />
          <textarea
            value={keyInsightInput}
            onChange={(e) => setKeyInsightInput(e.target.value)}
            placeholder="핵심 인사이트 (선택)"
            rows={2}
            className="w-full rounded border-2 border-gray-600 bg-black/40 px-3 py-2 font-mono text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime resize-none mb-4"
          />

          <div className="flex gap-2 mb-3">
            {!isTimerRunning ? (
              <button
                type="button"
                onClick={handleStartTimer}
                disabled={!subjectInput.trim()}
                className="flex-1 py-3 rounded font-mono font-bold text-sm uppercase border-2 border-black bg-[#ccff00] text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                START
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopTimer}
                className="flex-1 py-3 rounded font-mono font-bold text-sm uppercase border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black transition-colors"
              >
                STOP
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddSession}
            className="w-full py-3 rounded font-mono font-bold text-sm uppercase border-2 border-black bg-[#ccff00] text-black hover:bg-white transition-colors mb-3"
          >
            ADD SESSION
          </button>
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="w-full py-3 rounded font-mono font-bold text-sm uppercase border-2 border-black bg-[#ccff00] text-black hover:bg-white transition-colors"
          >
            FINAL PRINT
          </button>

          {isTimerRunning && (
            <div className="mt-4 flex items-center justify-between py-2 px-3 rounded border border-brand-lime bg-brand-lime/10">
              <span className="text-[10px] font-mono font-bold text-brand-lime uppercase">REC</span>
              <span className="font-mono font-bold tabular-nums text-white">{formatTimer(timerSeconds)}</span>
            </div>
          )}
        </div>

        {/* 오른쪽 60%: 3D 프린터 + 실시간 프리뷰 */}
        <div className="w-[60%] min-w-0 flex flex-col items-center justify-start gap-4 p-4 md:p-6 overflow-y-auto">
          <div className="workshop-printer-3d w-full max-w-lg">
            <div className="workshop-printer-machine-3d relative mx-auto" style={{ perspective: '1000px' }}>
              <div
                className="relative rounded-xl border-4 border-gray-600 bg-gradient-to-b from-gray-800 to-gray-900 overflow-visible"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
                  transform: 'perspective(1000px) rotateX(2deg)',
                }}
              >
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">THERMAL PRINTER · FLOW RECEIPT</span>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600 shadow-inner" />
                      <span className="w-2 h-2 rounded-full bg-amber-500 shadow-inner" />
                      <span className="w-2 h-2 rounded-full bg-green-600 shadow-inner" />
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                  </div>
                </div>
                {/* 배출구: Peeking 시 [목표][메모][시간] 실시간. STOP 후에는 그대로 고정 + 약 10cm(140px) 더 삐져나온 대기 */}
                <div
                  className="relative mx-3 rounded-b overflow-hidden bg-gray-950 border-x-2 border-b-2 border-gray-700"
                  style={{ height: peekAfterStop ? 140 : 100, minHeight: 100 }}
                >
                  {(isTimerRunning || addSessionStep > 0 || peekAfterStop) && !isPrintingReceipt && (
                    <motion.div
                      className={`absolute inset-x-0 top-0 flex flex-col justify-center px-3 py-2 receipt-paper font-mono ${isTimerRunning ? 'receipt-peek-vibrate' : ''} ${soundSyncVibrate ? 'receipt-eject-vibrate' : ''}`}
                      style={{
                        height: peekAfterStop ? 140 : 100,
                        background: '#FFFFFF',
                        color: '#000000',
                        fontSize: '0.7rem',
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                      }}
                      animate={addSessionStep > 0 && !peekAfterStop ? { y: [0, -4, 0], transition: { duration: 0.25 } } : {}}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold uppercase tracking-wider truncate pr-2" style={{ color: '#000000' }}>
                          {peekAfterStop ? peekAfterStop.subject : (timerSubject || subjectInput.trim() || '—')}
                        </span>
                        <span className="font-mono font-bold tabular-nums shrink-0" style={{ color: '#000000' }}>
                          ▶ {peekAfterStop ? peekAfterStop.time : formatTimer(timerSeconds)}
                        </span>
                      </div>
                      {(peekAfterStop ? peekAfterStop.memo : (flowLogInput.trim() || keyInsightInput.trim())) && (
                        <p className="text-[9px] truncate mt-0.5 font-bold" style={{ color: '#000000' }}>
                          {peekAfterStop ? peekAfterStop.memo : (flowLogInput.trim() || keyInsightInput.trim())}
                        </p>
                      )}
                      <p className="text-[9px] uppercase tracking-widest mt-1 opacity-80" style={{ color: '#000000' }}>
                        Flow Receipt {isTimerRunning ? '· Printing...' : peekAfterStop ? '· Stopped' : `· ${items.length} session(s)`}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 출력된 영수증: 입구에서 아래로 밀려나오는 Ejection (떨어지는 애니 없음) */}
          <div className="w-full max-w-lg flex justify-center min-h-[100px] receipt-ejection-wrap" style={{ perspective: '1000px' }}>
            <motion.div
              key={isEjectedDropped ? 'dropped' : 'ejecting'}
              className="workshop-receipt-ejected"
              initial={false}
              animate={{
                opacity: isPrintingReceipt || isEjectedDropped ? 1 : 0,
                y: 0,
                rotate: 0,
              }}
              transition={{ opacity: { duration: 0.2 } }}
              style={{
                visibility: isResetting ? 'hidden' : (isPrintingReceipt || isEjectedDropped) ? 'visible' : 'hidden',
                transform: 'perspective(1000px) rotateX(10deg)',
                transformStyle: 'preserve-3d',
                filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))',
              }}
            >
              <div className={`${isPrintingReceipt ? 'receipt-printing-out' : ''} ${soundSyncVibrate ? 'receipt-eject-vibrate' : ''}`}>
                <Receipt
                  items={items}
                  tempItem={tempItem}
                  timerSeconds={isTimerRunning ? timerSeconds : 0}
                  timerSubject={timerSubject}
                  isPrinting={isTimerRunning}
                  liveThoughtNotes={isTimerRunning ? thoughtNotes : []}
                  date={formattedDate}
                  aiGrowthSummary={aiGrowthSummary}
                  aiManagerNote={aiManagerNote}
                  aiLiveComment={isTimerRunning ? aiLiveComment : null}
                  aiSettlementLoading={aiSettlementLoading}
                  managerComment={aiManagerNote ?? undefined}
                  userDisplayName={profile?.nickname ?? user?.displayName ?? undefined}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AIManagerBubble message={managerReaction} position="bottom-right" />

      {/* 인쇄 중 오버레이 (2초) */}
      <AnimatePresence>
        {showPrintingOverlay && (
          <motion.div
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-14 h-14 rounded-full border-2 border-brand-lime border-t-transparent animate-spin" />
              <p className="text-brand-lime font-mono font-bold text-lg tracking-widest uppercase">
                영수증을 인쇄 중입니다...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 결과 영수증 모달: 닫기 시 onPrintReceipt → Collection 이동 */}
      <AnimatePresence>
        {showResultModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseResultModal}
            />
            <motion.div
              className="relative flex flex-col items-center max-h-[90vh] w-full max-w-lg"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-y-auto rounded-t-lg bg-transparent">
                <Receipt
                  items={items}
                  date={formattedDate}
                  aiGrowthSummary={aiGrowthSummary}
                  aiManagerNote={aiManagerNote}
                  managerComment={aiManagerNote ?? undefined}
                  userDisplayName={profile?.nickname ?? user?.displayName ?? undefined}
                />
              </div>
              <button
                type="button"
                onClick={handleCloseResultModal}
                className="mt-4 px-6 py-3 rounded-xl border-2 border-brand-lime text-brand-lime font-bold hover:bg-brand-lime hover:text-black transition-colors"
              >
                닫기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
