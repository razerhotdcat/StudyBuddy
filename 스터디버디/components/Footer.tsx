import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-2 mb-6">
           <div className="w-6 h-6 bg-brand-black rounded flex items-center justify-center -rotate-6">
             <span className="text-brand-lime font-mono font-bold text-xs">S</span>
           </div>
           <span className="font-bold text-lg tracking-tight">StudyBuddy</span>
        </div>
        <div className="flex justify-center gap-6 mb-8 text-sm text-gray-500">
          <a href="#" className="hover:text-black">이용약관</a>
          <a href="#" className="hover:text-black">개인정보처리방침</a>
          <a href="#" className="hover:text-black">문의하기</a>
        </div>
        <p className="text-xs text-gray-400 font-mono">
          © 2024 StudyBuddy Inc. All rights reserved. <br/>
          We quantify your effort, not just time.
        </p>
      </div>
    </footer>
  );
};