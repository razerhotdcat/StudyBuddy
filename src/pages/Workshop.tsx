import React, { useEffect, useState, useRef } from 'react';
import type { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Navbar } from '../components/Navbar';
import type { TabId } from '../components/TabNavigation';
import { Workshop as WorkshopTabs } from '../components/tabs/Workshop';
import { Collection } from '../components/tabs/Collection';
import { DailyReport } from '../components/tabs/DailyReport';
import { Square } from '../components/tabs/Square';
import { MyOffice } from '../components/tabs/MyOffice';
import { Footer } from '../components/Footer';
import {
  signInWithGoogle,
  signOutUser,
  getUserProfile,
  type UserProfileDoc,
} from '../firebase';
import type { StudyItem } from '../types';
import { FlyReceiptOverlay } from '../components/FlyReceiptOverlay';
import { ProfileSettingsModal } from '../components/ProfileSettingsModal';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';
import { LevelUpModal } from '../components/LevelUpModal';
import { GlobalBackground } from '../components/GlobalBackground';

interface WorkshopPageProps {
  user: User;
}

const Workshop: React.FC<WorkshopPageProps> = ({ user }) => {
  const theme = useTheme();
  const [sessions, setSessions] = useState<StudyItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('workshop');
  const [isResetting, setIsResetting] = useState(false);
  const [dashboardKey, setDashboardKey] = useState(0);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [flyToCollection, setFlyToCollection] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<{ show: boolean; level: number }>({ show: false, level: 1 });
  const savePromisesRef = useRef<Promise<void>[]>([]);

  // 로그인 시 Firestore 프로필 로드
  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      return;
    }
    getUserProfile(user.uid)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [user?.uid]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google 로그인 실패', error);
    }
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await signOutUser();
      setSessions([]);
      setProfile(null);
    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  };

  const handleAddStudyItem = (item: StudyItem) => {
    // 화면 상의 워크샵 세션 배열에만 누적 (발행 전까지는 메모리에서만 관리)
    setSessions((prev) => [...prev, item]);
  };

  /** 로고 클릭: WORKSHOP으로 이동 후 영수증 슬라이드아웃 → 상태 초기화(Soft Refresh) */
  const handleLogoClick = () => {
    // 이미 리셋 중이거나 플라이 애니메이션 중이면 무시
    if (isResetting || flyToCollection) return;
    // 이미 WORKSHOP 탭이면 아무 것도 하지 않음
    if (activeTab === 'workshop') return;
    setActiveTab('workshop');
    setIsResetting(true);
  };

  /** 영수증 슬라이드아웃 애니메이션 완료 후 호출: items 비우고 Workshop 재마운트 */
  const handleResetComplete = () => {
    setSessions([]);
    setDashboardKey((k) => k + 1);
    setIsResetting(false);
  };

  /** [영수증 발행]: Workshop20에서 저장 후 호출 → COLLECTION으로 날아가는 애니 후 탭 전환 */
  const handlePrintReceipt = () => {
    // Workshop20 handlePublish에서 이미 Firebase 저장 후 호출하므로 여기서는 애니만 트리거
    setFlyToCollection(true);
  };

  const handleFlyToCollectionComplete = () => {
    const promises = [...savePromisesRef.current];
    savePromisesRef.current = [];

    if (promises.length === 0) {
      // 즉시 상태 초기화
      setSessions([]);
      setFlyToCollection(false);
      setIsResetting(false);

      // 다음 틱에 탭 이동 (상태 업데이트 후)
      setTimeout(() => {
        setActiveTab('collection');
      }, 0);
      return;
    }

    Promise.all(promises)
      .catch((error) => {
        console.error('세션 저장 대기 중 오류', error);
      })
      .finally(() => {
        // 즉시 상태 초기화
        setSessions([]);
        setFlyToCollection(false);
        setIsResetting(false);

        // 다음 틱에 탭 이동
        setTimeout(() => {
          setActiveTab('collection');
        }, 0);
      });
  };

  const handleNavigateToCollection = () => {
    setActiveTab('collection');
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    try {
      await signOutUser();
      setSessions([]);
      setProfile(null);
    } catch (err) {
      console.error('로그아웃 실패', err);
    }
  };

  const isLoggedIn = !!user;

  // activeTab 값: 'workshop' | 'collection' | 'daily-report' | 'square' | 'my-office'
  const renderTabContent = () => {
    switch (activeTab) {
      case 'workshop':
        return (
          <WorkshopTabs
            key={`workshop-${dashboardKey}`}
            items={sessions}
            onAddItem={handleAddStudyItem}
            isResetting={isResetting}
            onResetComplete={handleResetComplete}
            onPrintReceipt={handlePrintReceipt}
            onLevelUp={(newLevel) => setLevelUpModal({ show: true, level: newLevel })}
            profile={profile ? { nickname: profile.nickname, jobGoal: profile.jobGoal } : null}
            user={user}
          />
        );
      case 'collection':
        return <Collection userId={user?.uid ?? null} />;
      case 'daily-report':
        return <DailyReport userId={user?.uid ?? null} />;
      case 'square':
        return <Square />;
      case 'my-office':
        return (
          <MyOffice
            user={user}
            profile={profile}
            isAdmin={user?.email === 'utone6300@gmail.com'}
            onOpenProfileSettings={() => setShowProfileModal(true)}
          />
        );
      default:
        return (
          <WorkshopTabs
            key={`workshop-${dashboardKey}`}
            items={sessions}
            onAddItem={handleAddStudyItem}
            isResetting={isResetting}
            onResetComplete={handleResetComplete}
            onPrintReceipt={handlePrintReceipt}
            onLevelUp={(newLevel) => setLevelUpModal({ show: true, level: newLevel })}
            profile={profile ? { nickname: profile.nickname, jobGoal: profile.jobGoal } : null}
            user={user}
          />
        );
    }
  };

  return (
    <div
      className="app-container antialiased min-h-screen overflow-x-hidden selection:bg-brand-lime selection:text-black bg-noise transition-colors duration-300"
      style={{ background: theme.bg, color: theme.text }}
    >
      <FlyReceiptOverlay
        visible={flyToCollection}
        onComplete={handleFlyToCollectionComplete}
        sessionCount={sessions.length}
      />
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        uid={user?.uid ?? ''}
        initialProfile={profile}
        onSaved={setProfile}
      />
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
      />
      <LevelUpModal
        isOpen={levelUpModal.show}
        onClose={() => setLevelUpModal((p) => ({ ...p, show: false }))}
        newLevel={levelUpModal.level}
      />
      <Navbar
        user={user}
        profile={profile}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        onLogoClick={isLoggedIn ? handleLogoClick : undefined}
        onNavigateToCollection={isLoggedIn ? handleNavigateToCollection : undefined}
        onOpenProfileSettings={isLoggedIn ? () => setShowProfileModal(true) : undefined}
        onOpenLogoutConfirm={isLoggedIn ? () => setShowLogoutConfirm(true) : undefined}
        activeTab={isLoggedIn ? activeTab : undefined}
        onTabChange={isLoggedIn ? setActiveTab : undefined}
      />
      <main>
        <div
          className="min-h-screen pt-16 relative overflow-x-hidden transition-colors duration-300"
          style={{ background: theme.bg }}
        >
          <GlobalBackground />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="relative z-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Workshop;

