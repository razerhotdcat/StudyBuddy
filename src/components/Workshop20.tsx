import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudyItem } from '../types';
import { SoundManager } from '../lib/soundManager';
import { useTheme } from '../context/ThemeContext';
import { ReceiptTopStrip } from './ReceiptTopStrip';
import { saveStudySession, saveReceipt, type CategoryStatItem, type ReceiptSessionItem } from '../firebase';

const BORDER_COLOR = '#1F2937';
const NEON_LIME = '#CCFF00';
const RECEIPT_FONT = '"JetBrains Mono", ui-monospace, monospace';
const RECEIPT_FONT_SIZE = 18;
const RECEIPT_BG = '#FCFCFC';

const CATEGORIES = [
  { id: 'study', emoji: '📚', name: '공부', color: '#3B82F6' },
  { id: 'exercise', emoji: '💪', name: '운동', color: '#10B981' },
  { id: 'reading', emoji: '📖', name: '독서', color: '#8B5CF6' },
  { id: 'coding', emoji: '💻', name: '개발', color: '#06B6D4' },
  { id: 'hobby', emoji: '🎨', name: '취미', color: '#F59E0B' },
  { id: 'work', emoji: '💼', name: '업무', color: '#EF4444' },
  { id: 'other', emoji: '🎯', name: '기타', color: '#6B7280' },
];

/** 초 단위 → "N시간 N분 N초" (0초→"0초", 90초→"1분 30초", 3665초→"1시간 1분 5초") */
const formatTimer = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0) parts.push(`${minutes}분`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}초`);
  return parts.join(' ');
};

const formatDuration = (minutes: number) => {
  const totalSeconds = minutes * 60;
  return formatTimer(totalSeconds);
};

interface Workshop20Props {
  items: StudyItem[];
  onAddItem: (item: StudyItem) => void;
  onPrintReceipt?: () => void;
  isResetting?: boolean;
  onResetComplete?: () => void;
  user?: { uid?: string; email?: string | null } | null;
}

export const Workshop20: React.FC<Workshop20Props> = ({
  items: sessions,
  onAddItem,
  onPrintReceipt,
  isResetting = false,
  onResetComplete,
  user,
}) => {
  // goal = subject
  const [subject, setSubject] = useState('');
  const [memo, setMemo] = useState('');
  const [category, setCategory] = useState('other');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerSubject, setTimerSubject] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const prevLengthRef = useRef(sessions.length);
  const theme = useTheme();

  const layoutBg = theme.bg;
  const textColor = theme.text;
  const panelBg = theme.panelBg;
  const panelBorder = theme.panelBorder;
  const timerBg = theme.mode === 'dark' ? '#0a0a0a' : theme.panelBg;

  // 타이머: isTimerRunning === true일 때 1초마다 seconds 증가
  useEffect(() => {
    if (!isTimerRunning) return;
    const id = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isTimerRunning]);

  useEffect(() => {
    prevLengthRef.current = sessions.length;
  }, [sessions.length]);

  // START: 목표 필수, 타이머 시작
  const handleStart = () => {
    const s = subject.trim();
    if (!s) {
      window.alert('목표를 입력해주세요.');
      return;
    }
    setTimerSubject(s);
    setTimerSeconds(0);
    setIsPaused(false);
    setIsTimerRunning(true);
  };

  // PAUSE: 타이머 일시정지 (seconds 유지)
  const handlePause = () => {
    setIsPaused(true);
    setIsTimerRunning(false);
  };

  // RESUME: 타이머 재개 (이어서 카운트)
  const handleResume = () => {
    setIsPaused(false);
    setIsTimerRunning(true);
  };

  // 공통 세션 생성 로직
  const createSession = (resetGoalAndMemo: boolean) => {
    const sub = (timerSubject || subject.trim()) || '세션';
    const minutes = Math.max(1, Math.round(timerSeconds / 60));

    if (!sub.trim()) {
      window.alert('목표를 먼저 입력해주세요.');
      return;
    }

    if (minutes <= 0) {
      return;
    }

    const selectedCategory = CATEGORIES.find((c) => c.id === category);

    onAddItem({
      subject: sub,
      duration: minutes,
      keyInsight: memo.trim() || undefined,
      mode: 'flow',
      category: category,
      categoryEmoji: selectedCategory?.emoji,
      categoryName: selectedCategory?.name,
      categoryColor: selectedCategory?.color,
    });
    SoundManager.playPrinting();

    // 타이머는 항상 리셋
    setTimerSeconds(0);
    setTimerSubject(null);

    // + SESSION일 때만 목표/메모/카테고리까지 리셋
    if (resetGoalAndMemo) {
      setSubject('');
      setMemo('');
      setCategory('other');
    }
  };

  // STOP: 일시정지 상태에서 세션 저장 후 리셋 (목표/메모 유지)
  const handleStop = () => {
    if (!isPaused) return;
    createSession(false);
    setIsPaused(false);
    setIsTimerRunning(false);
    setCategory('other');
  };

  // + SESSION: 타이머가 멈춰 있고 seconds > 0 일 때만 사용, 세션 추가 + 리셋
  const handleAddSession = () => {
    if (isTimerRunning || timerSeconds <= 0) return;
    createSession(true);
    setIsTimerRunning(false);
    setIsPaused(false);
    setSubject('');
    setMemo('');
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalLabel = formatDuration(totalMinutes);
  const totalDurationMinutes = totalMinutes;
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  /** 카테고리별 세션 수, 총 시간, 포맷된 시간 */
  const calculateCategoryStats = (items: StudyItem[]): CategoryStatItem[] => {
    const byCategory = new Map<string, { count: number; totalMinutes: number; name?: string; emoji?: string }>();
    for (const s of items) {
      const cid = s.category ?? 'other';
      const cat = CATEGORIES.find((c) => c.id === cid);
      const cur = byCategory.get(cid) ?? { count: 0, totalMinutes: 0, name: cat?.name, emoji: cat?.emoji };
      cur.count += 1;
      cur.totalMinutes += s.duration;
      byCategory.set(cid, cur);
    }
    return Array.from(byCategory.entries()).map(([categoryId, v]) => ({
      categoryId,
      categoryName: v.name,
      categoryEmoji: v.emoji,
      count: v.count,
      totalMinutes: v.totalMinutes,
      formatted: formatDuration(v.totalMinutes),
    }));
  };

  /** 영수증 발행: 세션·영수증 저장 후 onPrintReceipt 호출 */
  const handlePublish = async () => {
    if (!user?.uid) {
      window.alert('로그인이 필요합니다.');
      return;
    }
    if (sessions.length === 0) {
      window.alert('발행할 세션이 없습니다.');
      return;
    }
    const totalFormatted = formatDuration(totalMinutes);
    const categoryStats = calculateCategoryStats(sessions);
    const enrichedSessions: ReceiptSessionItem[] = sessions.map((s) => ({
      subject: s.subject,
      duration: s.duration,
      keyInsight: s.keyInsight,
      category: s.category,
      categoryEmoji: s.categoryEmoji,
      categoryName: s.categoryName,
      categoryColor: s.categoryColor,
      elapsedFormatted: formatDuration(s.duration),
    }));

    try {
      for (const s of sessions) {
        await saveStudySession(user.uid, {
          subject: s.subject,
          minutes: s.duration,
          keyInsight: s.keyInsight,
          mode: s.mode,
          category: s.category,
          categoryEmoji: s.categoryEmoji,
          categoryName: s.categoryName,
          categoryColor: s.categoryColor,
          elapsedFormatted: formatDuration(s.duration),
        });
      }
      await saveReceipt(user.uid, {
        sessions: enrichedSessions,
        totalFormatted,
        categoryStats,
      });
      setShowConfirmModal(false);
      onPrintReceipt?.();
    } catch (err) {
      console.error('영수증 발행 실패', err);
      window.alert('영수증 발행에 실패했습니다.');
    }
  };

  return (
    <section
      className="relative min-h-[calc(100vh-4rem)] transition-colors duration-300"
      style={{ background: layoutBg, color: textColor }}
    >
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-[1400px] mx-auto">
        {/* 좌측: Control 패널 (항상 표시, 데스크톱에서 약 320px) */}
        <div
          className="min-h-0 flex flex-col border-b md:border-b-0 md:border-r transition-all duration-300 w-full lg:w-[320px]"
          style={{ borderColor: BORDER_COLOR, padding: 24 }}
        >
        <h2
          className="text-lg font-mono font-bold uppercase tracking-widest mb-6"
          style={{ color: theme.mode === 'dark' ? NEON_LIME : '#3B82F6' }}
        >
          Control
        </h2>

        {/* 카테고리 선택 */}
        <div className="mb-3">
          <label
            className="block font-mono text-xs font-bold uppercase mb-2"
            style={{
              color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
            }}
          >
            [카테고리]
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => !isTimerRunning && setCategory(cat.id)}
                disabled={isTimerRunning}
                className="flex flex-col items-center justify-center p-2 rounded-lg border transition-all disabled:opacity-60"
                style={{
                  background: category === cat.id
                    ? theme.mode === 'dark' ? `${cat.color}20` : `${cat.color}15`
                    : 'transparent',
                  borderColor: category === cat.id
                    ? cat.color
                    : theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB',
                  borderWidth: category === cat.id ? 2 : 1,
                }}
              >
                <span className="text-lg mb-0.5">{cat.emoji}</span>
                <span
                  className="text-[10px] font-mono leading-tight"
                  style={{
                    color: category === cat.id
                      ? cat.color
                      : theme.mode === 'dark' ? '#FFFFFF' : '#6B7280',
                  }}
                >
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-3">
          <label className="block text-sm font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
            [목표]
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="목표 / 활동명 입력"
            disabled={isTimerRunning}
            className="w-full rounded-lg border-2 px-4 py-3 font-mono text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] disabled:opacity-70 min-h-[48px] md:min-h-[44px]"
            style={{
              background: theme.mode === 'dark' ? '#1a1a1a' : theme.panelBg,
              borderColor: theme.mode === 'dark' ? '#333' : panelBorder,
              color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
            }}
          />
        </div>

        <div className="space-y-3 mb-3">
          <label className="block text-sm font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
            [메모]
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모 (선택)"
            rows={3}
            disabled={isTimerRunning}
            className="w-full rounded-lg border-2 px-4 py-3 font-mono text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] resize-none disabled:opacity-70 min-h-[48px]"
            style={{
              background: theme.mode === 'dark' ? '#1a1a1a' : theme.panelBg,
              borderColor: theme.mode === 'dark' ? '#333' : panelBorder,
              color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
            }}
          />
        </div>

        <div
          className="rounded-lg border-2 p-4 mb-3 flex items-center justify-center min-h-[100px]"
          style={{
            borderColor: isTimerRunning ? (theme.mode === 'dark' ? NEON_LIME : '#3B82F6') : panelBorder,
            background: theme.mode === 'dark' ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' : timerBg,
            boxShadow: isTimerRunning && theme.mode === 'dark' ? '0 0 30px rgba(204, 255, 0, 0.3)' : isTimerRunning && theme.mode === 'light' ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none',
          }}
        >
          <span
            className="font-mono font-bold tabular-nums text-3xl md:text-4xl"
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              color: isTimerRunning ? (theme.mode === 'dark' ? NEON_LIME : '#3B82F6') : textColor,
              textShadow: isTimerRunning && theme.mode === 'dark' ? '0 0 20px rgba(204, 255, 0, 0.5)' : 'none',
            }}
          >
            {formatTimer(timerSeconds)}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {!isTimerRunning && !isPaused && (
            <button
              type="button"
              onClick={handleStart}
              disabled={!subject.trim()}
              className="w-full py-3 rounded-lg font-mono font-bold text-sm uppercase border transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] md:min-h-[48px] hover:opacity-90"
              style={{
                background: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
                color: '#FFFFFF',
                borderColor: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
                boxShadow: theme.mode === 'light' ? '0 2px 4px rgba(59,130,246,0.2)' : 'none',
              }}
            >
              ▶ START
            </button>
          )}
          {isTimerRunning && (
            <button
              type="button"
              onClick={handlePause}
              className="w-full py-3 rounded-lg font-mono font-bold text-sm uppercase border transition-all min-h-[44px] md:min-h-[48px] hover:opacity-90"
              style={{
                background: theme.mode === 'dark' ? '#F59E0B' : '#F59E0B',
                color: '#000000',
                borderColor: theme.mode === 'dark' ? '#F59E0B' : '#F59E0B',
              }}
            >
              ⏸ PAUSE
            </button>
          )}
          {isPaused && (
            <>
              <button
                type="button"
                onClick={handleResume}
                className="w-full py-3 rounded-lg font-mono font-bold text-sm uppercase border transition-all min-h-[44px] md:min-h-[48px] hover:opacity-90"
                style={{
                  background: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
                  color: theme.mode === 'dark' ? '#000000' : '#FFFFFF',
                  borderColor: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
                }}
              >
                ▶ RESUME
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="w-full py-3 rounded-lg font-mono font-bold text-sm uppercase border-2 transition-all min-h-[44px] md:min-h-[48px] hover:bg-red-600 hover:border-red-600 hover:text-white"
                style={{ background: 'transparent', color: '#FF7675', borderColor: '#FF7675' }}
              >
                ■ STOP
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleAddSession}
            disabled={isTimerRunning || timerSeconds <= 0}
            className="w-full py-2.5 rounded-lg border font-mono font-bold text-xs uppercase transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'transparent',
              color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
              borderColor: theme.mode === 'dark' ? '#666666' : '#D1D5DB',
            }}
          >
            + SESSION
          </button>
          {onPrintReceipt && (
            <button
              type="button"
              onClick={() => {
                if (sessions.length === 0) {
                  window.alert('발행할 세션이 없습니다.');
                  return;
                }
                setShowConfirmModal(true);
              }}
              disabled={sessions.length === 0}
              className="w-full py-2.5 rounded-lg border font-mono font-bold text-xs uppercase transition-all hover:bg-blue-50"
              style={{
                borderColor: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
                background: 'transparent',
                color: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
              }}
            >
              📄 영수증
            </button>
          )}
        </div>
      </div>

        {/* 우측: 스타벅스 스타일 영수증 프리뷰 (나머지 공간 전부) */}
        <div
          className={`min-h-0 flex-1 flex flex-col items-center justify-center p-6 overflow-hidden transition-all duration-300 border-t md:border-t-0 ${
            isTimerRunning ? 'w-full' : ''
          }`}
          style={{ borderColor: panelBorder }}
        >
          <div className="w-full flex justify-center">
          <div
            className="flex flex-col rounded-2xl overflow-hidden font-mono"
            style={{
              background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              border: `1px solid ${theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB'}`,
              boxShadow:
                theme.mode === 'light'
                  ? '0 4px 16px rgba(0,0,0,0.1)'
                  : '0 8px 24px rgba(0,0,0,0.4)',
              width: '100%',
              maxWidth: '600px',
            }}
          >
            {/* 상단 헤더 */}
            <div
              className="py-4 px-6 text-center"
              style={{
                background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              }}
            >
              {/* 로고 */}
              <div className="flex justify-center mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
                    color: '#FFFFFF',
                  }}
                >
                  ★
                </div>
              </div>

              {/* 타이틀 */}
              <div
                className="font-mono font-bold text-base tracking-wider mb-1"
                style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}
              >
                STUDYBUDDY
              </div>
              <div
                className="font-mono text-xs"
                style={{ color: theme.mode === 'dark' ? '#999999' : '#6B7280' }}
              >
                매장(001) 플로우점
              </div>
            </div>

            {/* 점선 구분 */}
            <div
              className="flex justify-center py-1"
              style={{
                background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              }}
            >
              <div
                className="font-mono text-xs tracking-widest"
                style={{ color: theme.mode === 'dark' ? '#666666' : '#D1D5DB' }}
              >
                - - - - - - - - - - - - - - - - - -
              </div>
            </div>

            {/* 주문 번호 */}
            <div
              className="py-2 px-6 text-center"
              style={{
                background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              }}
            >
              <div
                className="font-mono text-sm font-bold"
                style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}
              >
                지번 (A-{new Date().getDate().toString().padStart(2, '0')})
              </div>
            </div>

            {/* 점선 구분 */}
            <div
              className="flex justify-center py-1"
              style={{
                background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              }}
            >
              <div
                className="font-mono text-xs tracking-widest"
                style={{ color: theme.mode === 'dark' ? '#666666' : '#D1D5DB' }}
              >
                - - - - - - - - - - - - - - - - - -
              </div>
            </div>

            {/* 상품 목록 (세션) */}
            <div
              className="px-6 py-4 min-h-[120px]"
              style={{
                background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              }}
            >
              {/* 입력/타이머 실시간 상태 */}
              {isTimerRunning ? (
                <div
                  className="font-mono text-xs mb-3 animate-pulse text-center"
                  style={{ color: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6' }}
                >
                  진행 중: {timerSubject || subject || '목표 없음'} · {formatTimer(timerSeconds)}
                </div>
              ) : subject.trim() ? (
                <div
                  className="font-mono text-xs mb-3 text-center"
                  style={{ color: theme.mode === 'dark' ? '#999999' : '#6B7280' }}
                >
                  입력 중: {subject.trim()}
                </div>
              ) : null}

              {/* 세션 목록 */}
              {sessions.length === 0 ? (
                <div
                  className="text-center font-mono text-xs py-4"
                  style={{ color: theme.mode === 'dark' ? '#999999' : '#6B7280' }}
                >
                  기록을 시작하면 여기에
                  <br />
                  세션이 쌓입니다.
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between font-mono text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">
                          {session.categoryEmoji ?? '🎯'}
                        </span>
                        <span
                          className="truncate"
                          style={{
                            color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
                          }}
                        >
                          {session.subject}
                        </span>
                      </div>
                      <span
                        className="shrink-0 font-medium"
                        style={{
                          color: session.categoryColor ?? (theme.mode === 'dark' ? '#CCFF00' : '#3B82F6'),
                        }}
                      >
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 점선 구분 */}
            <div
              className="flex justify-center py-1"
              style={{
                background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              }}
            >
              <div
                className="font-mono text-xs tracking-widest"
                style={{ color: theme.mode === 'dark' ? '#666666' : '#D1D5DB' }}
              >
                - - - - - - - - - - - - - - - - - -
              </div>
            </div>

            {/* 합계 */}
            <div
              className="px-6 py-3"
              style={{
                background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              }}
            >
              <div className="flex justify-between font-mono text-sm mb-2">
                <span
                  style={{
                    color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
                  }}
                >
                  합계
                </span>
                <span
                  className="font-bold"
                  style={{
                    color: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
                  }}
                >
                  {totalLabel}
                </span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span
                  style={{
                    color: theme.mode === 'dark' ? '#999999' : '#6B7280',
                  }}
                >
                  세션 수
                </span>
                <span
                  style={{
                    color: theme.mode === 'dark' ? '#999999' : '#6B7280',
                  }}
                >
                  {sessions.length}개
                </span>
              </div>
            </div>

            {/* 실선 구분 */}
            <div
              className="border-t"
              style={{
                borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB',
              }}
            />

            {/* 하단 정보 */}
            <div
              className="px-6 py-3 text-center"
              style={{
                background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              }}
            >
              <div
                className="font-mono text-xs"
                style={{
                  color: theme.mode === 'dark' ? '#666666' : '#9CA3AF',
                }}
              >
                {dateStr} {new Date().toTimeString().slice(0, 8)}
              </div>
              <div
                className="font-mono text-xs mt-1"
                style={{
                  color: theme.mode === 'dark' ? '#666666' : '#9CA3AF',
                }}
              >
                FLOW RECEIPT
              </div>
            </div>

            {/* 바코드 느낌 텍스트 */}
            <div
              className="px-6 py-3 flex justify-center"
              style={{
                background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              }}
            >
              <div
                className="font-mono text-xs tracking-tight"
                style={{
                  color: theme.mode === 'dark' ? '#666666' : '#D1D5DB',
                }}
              >
                ||||  ||  |||||  |||  ||||  ||  |||||
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      {/* 영수증 발행 확인 모달 */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                className="pointer-events-auto w-full max-w-md rounded-2xl font-mono overflow-hidden shadow-2xl"
                style={{
                  background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
                  border: `1px solid ${theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB'}`,
                }}
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b" style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}>
                  <h2 id="confirm-modal-title" className="text-lg font-bold uppercase tracking-wider" style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}>
                    영수증 발행
                  </h2>
                </div>
                <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
                  <p className="text-sm mb-3" style={{ color: theme.mode === 'dark' ? '#999999' : '#6B7280' }}>
                    아래 세션으로 영수증을 발행합니다.
                  </p>
                  <div className="space-y-2 mb-4">
                    {sessions.map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm py-2 border-b"
                        style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0">{session.categoryEmoji ?? '🎯'}</span>
                          <span className="truncate" style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}>
                            {session.subject}
                          </span>
                        </div>
                        <span className="shrink-0 font-medium" style={{ color: session.categoryColor ?? (theme.mode === 'dark' ? '#CCFF00' : '#3B82F6') }}>
                          {formatDuration(session.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold text-sm py-2" style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}>
                    <span>총 {sessions.length}개 세션</span>
                    <span style={{ color: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6' }}>{totalLabel}</span>
                  </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}>
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 rounded-lg border font-mono font-bold text-sm uppercase transition-all"
                    style={{
                      background: 'transparent',
                      color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
                      borderColor: theme.mode === 'dark' ? '#666666' : '#D1D5DB',
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="flex-1 py-3 rounded-lg font-mono font-bold text-sm uppercase transition-all"
                    style={{
                      background: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
                      color: theme.mode === 'dark' ? '#000000' : '#FFFFFF',
                      border: 'none',
                    }}
                  >
                    발행하기
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
  </section>
  );
};
