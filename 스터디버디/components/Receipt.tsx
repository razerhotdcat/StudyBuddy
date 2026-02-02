import React from 'react';
import { motion } from 'framer-motion';

interface ReceiptProps {
  items?: { task: string; time: string }[];
  totalTime?: string;
  className?: string;
  date?: string;
}

export const Receipt: React.FC<ReceiptProps> = ({ 
  items = [
    { task: "React Hook 학습", time: "45m" },
    { task: "UI 컴포넌트 설계", time: "1h 20m" },
    { task: "Typescript 에러 수정", time: "30m" },
  ],
  totalTime = "2h 35m",
  date = "2024.05.21",
  className = ""
}) => {
  return (
    <motion.div 
      className={`relative bg-white text-brand-black font-mono shadow-2xl w-full max-w-sm mx-auto ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="absolute -top-2 left-0 w-full h-4 bg-gray-100 rounded-t-lg -z-10"></div>

      <div className="p-6 pb-12 relative z-10 bg-white">
        <div className="flex flex-col items-center mb-6 space-y-2">
          <div className="w-12 h-12 bg-brand-black rounded-full flex items-center justify-center text-brand-lime font-bold text-xl mb-2">
            SB
          </div>
          <h2 className="text-xl font-bold tracking-widest uppercase">Study Buddy</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Official Knowledge Receipt</p>
          <div className="text-xs text-gray-400 mt-1">{date}</div>
        </div>

        <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-2">
            <span>Item / Process</span>
            <span>Duration</span>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm items-start">
              <span className="font-medium max-w-[70%] break-words leading-tight">{item.task}</span>
              <span className="font-bold">{item.time}</span>
            </div>
          ))}
        </div>

        <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

        <div className="flex justify-between items-end mb-8">
          <span className="text-lg font-bold uppercase">Total Input</span>
          <span className="text-2xl font-bold">{totalTime}</span>
        </div>

        <div className="flex flex-col items-center space-y-2 opacity-60">
          <p className="text-[10px] text-center uppercase">Thank you for your effort</p>
          <div className="h-10 w-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/UPC-A-036000291452.svg/1200px-UPC-A-036000291452.svg.png')] bg-cover bg-center grayscale opacity-80 mix-blend-multiply"></div>
          <p className="text-[10px] tracking-[0.3em]">0012-9938-1212</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 translate-y-[98%]">
        <svg
          className="relative block w-full h-[12px] text-white fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,120 L40,0 L80,120 L120,0 L160,120 L200,0 L240,120 L280,0 L320,120 L360,0 L400,120 L440,0 L480,120 L520,0 L560,120 L600,0 L640,120 L680,0 L720,120 L760,0 L800,120 L840,0 L880,120 L920,0 L960,120 L1000,0 L1040,120 L1080,0 L1120,120 L1160,0 L1200,120 V120 H0 Z"></path>
        </svg>
      </div>
    </motion.div>
  );
};