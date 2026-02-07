import React, { useEffect, useState } from 'react';
import { fetchTodaySessions, type StudySessionDoc } from '../../firebase';
import { AIManagerBubble } from '../AIManagerBubble';
import { useTheme } from '../../context/ThemeContext';

interface DailyReportProps {
  userId: string | null;
}

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
};

export const DailyReport: React.FC<DailyReportProps> = ({ userId }) => {
  const theme = useTheme();
  const [sessions, setSessions] = useState<StudySessionDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSessions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchTodaySessions(userId)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [userId]);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const insightCount = sessions.filter((s) => s.keyInsight?.trim()).length;
  const today = new Date();
  const todayStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center transition-colors" style={{ background: theme.bg }}>
        <div className="w-10 h-10 border-2 border-brand-lime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const aiSummaryText =
    sessions.length === 0
      ? '오늘은 아직 발행된 영수증이 없습니다. 워크샵에서 첫 플로우를 찍어볼까요?'
      : `${sessions.length}개의 세션에서 총 ${formatDuration(
          totalMinutes
        )} 집중하셨어요. ${insightCount > 0 ? '인사이트도 여러 개 남겨두신 점이 인상적입니다.' : '다음에는 핵심 인사이트를 한 줄이라도 남겨보는 걸 추천드려요.'}`;

  return (
    <section className="relative py-12 min-h-[70vh] transition-colors" style={{ background: theme.bg, color: theme.text }}>
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"
        aria-hidden
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-10">
          <h2
            className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight"
            style={{
              color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
            }}
          >
            오늘의{' '}
            <span
              style={{
                color: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
              }}
            >
              정산
            </span>
          </h2>
          <p className="text-base font-mono opacity-90">성장을 증명하는 영수증 · AI 점주가 오늘을 정리합니다.</p>
          <p className="text-gray-400 text-base font-mono mt-1">{todayStr}</p>
        </div>

        {/* 상단 벤토 그리드: 총시간, 인사이트, AI 코멘트 */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <div
            className="rounded-xl border p-6 flex flex-col items-center"
            style={{
              background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              borderColor: theme.mode === 'dark' ? '#CCFF00' : '#E5E7EB',
              boxShadow: theme.mode === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <div
              className="text-xs font-mono font-bold uppercase mb-2"
              style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#6B7280' }}
            >
              총 집중 시간
            </div>
            <div
              className="text-4xl font-mono font-bold"
              style={{ color: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6' }}
            >
              {formatDuration(totalMinutes)}
            </div>
          </div>
          <div
            className="rounded-xl border p-6 flex flex-col items-center"
            style={{
              background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              borderColor: theme.mode === 'dark' ? '#CCFF00' : '#E5E7EB',
              boxShadow: theme.mode === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <div
              className="text-xs font-mono font-bold uppercase mb-2"
              style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#6B7280' }}
            >
              인사이트
            </div>
            <div
              className="text-4xl font-mono font-bold"
              style={{ color: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6' }}
            >
              {insightCount}개
            </div>
          </div>
          <div
            className="rounded-xl border p-6 flex flex-col"
            style={{
              background: theme.mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
              borderColor: theme.mode === 'dark' ? '#CCFF00' : '#E5E7EB',
              boxShadow: theme.mode === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6',
                  color: '#FFFFFF',
                }}
              >
                AI
              </div>
              <span
                className="font-mono text-xs font-bold"
                style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}
              >
                점주 코멘트
              </span>
            </div>
            <p
              className="font-mono text-sm"
              style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#6B7280' }}
            >
              {aiSummaryText}
            </p>
          </div>
        </div>

        {/* 하단 롱 롤 영수증: 하단·지그재그 배경색 통일 */}
        <div
          className="max-w-md mx-auto rounded-2xl border overflow-hidden flex flex-col shadow-xl"
          style={{
            background: theme.mode === 'dark' ? '#000000' : '#FFFFFF',
            borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB',
            boxShadow: theme.mode === 'light' ? '0 4px 12px rgba(0,0,0,0.08)' : '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}
        >
          <div
            className="p-5 font-mono flex-1 min-h-0"
            style={{
              background: theme.mode === 'dark' ? '#000000' : '#FFFFFF',
              color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
            }}
          >
            <div
              className="flex flex-col items-center border-b-2 border-dashed pb-3 mb-4"
              style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  background: theme.mode === 'dark' ? '#000000' : '#1C1C1E',
                  color: theme.mode === 'dark' ? '#CCFF00' : '#FFFFFF',
                  border: `2px solid ${theme.mode === 'dark' ? '#CCFF00' : '#3B82F6'}`,
                }}
              >
                SB
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest mt-2" style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}>
                Long Roll · Daily Receipt
              </p>
              <p className="text-sm font-medium" style={{ color: theme.mode === 'dark' ? '#9CA3AF' : '#6B7280' }}>{todayStr}</p>
            </div>
            {sessions.length === 0 ? (
              <p className="text-base font-medium text-center py-10" style={{ color: theme.mode === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                오늘 발행된 영수증이 없습니다.
              </p>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {sessions.map((s) => (
                  <div key={s.id} className="border-b border-dashed pb-3 last:border-0" style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}>
                    <div className="flex justify-between items-start gap-3">
                      <span className="font-bold text-base flex-1 break-words" style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}>
                        {s.mode === 'target' && <span className="text-brand-lime mr-1">◉</span>}
                        {s.subject}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded shrink-0"
                        style={{
                          color: theme.mode === 'dark' ? '#000000' : '#1C1C1E',
                          background: theme.mode === 'dark' ? '#CCFF00' : '#E5E7EB',
                        }}
                      >
                        {formatDuration(s.minutes)}
                      </span>
                    </div>
                    {s.keyInsight && (
                      <p className="text-[13px] font-bold mt-1 pl-2 border-l-2" style={{ color: theme.mode === 'dark' ? '#D1D5DB' : '#1C1C1E', borderColor: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6' }}>
                        {s.keyInsight}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div
              className="border-t-2 border-dashed mt-4 pt-3 flex justify-between items-center"
              style={{ borderColor: theme.mode === 'dark' ? '#2C2C2E' : '#E5E7EB' }}
            >
              <span className="text-base font-bold uppercase" style={{ color: theme.mode === 'dark' ? '#FFFFFF' : '#1C1C1E' }}>Total</span>
              <span className="text-lg font-extrabold" style={{ color: theme.mode === 'dark' ? '#CCFF00' : '#3B82F6' }}>
                {formatDuration(totalMinutes)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <AIManagerBubble message={null} />
    </section>
  );
};
