import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { StudyItem } from '../types';
import { SoundManager } from '../lib/soundManager';
import { useTheme } from '../context/ThemeContext';
import { ReceiptTopStrip } from './ReceiptTopStrip';
import { ZigzagEdge } from './ZigzagEdge';

const BORDER_COLOR = '#1F2937';
const NEON_LIME = '#CCFF00';
const RECEIPT_FONT = '"JetBrains Mono", ui-monospace, monospace';
const RECEIPT_FONT_SIZE = 18;
const RECEIPT_BG = '#FCFCFC';

const formatTimer = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}초`;
  return `${m}분 ${s.toString().padStart(2, '0')}초`;
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (h === 0) return `${mins}분`;
  if (mins === 0) return `${h}시간`;
  return `${h}시간 ${mins}분`;
};

interface Workshop20Props {
  items: StudyItem[];
  onAddItem: (item: StudyItem) => void;
  onPrintReceipt?: () => void;
  isResetting?: boolean;
  onResetComplete?: () => void;
  user?: { email?: string | null } | null;
}

export const Workshop20: React.FC<Workshop20Props> = ({
  items: sessions,
  onAddItem,
  onPrintReceipt,
  isResetting = false,
  onResetComplete,
  user,
}) => {
  const [subject, setSubject] = useState('');
  const [memo, setMemo] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerSubject, setTimerSubject] = useState<string | null>(null);
  const prevLengthRef = useRef(sessions.length);
  const theme = useTheme();

  const layoutBg = theme.bg;
  const textColor = theme.text;
  const panelBg = theme.panelBg;
  const panelBorder = theme.panelBorder;
  const timerBg = theme.mode === 'dark' ? '#0a0a0a' : theme.panelBg;

  useEffect(() => {
    if (!isTimerRunning) return;
    const id = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isTimerRunning]);

  useEffect(() => {
    prevLengthRef.current = sessions.length;
  }, [sessions.length]);

  const handleStart = () => {
    const s = subject.trim();
    if (!s) {
      window.alert('과목을 입력해주세요.');
      return;
    }
    setTimerSubject(s);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  const handleAddSession = () => {
    const sub = (timerSubject || subject.trim()) || '세션';
    const minutes = Math.max(1, Math.round(timerSeconds / 60));

    if (minutes > 0 || sub !== '세션') {
      onAddItem({
        subject: sub,
        duration: minutes,
        keyInsight: memo.trim() || undefined,
        mode: 'flow',
      });
      SoundManager.playPrinting();
    }

    setSubject('');
    setMemo('');
    setTimerSeconds(0);
    setTimerSubject(null);
    setIsTimerRunning(false);
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalLabel = formatDuration(totalMinutes);
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  return (
    <section
      className="relative min-h-[calc(100vh-4rem)] flex flex-col md:flex-row transition-colors duration-300"
      style={{ background: layoutBg, color: textColor }}
    >
      {/* 좌측 50%: Control (PC 5:5, 모바일 100% 위아래) · 집중 모드 시 숨김 */}
      <div
        className={`min-h-0 flex flex-col p-6 border-b md:border-b-0 md:border-r transition-all duration-300 ${
          isTimerRunning ? 'w-0 min-w-0 overflow-hidden opacity-0 pointer-events-none p-0 border-0' : 'w-full md:w-1/2'
        }`}
        style={{ borderColor: isTimerRunning ? 'transparent' : BORDER_COLOR }}
      >
        <h2 className="text-lg font-mono font-bold uppercase tracking-widest mb-6" style={{ color: NEON_LIME }}>
          Control
        </h2>

        <div className="space-y-4 mb-6">
          <label className="block text-sm font-mono font-bold uppercase tracking-wider text-gray-400">
            [과목]
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="과목 / 활동명"
            disabled={isTimerRunning}
            className="w-full rounded-lg border px-4 py-3 font-mono text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] disabled:opacity-70 min-h-[48px] md:min-h-[44px]"
            style={{ background: panelBg, borderColor: panelBorder, color: textColor }}
          />
        </div>

        <div className="space-y-4 mb-6">
          <label className="block text-sm font-mono font-bold uppercase tracking-wider text-gray-400">
            [메모]
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모 (선택)"
            rows={3}
            disabled={isTimerRunning}
            className="w-full rounded-lg border-2 px-4 py-3 font-mono text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] resize-none disabled:opacity-70 min-h-[48px]"
            style={{ background: panelBg, borderColor: BORDER_COLOR, color: textColor }}
          />
        </div>

        <div
          className="rounded-xl border p-6 mb-6 flex items-center justify-center min-h-[100px]"
          style={{ borderColor: panelBorder, background: timerBg }}
        >
          <span
            className="font-mono font-bold tabular-nums text-4xl md:text-5xl"
            style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', color: isTimerRunning ? NEON_LIME : textColor }}
          >
            {formatTimer(timerSeconds)}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {!isTimerRunning ? (
            <button
              type="button"
              onClick={handleStart}
              disabled={!subject.trim()}
              className="w-full py-4 rounded-lg font-mono font-bold text-base uppercase border transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] md:min-h-[44px]"
              style={{ background: theme.primaryButtonBg, color: theme.primaryButtonText, borderColor: panelBorder }}
            >
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsTimerRunning(false)}
              className="w-full py-4 rounded-lg font-mono font-bold text-base uppercase border transition-colors min-h-[48px] md:min-h-[44px]"
              style={{ background: theme.mode === 'dark' ? '#1a1a1a' : theme.panelBg, color: NEON_LIME, borderColor: panelBorder }}
            >
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={handleAddSession}
            className="w-full py-4 rounded-lg font-mono font-bold text-base uppercase border transition-colors min-h-[48px] md:min-h-[44px]"
            style={{ background: theme.primaryButtonBg, color: theme.primaryButtonText, borderColor: panelBorder }}
          >
            Add Session
          </button>
          {onPrintReceipt && (
            <button
              type="button"
              onClick={onPrintReceipt}
              className="w-full py-3 rounded-lg font-mono font-bold text-sm uppercase border transition-colors min-h-[48px] md:min-h-[44px]"
              style={{ borderColor: panelBorder, background: theme.primaryButtonBg, color: theme.primaryButtonText }}
            >
              영수증 발행
            </button>
          )}
        </div>
      </div>

      {/* 우측 50%: Preview (PC 5:5, 모바일 100%) · 집중 모드 시 전체 중앙 확대 */}
      <div
        className={`min-h-0 flex flex-col items-center justify-center p-6 overflow-hidden transition-all duration-300 ${
          isTimerRunning ? 'w-full' : 'w-full md:w-1/2'
        } border-t md:border-t-0 border-[#1F2937]`}
        style={{ borderColor: panelBorder }}
      >
        <div
          className={`flex flex-col rounded-xl border overflow-hidden transition-all duration-300 ${
            isTimerRunning ? 'w-full max-w-xl flex-1 min-h-[60vh]' : 'w-full max-w-md h-full min-h-[400px]'
          }`}
          style={{
            background: RECEIPT_BG,
            borderColor: panelBorder,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 12px 24px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
          }}
        >
          {/* 상단: 구멍 + 로고 + 날짜 (집중 모드 시 타이머) */}
          <ReceiptTopStrip />
          <div className="shrink-0 px-6 pb-4 border-b border-gray-200" style={{ background: RECEIPT_BG }}>
            {isTimerRunning && (
              <div className="flex flex-col items-center gap-3 mb-4">
                <span
                  className="font-mono font-bold tabular-nums text-3xl md:text-4xl"
                  style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', color: NEON_LIME }}
                >
                  {formatTimer(timerSeconds)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(false)}
                  className="px-4 py-2 rounded-lg font-mono font-bold text-sm uppercase border-2 border-black transition-colors"
                  style={{ background: '#1a1a1a', color: NEON_LIME }}
                >
                  Stop
                </button>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-mono font-bold uppercase tracking-widest text-black text-sm">Flow Receipt</span>
            </div>
            <p className="text-center font-semibold text-black" style={{ fontFamily: RECEIPT_FONT, fontSize: RECEIPT_FONT_SIZE }}>
              {dateStr}
            </p>
          </div>

          {/* 스크롤 영역: 세션 리스트 (가독성: JetBrains Mono 18px+) */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ fontFamily: RECEIPT_FONT, fontSize: RECEIPT_FONT_SIZE }}>
            <div className="px-6 py-4 space-y-3">
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8" style={{ fontSize: RECEIPT_FONT_SIZE }}>
                  기록을 시작하면 여기에 세션이 쌓입니다.
                </p>
              ) : (
                sessions.map((item, idx) => {
                  const isNew = sessions.length > prevLengthRef.current && idx === sessions.length - 1;
                  return (
                    <motion.div
                      key={`${item.subject}-${idx}`}
                      layout
                      className="flex justify-between items-start gap-3 py-2 border-b border-gray-100 last:border-0"
                      initial={isNew ? { opacity: 0, y: -16 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                      style={{ color: '#000', fontFamily: RECEIPT_FONT, fontSize: RECEIPT_FONT_SIZE }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-black break-words">
                          {item.subject}
                        </p>
                        {item.keyInsight && (
                          <p className="text-gray-600 mt-0.5 font-medium">
                            {item.keyInsight}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-black shrink-0">
                        {formatDuration(item.duration)}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* 하단 고정: 총 공부 시간 */}
            {sessions.length > 0 && (
              <div
                className="sticky bottom-0 px-6 py-4 mt-auto border-t-2 border-dashed border-gray-300 font-bold flex justify-between items-center"
                style={{ fontFamily: RECEIPT_FONT, fontSize: RECEIPT_FONT_SIZE, color: '#000', background: 'rgba(0,0,0,0.03)' }}
              >
                <span>총 공부 시간</span>
                <span>{totalLabel}</span>
              </div>
            )}
          </div>

          {/* 절취선: 항상 영수증 최하단 */}
          <div className="shrink-0">
            <ZigzagEdge fill={RECEIPT_BG} height={14} />
          </div>
        </div>
      </div>
    </section>
  );
};
