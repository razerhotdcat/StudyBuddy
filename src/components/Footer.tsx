import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 py-6 mt-0 min-h-0">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-brand-lime rounded flex items-center justify-center -rotate-6">
            <span className="text-black font-mono font-bold text-xs">S</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-[#ccff00]">StudyBuddy</span>
        </div>
        <div className="flex justify-center gap-6 mb-4 text-sm text-gray-400">
          <a href="#" className="hover:text-brand-lime transition-colors">이용약관</a>
          <a href="#" className="hover:text-brand-lime transition-colors">개인정보처리방침</a>
          <a href="#" className="hover:text-brand-lime transition-colors">문의하기</a>
        </div>
        <p className="text-xs text-gray-500 font-mono">
          © 2024 StudyBuddy Inc. All rights reserved. <br />
          We quantify your effort, not just time.
        </p>
      </div>
    </footer>
  );
};