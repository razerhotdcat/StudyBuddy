import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt } from './Receipt';
import { Button } from './ui/Button';
import { Printer, Share2 } from 'lucide-react';
import type { StudyItem } from '../types';

interface FeatureReceiptProps {
  items: StudyItem[];
  onAddItem: (item: StudyItem) => void;
}

export const FeatureReceipt: React.FC<FeatureReceiptProps> = ({ items, onAddItem }) => {
  const [subjectInput, setSubjectInput] = useState('');
  const [durationInput, setDurationInput] = useState('');

  const handleAddClick = () => {
    const subject = subjectInput.trim();
    const minutes = Number(durationInput);

    if (!subject) {
      window.alert('과목명을 입력해주세요.');
      return;
    }

    if (!Number.isFinite(minutes) || minutes <= 0) {
      window.alert('공부 시간(분)을 올바르게 입력해주세요.');
      return;
    }

    onAddItem({ subject, duration: minutes });
    setSubjectInput('');
    setDurationInput('');
  };

  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

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
                  <span>{">"} Analyzing session...</span>
                    <span>Done</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                  <span>{">"} Calculating focus...</span>
                    <span>92%</span>
                  </div>
                  <div className="flex justify-between text-white">
                  <span>{">"} Generating Receipt...</span>
                    <span className="animate-pulse">_</span>
                  </div>
                </div>

                {/* Input Form */}
                <div className="space-y-3 mb-6">
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      placeholder="과목명 / 작업 내용을 입력하세요"
                      className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime/70"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={durationInput}
                        onChange={(e) => setDurationInput(e.target.value)}
                        placeholder="시간(분)"
                        className="w-28 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime/70"
                      />
                      <Button
                        type="button"
                        className="flex-1 bg-brand-lime text-black hover:bg-white transition-colors h-10 text-sm font-bold"
                        onClick={handleAddClick}
                      >
                        추가
                      </Button>
                    </div>
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
                  items={items}
                  date={formattedDate}
                />
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};