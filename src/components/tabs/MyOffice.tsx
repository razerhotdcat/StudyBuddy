import React, { useEffect, useState } from 'react';
import { User, Settings, FileText, Shield, BarChart3 } from 'lucide-react';
import { fetchWeekMinutes, fetchStudySessions } from '../../firebase';
import { AIManagerBubble } from '../AIManagerBubble';
import type { UserProfileDoc } from '../../firebase';
import type { User as AuthUser } from 'firebase/auth';
import { useTheme } from '../../context/ThemeContext';

interface MyOfficeProps {
  user: AuthUser | null;
  profile: UserProfileDoc | null;
  isAdmin?: boolean;
  onOpenProfileSettings: () => void;
}

const DAY_LABELS = ['오늘', '어제', '2일전', '3일전', '4일전', '5일전', '6일전'];

export const MyOffice: React.FC<MyOfficeProps> = ({
  user,
  profile,
  isAdmin = false,
  onOpenProfileSettings,
}) => {
  const theme = useTheme();
  const [weekMinutes, setWeekMinutes] = useState<number[]>([]);
  const [totalReceipts, setTotalReceipts] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setWeekMinutes([]);
      setTotalReceipts(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      fetchWeekMinutes(user.uid),
      fetchStudySessions(user.uid).then((sessions) => sessions.length),
    ])
      .then(([minutes, count]) => {
        setWeekMinutes(minutes);
        setTotalReceipts(count);
      })
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const displayName = profile?.nickname || user?.displayName || user?.email || '사용자';
  const photoURL = profile?.photoURL || user?.photoURL;
  const maxMin = Math.max(1, ...weekMinutes);

  return (
    <section className="relative py-12 min-h-[70vh] transition-colors" style={{ background: theme.bg, color: theme.text }}>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" aria-hidden />
      <div className="container mx-auto px-4 relative z-10 max-w-2xl">
        {/* 관리자 전용: MY OFFICE 탭 안에서만 표시 */}
        {isAdmin && (
          <div className="rounded-2xl border-2 border-[#CCFF00] bg-[#1a1a1a] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={24} className="text-[#CCFF00]" />
              <h3 className="text-lg font-bold text-[#CCFF00]">관리자 전용</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={18} className="text-[#CCFF00]" />
                  <span className="font-mono text-sm font-bold uppercase text-gray-300">전체 유저 통계</span>
                </div>
                <p className="text-sm text-gray-400">연동 후 전체 가입자·활성 유저 통계가 여기에 표시됩니다.</p>
              </div>
              <div className="rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings size={18} className="text-[#CCFF00]" />
                  <span className="font-mono text-sm font-bold uppercase text-gray-300">시스템 설정</span>
                </div>
                <p className="text-sm text-gray-400">시스템 전역 설정은 이 영역에서만 관리됩니다.</p>
              </div>
            </div>
          </div>
        )}
        {/* 프로필 상단 */}
        <div className="rounded-2xl border p-6 mb-6" style={{ background: theme.panelBg, borderColor: theme.panelBorder }}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-full border-2 border-brand-lime overflow-hidden bg-[#222] flex items-center justify-center shrink-0">
              {photoURL ? (
                <img src={photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-brand-lime" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>{displayName}</h2>
              {profile?.jobGoal && (
                <p className="text-sm text-brand-lime font-medium mb-3">{profile.jobGoal}</p>
              )}
              <button
                type="button"
                onClick={onOpenProfileSettings}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-brand-lime text-brand-lime font-bold hover:bg-brand-lime hover:text-black transition-colors min-h-[48px] md:min-h-0"
              >
                <Settings size={16} />
                프로필 수정
              </button>
            </div>
          </div>
        </div>

        {/* 누적 발행 영수증 개수 */}
        <div className="rounded-2xl border-2 border-brand-lime/70 p-6 mb-6" style={{ background: theme.panelBg }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>발행 영수증</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-lime/20 border border-brand-lime flex items-center justify-center">
              <FileText size={24} className="text-brand-lime" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-lime">{totalReceipts}</p>
              <p className="text-xs text-gray-400">누적 발행 영수증 개수</p>
            </div>
          </div>
        </div>

        {/* 이번 주 집중 시간 막대 차트 */}
        <div className="rounded-2xl border-2 border-brand-lime p-6" style={{ background: theme.panelBg }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>이번 주 집중 시간</h3>
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-brand-lime border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {weekMinutes.map((mins, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-mono w-12 shrink-0">{DAY_LABELS[i]}</span>
                  <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-brand-lime rounded min-w-[4px] transition-all duration-500"
                      style={{ width: `${(mins / maxMin) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-brand-lime w-12 text-right">{mins}m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <AIManagerBubble message={null} />
    </section>
  );
};
