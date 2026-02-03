import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeatureRecord } from './components/FeatureRecord';
import { FeatureReceipt } from './components/FeatureReceipt';
import { Footer } from './components/Footer';
import {
  saveStudySession,
  signInWithGoogle,
  signOutUser,
} from './firebase';
import type { StudyItem } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<StudyItem[]>([]);

  const handleLogin = async () => {
    console.log('Login button clicked');
    try {
      const firebaseUser = await signInWithGoogle();
      setUser(firebaseUser);
    } catch (error) {
      console.error('Google 로그인 실패', error);
    }
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  };

  const handleStartClick = async () => {
    // 로그인된 유저가 있다면 해당 uid를 사용하고, 없으면 데모 uid 사용
    const uid = user?.uid ?? 'demo-user-uid';

    const subject = window.prompt('공부한 과목명을 입력하세요.');
    if (!subject) return;

    const timeStr = window.prompt(
      '공부한 시간을 "분" 단위의 숫자로 입력하세요. (예: 90)',
    );
    if (!timeStr) return;

    const minutes = Number(timeStr);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      window.alert('유효한 숫자를 입력해주세요.');
      return;
    }

    try {
      await saveStudySession(uid, {
        subject,
        minutes,
      });
      window.alert('공부 세션이 Firestore에 저장되었습니다!');
    } catch (error) {
      console.error(error);
      window.alert('저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
    }
  };

  return (
    <div className="antialiased text-slate-900 bg-white selection:bg-brand-lime selection:text-brand-black">
      <Navbar
        user={user}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
      />
      <main>
        <HeroSection />
        <FeatureRecord />
        <FeatureReceipt
          items={items}
          onAddItem={(item) => setItems((prev) => [...prev, item])}
        />
        
        {/* Call to Action Banner */}
        <section className="py-20 px-4 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-6">지금 바로 첫 영수증을 뽑아보세요.</h2>
            <p className="text-gray-600 mb-8">
              이메일만 입력하면 즉시 시작할 수 있습니다. <br/>
              복잡한 타이머 설정 없이, 당신의 공부를 증명하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input 
                type="email" 
                placeholder="이메일 주소 입력" 
                className="px-6 py-4 rounded-full border-2 border-gray-200 focus:border-brand-black focus:outline-none min-w-[280px]"
              />
              <button
                className="bg-brand-black text-brand-lime font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-lg"
                onClick={handleStartClick}
              >
                무료로 시작하기
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;