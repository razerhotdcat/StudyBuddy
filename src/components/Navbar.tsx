import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Menu, X, Wrench, Archive, Calendar, Grid, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import type { UserProfileDoc } from '../firebase';
import type { TabId } from './TabNavigation';

interface NavbarProps {
  user: User | null;
  /** Firestore 프로필 (별명·프로필 이미지 URL 등). 있으면 user 대신 표시 */
  profile?: UserProfileDoc | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  /** 로그인 후 로고 클릭 시 대시보드 초기화 (선택) */
  onLogoClick?: () => void;
  /** 내 기록 보기 → COLLECTION 탭으로 이동 */
  onNavigateToCollection?: () => void;
  /** 프로필 설정 모달 열기 */
  onOpenProfileSettings?: () => void;
  /** 로그아웃 확인(정산) 모달 열기 */
  onOpenLogoutConfirm?: () => void;
  /** 로그인 후: 현재 탭 (로고 옆 탭 네비용) */
  activeTab?: TabId;
  /** 로그인 후: 탭 변경 */
  onTabChange?: (tab: TabId) => void;
}

const tabs = [
  { id: 'workshop' as TabId, label: 'WORKSHOP', icon: Wrench },
  { id: 'collection' as TabId, label: 'COLLECTION', icon: Archive },
  { id: 'daily-report' as TabId, label: 'DAILY REPORT', icon: Calendar },
  { id: 'square' as TabId, label: 'SQUARE', icon: Grid },
  { id: 'my-office' as TabId, label: 'MY OFFICE', icon: UserIcon },
];

export const Navbar: React.FC<NavbarProps> = ({
  user,
  profile,
  onLoginClick,
  onLogoutClick,
  onLogoClick,
  onNavigateToCollection,
  onOpenProfileSettings,
  onOpenLogoutConfirm,
  activeTab = 'workshop',
  onTabChange,
}) => {
  const displayName = profile?.nickname || user?.displayName || user?.email || 'U';
  const photoURL = profile?.photoURL || user?.photoURL;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 로그인 후에는 다크 모드 간소화 버전
  const isLoggedIn = !!user;
  const navClasses = isLoggedIn
    ? 'fixed top-0 left-0 w-full z-50 bg-[#0a0a0a] border-b border-gray-800 py-3'
    : 'fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800 py-4';

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo + 탭 네비: 로그인 시 로고 옆에 탭 가로 배치 */}
        <div className="flex items-center gap-1 md:gap-4 overflow-x-auto min-w-0">
          {isLoggedIn && onLogoClick ? (
            <button
              type="button"
              onClick={onLogoClick}
              className="flex items-center gap-2 rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:ring-offset-2 focus:ring-offset-gray-900 shrink-0"
              style={{ cursor: 'pointer' }}
              aria-label="대시보드 초기화"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center -rotate-6 bg-brand-lime">
                <span className="font-mono font-bold text-lg text-black">S</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-[#ccff00] hidden sm:inline">StudyBuddy</span>
            </button>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2 shrink-0 cursor-default">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center -rotate-6 bg-brand-lime">
                <span className="font-mono font-bold text-lg text-black">S</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-[#ccff00] hidden sm:inline">StudyBuddy</span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center -rotate-6 bg-brand-black shrink-0">
                <span className="font-mono font-bold text-lg text-brand-lime">S</span>
              </div>
              <span className="font-bold text-xl tracking-tight shrink-0 text-[#ccff00]">StudyBuddy</span>
            </>
          )}

          {/* 로그인 후: 로고 바로 옆 탭 네비 (가로, 큰 글자, 활성 탭 네온 라임) */}
          {isLoggedIn && onTabChange && (
            <nav className="flex items-center gap-1 ml-2 md:ml-4" role="tablist">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 font-mono font-bold tracking-wider transition-colors whitespace-nowrap rounded-lg ${
                      isActive ? '' : 'text-gray-400 hover:text-white'
                    }`}
                    style={{
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      ...(isActive ? { color: '#ccff00' } : {}),
                    }}
                  >
                    <Icon size={20} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ backgroundColor: '#ccff00' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Desktop Nav (비로그인) */}
        {!isLoggedIn && (
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="font-medium text-gray-300 hover:text-white transition-colors">기능 소개</a>
            <a href="#philosophy" className="font-medium text-gray-300 hover:text-white transition-colors">철학</a>
            <div className="flex items-center gap-3">
              <button
                className="text-base font-bold text-white hover:text-[#ccff00] px-1 py-2 transition-colors"
                onClick={onLoginClick}
              >
                로그인
              </button>
              <button
                className="text-base font-bold text-black bg-[#ccff00] rounded-full px-4 py-2 hover:bg-white transition-colors"
                onClick={onLoginClick}
              >
                회원가입
              </button>
            </div>
          </div>
        )}

        {/* 로그인 후 프로필: 아바타 클릭/호버 시 드롭다운, 브릿지로 간격 채워 메뉴 유지 */}
        {isLoggedIn && (
          <div
            className="relative"
            onMouseEnter={() => setIsProfileMenuOpen(true)}
            onMouseLeave={() => setIsProfileMenuOpen(false)}
          >
            <button
              type="button"
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-brand-lime flex items-center justify-center bg-[#1a1a1a] text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-lime/50"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </button>

            {/* 아바타와 드롭다운 사이 투명 브릿지: 마우스 이동 시 메뉴 유지 */}
            {isProfileMenuOpen && (
              <div
                className="absolute left-0 right-0 top-full h-3"
                aria-hidden
              />
            )}

            {isProfileMenuOpen && (
              <div className="absolute right-0 pt-2 top-full">
                <div className="w-48 rounded-xl border-2 border-brand-lime bg-[#1a1a1a] py-2 shadow-xl shadow-brand-lime/5">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-brand-lime/10 hover:text-brand-lime transition-colors"
                    onClick={() => {
                      onNavigateToCollection?.();
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    내 기록 보기
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-brand-lime/10 hover:text-brand-lime transition-colors"
                    onClick={() => {
                      onOpenProfileSettings?.();
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    프로필 설정
                  </button>
                  <div className="h-px bg-gray-700 my-1 mx-2" />
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-brand-lime/10 hover:text-red-400 transition-colors"
                    onClick={() => {
                      onOpenLogoutConfirm?.();
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Toggle (로그인 전에만 표시) */}
        {!isLoggedIn && (
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        )}
      </div>

      {/* Mobile Menu (로그인 전에만 표시) */}
        {!isLoggedIn && isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-gray-800 p-4 flex flex-col gap-4 md:hidden shadow-lg shadow-black/40">
          <a href="#features" className="block py-2 font-medium text-gray-200 hover:text-white" onClick={() => setIsMenuOpen(false)}>기능 소개</a>
          <a href="#philosophy" className="block py-2 font-medium text-gray-200 hover:text-white" onClick={() => setIsMenuOpen(false)}>철학</a>
          <div className="h-[1px] bg-gray-800 w-full"></div>
          <button
            className="w-full text-left font-bold py-2 text-white hover:text-[#ccff00]"
            onClick={() => {
              onLoginClick();
              setIsMenuOpen(false);
            }}
          >
            로그인
          </button>
          <button
            className="w-full text-left font-bold py-2 text-black bg-[#ccff00] rounded-lg hover:bg-white"
            onClick={() => {
              onLoginClick();
              setIsMenuOpen(false);
            }}
          >
            회원가입
          </button>
        </div>
      )}
    </nav>
  );
};