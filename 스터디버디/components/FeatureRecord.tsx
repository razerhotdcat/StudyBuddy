import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export const FeatureRecord: React.FC = () => {
  const [isClean, setIsClean] = useState(false);

  // Toggle animation automatically every few seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsClean(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { id: 1, text: "챕터 3까지 읽기", messyPos: { rotate: -6, x: -20, y: 10 }, color: "bg-yellow-100" },
    { id: 2, text: "수학 문제 풀다가 막힘", messyPos: { rotate: 12, x: 40, y: -30 }, color: "bg-blue-100" },
    { id: 3, text: "영어 단어 50개 암기", messyPos: { rotate: -15, x: -30, y: 50 }, color: "bg-pink-100" },
    { id: 4, text: "타이머 까먹음...", messyPos: { rotate: 8, x: 20, y: 80 }, color: "bg-green-100" },
  ];

  return (
    <section className="py-24 bg-gray-50 overflow-hidden" id="features">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
        
        {/* Left: Text */}
        <div className="w-full md:w-1/2">
          <div className="inline-flex items-center gap-2 text-brand-lime bg-brand-black px-3 py-1 rounded-full text-xs font-bold mb-6">
            <Sparkles size={14} />
            <span>SMART LOGGING</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            완벽하지 않아도 됩니다.<br/>
            <span className="text-brand-black decoration-brand-lime underline decoration-4 underline-offset-4">AI가 흐름을 정리합니다.</span>
          </h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            공부하다가 딴짓했나요? 순서가 뒤죽박죽인가요? <br/>
            상관없습니다. 대충 적어두면 StudyBuddy의 AI가 
            당신의 학습 맥락을 파악해 <strong>깔끔한 타임라인</strong>으로 변환해줍니다.
          </p>
          <div className="flex gap-4 items-center font-bold cursor-pointer group" onClick={() => setIsClean(!isClean)}>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isClean ? 'bg-brand-lime' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isClean ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
            <span className="text-sm text-gray-500 group-hover:text-black transition-colors">Before / After 보기</span>
          </div>
        </div>

        {/* Right: Interactive UI */}
        <div className="w-full md:w-1/2 h-[500px] relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
          
          <AnimatePresence mode='wait'>
            <div className="relative w-full max-w-xs h-80">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={false}
                  animate={isClean ? {
                    rotate: 0,
                    x: 0,
                    y: index * 70 - 100, // Stack vertically
                    scale: 1,
                  } : {
                    rotate: item.messyPos.rotate,
                    x: item.messyPos.x,
                    y: item.messyPos.y,
                    scale: 1.05,
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  className={`absolute left-0 right-0 mx-auto w-64 h-16 rounded-xl shadow-md border-2 border-brand-black flex items-center px-4 gap-3 ${isClean ? 'bg-white' : item.color} z-${10-index}`}
                >
                  <div className={`w-3 h-3 rounded-full border border-black ${isClean ? 'bg-brand-lime' : 'bg-transparent'}`}></div>
                  <span className={`font-mono text-sm font-bold ${isClean ? 'text-black' : 'text-gray-700'}`}>
                    {isClean ? `Task 0${item.id} : Completed` : item.text}
                  </span>
                  {isClean && <div className="ml-auto text-xs text-gray-400 font-mono">{(15 + index * 10)}m</div>}
                </motion.div>
              ))}

              {/* Connecting Line for Clean State */}
              <motion.div 
                className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 -z-10"
                animate={{ opacity: isClean ? 1 : 0 }}
              ></motion.div>
            </div>
          </AnimatePresence>

          {/* AI Processing Badge */}
          <motion.div 
            className="absolute bottom-6 bg-brand-black text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
            animate={{ scale: isClean ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles size={16} className="text-brand-lime" />
            <span className="text-xs font-bold">AI Processing</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};