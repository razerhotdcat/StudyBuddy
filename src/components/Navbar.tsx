import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/Button';

interface NavbarProps {
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLoginClick,
  onLogoutClick,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-black rounded-lg flex items-center justify-center -rotate-6">
             <span className="text-brand-lime font-mono font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight">StudyBuddy</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:text-gray-600 transition-colors">기능 소개</a>
          <a href="#philosophy" className="text-sm font-medium hover:text-gray-600 transition-colors">철학</a>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  className="text-sm font-bold hover:underline px-3 py-2"
                  onClick={onLogoutClick}
                >
                  로그아웃
                </button>
                <span className="text-sm font-medium">
                  {user.displayName || '프로필'}
                </span>
              </>
            ) : (
              <>
                <button
                  className="text-sm font-bold hover:underline px-3 py-2"
                  onClick={onLoginClick}
                >
                  로그인
                </button>
                <Button size="sm">무료로 시작하기</Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 flex flex-col gap-4 md:hidden shadow-lg">
          <a href="#features" className="block py-2 font-medium" onClick={() => setIsMenuOpen(false)}>기능 소개</a>
          <a href="#philosophy" className="block py-2 font-medium" onClick={() => setIsMenuOpen(false)}>철학</a>
          <div className="h-[1px] bg-gray-100 w-full"></div>
          <button
            className="w-full text-left font-bold py-2"
            onClick={() => {
              if (user) {
                onLogoutClick();
              } else {
                onLoginClick();
              }
              setIsMenuOpen(false);
            }}
          >
            {user ? '로그아웃' : '로그인'}
          </button>
          <Button className="w-full" onClick={() => setIsMenuOpen(false)}>
            무료로 시작하기
          </Button>
        </div>
      )}
    </nav>
  );
};