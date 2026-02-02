import React from 'react';
import { motion } from 'framer-motion';
import { Receipt } from './Receipt';
import { Button } from './ui/Button';
import { Printer, Share2 } from 'lucide-react';

export const FeatureReceipt: React.FC = () => {
  return (
    <section className="py-24 bg-brand-black text-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            오늘의 공부 <span className="text-brand-lime">정산</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
            하루가 끝나면 버튼 하나만 누르세요. <br/>
            오늘의 치열했던 노력을 힙한 <strong>영수증 이미지</strong>로 발급해 드립니다.
            <br/>인스타그램 스토리에 공유하기 딱 좋은 사이즈죠.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12">
          
          {/* Action Area */}
          <div className="flex flex-col gap-6 order-2 md:order-1">
             <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 font-mono text-sm">TODAY_SUMMARY.LOG</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="space-y-3 font-mono text-sm mb-6">
                  <div className="flex justify-between text-gray-500">
                    <span>> Analyzing session...</span>
                    <span>Done</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>> Calculating focus...</span>
                    <span>92%</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>> Generating Receipt...</span>
                    <span className="animate-pulse">_</span>
                  </div>
                </div>
                <Button className="w-full bg-brand-lime text-black hover:bg-white transition-colors h-14 text-lg">
                  <Printer className="mr-2" /> 영수증 출력하기
                </Button>
             </div>

             <div className="flex justify-center gap-4">
                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
                  <Share2 size={16} /> Instagram 공유
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
                  이미지 저장
                </button>
             </div>
          </div>

          {/* Receipt Visual */}
          <div className="order-1 md:order-2 relative group">
             {/* Glow effect behind receipt */}
             <div className="absolute inset-0 bg-brand-lime blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
             
             <motion.div
               whileHover={{ y: -10, rotate: 2 }}
               className="relative"
             >
                <Receipt 
                  items={[
                    { task: "UX 리서치 분석", time: "2h 10m" },
                    { task: "프로토타입 스케치", time: "1h 45m" },
                    { task: "팀 미팅", time: "50m" },
                    { task: "개발 문서 정리", time: "40m" }
                  ]}
                  totalTime="5h 25m"
                  date="2024.10.24"
                />
             </motion.div>

             {/* Tear line decoration */}
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-gray-600 font-mono text-xs tracking-[0.5em] opacity-50 rotate-90 origin-left">
                CUT_HERE
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};