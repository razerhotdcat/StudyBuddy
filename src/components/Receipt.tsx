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
      {/* Receipt Top Edge (Paper roll effect) */}
      <div className="absolute -top-2 left-0 w-full h-4 bg-gray-100 rounded-t-lg -z-10"></div>

      {/* Content */}
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
          {/* Mock Barcode */}
          <div className="h-10 w-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/UPC-A-036000291452.svg/1200px-UPC-A-036000291452.svg.png')] bg-cover bg-center grayscale opacity-80 mix-blend-multiply"></div>
          <p className="text-[10px] tracking-[0.3em]">0012-9938-1212</p>
        </div>
      </div>

      {/* Jagged Bottom Edge */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 translate-y-[99%]">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[12px] text-white fill-current"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0V46.29c47,24.22,103.79,16.59,150,0a169.59,169.59,0,0,1,88.75-5.61c40.35,5.13,76.5,23.11,111.25,41.48,51.89,27.35,110.22,34.82,165.25,7.77,53.28-26.12,102.3-33.88,154.5-5.18,48.24,26.54,101.44,30.34,150,5.18V0Z"></path>
          {/* Simple jagged workaround using repeat css would be lighter, but SVG is smoother */}
          <path d="M1200,0H0V120L30,60L60,120L90,60L120,120L150,60L180,120L210,60L240,120L270,60L300,120L330,60L360,120L390,60L420,120L450,60L480,120L510,60L540,120L570,60L600,120L630,60L660,120L690,60L720,120L750,60L780,120L810,60L840,120L870,60L900,120L930,60L960,120L990,60L1020,120L1050,60L1080,120L1110,60L1140,120L1170,60L1200,120V0Z"></path>
        </svg>
      </div>
    </motion.div>
  );
};