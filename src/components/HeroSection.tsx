import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Receipt } from './Receipt';
import { ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 px-4 flex items-center overflow-hidden bg-white">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-lime/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10"></div>
      
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Text Content */}
        <motion.div 
          className="w-full md:w-1/2 space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-block bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            <span className="text-xs font-mono font-bold text-gray-600">BETA 2.0 LAUNCHED</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-brand-black">
            10시간 <br/>
            <span className="text-gray-400">앉아만 있었나요?</span> <br/>
            <span className="relative inline-block">
              <span className="relative z-10 text-brand-lime bg-brand-black px-2 mt-2 inline-block -rotate-1">무엇을 끝냈는지</span>
            </span>가 <br/>
            중요합니다.
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
            시간이 아닌 <strong>성과</strong>를 기록하세요. <br/>
            당신의 노력을 <strong>'지식 영수증'</strong>으로 발급해 드립니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="group">
              영수증 발급받기 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              데모 체험하기
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 pt-4">
            <div className="flex -space-x-2">
              {[
                { id: 1, bg: "bg-gray-200" },
                { id: 2, bg: "bg-gray-300" },
                { id: 3, bg: "bg-gray-400" },
                { id: 4, bg: "bg-gray-500" },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`w-8 h-8 rounded-full border-2 border-white ${item.bg} bg-cover`}
                  style={{ backgroundImage: `url('https://picsum.photos/32/32?random=${item.id}')` }}
                ></div>
              ))}
            </div>
            <p>이미 12,000+ 명의 학생들이 성과를 기록 중입니다.</p>
          </div>
        </motion.div>

        {/* Visual Content (Receipt Animation) */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
          <motion.div
             initial={{ rotate: 5, y: 100, opacity: 0 }}
             animate={{ rotate: -5, y: 0, opacity: 1 }}
             transition={{ 
               duration: 1, 
               ease: [0.16, 1, 0.3, 1],
               delay: 0.2 
             }}
             className="relative z-20 w-full max-w-sm"
          >
            <Receipt />
            
            {/* Floating Elements around receipt */}
            <motion.div 
              className="absolute -right-8 top-1/4 bg-brand-black text-white p-4 rounded-xl shadow-xl z-30 max-w-[150px]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: "spring" }}
            >
              <p className="text-xs font-mono mb-1 text-gray-400">STATUS</p>
              <p className="font-bold text-sm">Flow State <span className="text-brand-lime">ON</span></p>
            </motion.div>

            <motion.div 
              className="absolute -left-12 bottom-1/4 bg-white border-2 border-brand-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-30"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <p className="font-bold text-sm font-mono">REC</p>
              </div>
            </motion.div>

          </motion.div>

          {/* Decorative Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-gray-200 rounded-full -z-10 animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-dashed border-gray-300 rounded-full -z-10 animate-[spin_40s_linear_infinite_reverse]"></div>
        </div>
      </div>
    </section>
  );
};
