import React from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeatureRecord } from './components/FeatureRecord';
import { FeatureReceipt } from './components/FeatureReceipt';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="antialiased text-slate-900 bg-white selection:bg-brand-lime selection:text-brand-black">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureRecord />
        <FeatureReceipt />
        
        {/* Call to Action Banner */}
        <section className="py-20 px-4 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-6">지금 바로 첫 영수증을 뽑아보세요.</h2>
            <p className="text-gray-600 mb-8">
              이메일만 입력하면 즉시 시작할 수 있습니다. <br/>
              복잡한 타이머 설정 없이, 당신의 공부를 증명하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input 
                type="email" 
                placeholder="이메일 주소 입력" 
                className="px-6 py-4 rounded-full border-2 border-gray-200 focus:border-brand-black focus:outline-none min-w-[280px]"
              />
              <button className="bg-brand-black text-brand-lime font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-lg">
                무료로 시작하기
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;