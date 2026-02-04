import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { fetchTodaySessions, type StudySessionDoc } from '../../firebase';
import { AIManagerBubble } from '../AIManagerBubble';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-lime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-12 bg-brand-black text-white min-h-[70vh]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" aria-hidden />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            오늘의 <span className="text-brand-lime">정산</span>
          </h2>
          <p className="text-gray-400 text-sm font-mono">{todayStr}</p>
        </div>

        {/* 요약: 총 집중 시간 + 인사이트 개수 */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
          <div className="rounded-xl border-2 border-brand-lime bg-[#1a1a1a] p-4 text-center">
            <p className="text-[10px] font-bold text-brand-lime uppercase tracking-wider mb-1">총 집중 시간</p>
            <p className="text-2xl font-bold text-black bg-brand-lime/90 px-3 py-1 rounded inline-block">
              {formatDuration(totalMinutes)}
            </p>
          </div>
          <div className="rounded-xl border-2 border-brand-lime bg-[#1a1a1a] p-4 text-center">
            <p className="text-[10px] font-bold text-brand-lime uppercase tracking-wider mb-1">인사이트</p>
            <p className="text-2xl font-bold text-black bg-brand-lime/90 px-3 py-1 rounded inline-block">
              {insightCount}개
            </p>
          </div>
        </div>

        {/* 롱 롤 영수증 */}
        <div className="max-w-sm mx-auto rounded-lg border-2 border-brand-lime bg-white overflow-hidden shadow-2xl shadow-brand-lime/10">
          <div className="p-4 font-mono text-brand-black">
            <div className="flex flex-col items-center border-b-2 border-dashed border-gray-300 pb-3 mb-3">
              <div className="w-10 h-10 bg-brand-black rounded-full flex items-center justify-center text-brand-lime font-bold text-sm">SB</div>
              <p className="text-[10px] text-gray-800 font-bold uppercase tracking-widest mt-2">Long Roll · Daily Receipt</p>
              <p className="text-xs text-gray-800 font-medium">{todayStr}</p>
            </div>
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-800 font-medium text-center py-8">오늘 발행된 영수증이 없습니다.</p>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {sessions.map((s, idx) => (
                  <div key={s.id} className="border-b border-dashed border-gray-200 pb-3 last:border-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-black text-sm flex-1 break-words">
                        {s.mode === 'target' && <span className="text-brand-lime mr-1">◉</span>}
                        {s.subject}
                      </span>
                      <span className="text-xs font-bold text-black bg-brand-lime/80 px-2 py-0.5 rounded shrink-0">
                        {formatDuration(s.minutes)}
                      </span>
                    </div>
                    {s.keyInsight && (
                      <p className="text-[11px] text-black font-bold mt-1 pl-2 border-l-2 border-brand-lime/50">
                        {s.keyInsight}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="border-t-2 border-dashed border-gray-300 mt-4 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800 uppercase">Total</span>
              <span className="text-lg font-bold text-black">{formatDuration(totalMinutes)}</span>
            </div>
          </div>
        </div>
      </div>
      <AIManagerBubble message={null} />
    </section>
  );
};
