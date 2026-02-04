import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle } from './firebase';
import LandingPage from './pages/LandingPage';
import Workshop from './pages/Workshop';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 새로고침/초기 로드 시 인증 상태 동기화
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google 로그인 실패', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black text-brand-lime">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-lime border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm tracking-[0.3em]">
            LOADING
          </span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/workshop" replace />
            ) : (
              <LandingPage onStart={handleGoogleLogin} />
            )
          }
        />
        <Route
          path="/workshop"
          element={user ? <Workshop user={user} /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;