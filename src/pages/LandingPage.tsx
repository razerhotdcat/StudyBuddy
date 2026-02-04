import React from 'react';
import { motion } from 'framer-motion';
import { Receipt } from '../components/Receipt';
import type { StudyItem } from '../types';

// App.tsx에서 handleLogin 함수를 prop으로 내려준다고 가정합니다.
interface LandingPageProps {
  onStart: () => void;
}

const mockItems: StudyItem[] = [
  {
    subject: '알고리즘 정복',
    duration: 80, // 1h 20m
    keyInsight: '분할 정복 패턴이 보이기 시작했습니다.',
    flowLog: '그래프 + DP 섞인 문제들을 묶어서 정리함.',
    mode: 'target',
  },
  {
    subject: '리액트 워크샵 구조 리팩터링',
    duration: 45,
    flowLog: '라우팅과 워크샵 상태를 분리해서 더 깔끔해졌습니다.',
    mode: 'flow',
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black bg-noise">
      {/* 1. 네비게이션: 네온 라임 로고 + 텍스트 링크 */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="text-3xl font-black text-[#CCFF00] tracking-tighter cursor-pointer">
          StudyBuddy
        </div>
        <div className="flex gap-6 items-center">
          <button
            onClick={() => {
              console.log('Login clicked');
              onStart();
            }}
            className="text-gray-400 hover:text-white font-medium transition-colors"
          >
            로그인
          </button>
          <button
            onClick={() => {
              console.log('Signup clicked');
              onStart();
            }}
            className="px-5 py-2 border border-gray-700 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-all"
          >
            회원가입
          </button>
        </div>
      </nav>

      {/* 2. 메인 히어로: 좌측 카피 + 우측 대형 영수증 */}
      <main className="flex-1 flex flex-col items-stretch px-4 pt-4 md:pt-8 pb-8">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12">
            {/* 좌측: 카피 + CTA (항상 왼쪽 정렬) */}
            <div className="w-full md:w-1/2 text-left space-y-8">
              <h1 className="text-5xl md:text-8xl font-extrabold mb-4 leading-tight tracking-tight">
                완벽하지 않아도 됩니다.
                <br />
                <span className="text-[#CCFF00]">몰입을 인쇄할 뿐.</span>
              </h1>

              {/* 서브 문구: 최종 확정 문구 */}
              <p className="text-[#9CA3AF] text-lg md:text-2xl max-w-3xl leading-relaxed">
                당신의 목표와 여정, 그리고 흐름의 기록을 영수증으로 뽑아보세요.
              </p>

              {/* 거대한 메인 버튼 */}
              <button
                onClick={() => {
                  console.log('무료로 시작하기 클릭됨!');
                  onStart();
                }}
                className="mt-4 px-12 py-6 bg-[#CCFF00] text-black text-2xl font-black rounded-2xl transition-all transform shadow-[0_6px_24px_rgba(204,255,0,0.18)] hover:scale-110 hover:shadow-[0_16px_60px_rgba(204,255,0,0.45)]"
              >
                무료로 시작하기
              </button>
            </div>

            {/* 우측: 워크샵과 동일한 톤의 대형 영수증 프리뷰 (실시간 인쇄 애니메이션) */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end px-4 md:px-8">
              <motion.div
                initial={{ y: -160, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-full md:max-w-md mt-4 md:mt-8 md:scale-95 origin-top-right"
              >
                {/* 상단 레이블: 오늘의 여정 안내 */}
                <div className="absolute -top-10 left-4 right-4 mx-auto flex items-center justify-between text-[11px] font-mono text-gray-300 uppercase tracking-widest z-20">
                  <span className="text-[#CCFF00] font-bold">
                    사용자님, 오늘의 여정을 기록합니다
                  </span>
                  <span className="text-gray-500">DAILY FLOW RECEIPT</span>
                </div>

                {/* 어두운 배경 위에 떠 있는 화이트 영수증 (페이지 로드시 한 번만 인쇄 애니메이션) */}
                <div className="relative mt-4 md:mt-6 overflow-hidden">
                  <motion.div
                    className="inline-block"
                    initial={{ y: '-100%' }}
                    animate={{ y: '0%' }}
                    transition={{
                      duration: 2.4,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <Receipt
                      items={mockItems}
                      date="2026.02.04"
                      userDisplayName="사용자"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 3. 기능 소개 Bento Grid 섹션 */}
        <section className="relative z-10 py-16">
          <div className="max-w-7xl mx-auto px-4 space-y-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-white text-left">
              StudyBuddy가 만드는 당신의 학습 흐름
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {/* 카드 1: AI 점주의 인사이트 */}
              <div className="relative overflow-hidden rounded-2xl bg-[#111111] border border-[#333333] p-6 transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(204,255,0,0.35)]">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F2933] mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                  <span className="text-xs font-mono uppercase text-[#9CA3AF]">
                    AI 점주
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">
                  AI 점주의 인사이트
                </h3>
                <p className="text-sm text-[#9CA3AF] mb-4">
                  오늘 쌓인 기록을 바탕으로, 당신의 학습 패턴을 한 줄로 요약해 드립니다.
                </p>
                <div className="relative mt-4">
                  <div className="inline-block max-w-xs rounded-2xl bg-[#0f172a] border border-[#1f2937] px-4 py-3 shadow-[0_10px_25px_rgba(15,23,42,0.8)]">
                    <p className="text-[13px] font-mono text-[#E5E7EB] leading-relaxed">
                      <span className="text-[#9CA3AF] text-[11px] block mb-1">
                        오늘의 핵심 패턴
                      </span>
                      “<span className="text-[#CCFF00]">짧게 자주</span> 반복해서 푼 문제가 유독 많아요.
                      이 리듬을 내일도 그대로 가져가 봅시다.”
                    </p>
                  </div>
                  <div className="absolute -bottom-1 left-10 w-4 h-4 bg-[#0f172a] border-l border-b border-[#1f2937] rotate-45" />
                </div>
              </div>

              {/* 카드 2: 나만의 영수증 아카이브 */}
              <div className="relative overflow-hidden rounded-2xl bg-[#111111] border border-[#333333] p-6 transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(204,255,0,0.35)]">
                <h3 className="text-lg font-semibold mb-3 text-white">
                  나만의 영수증 아카이브
                </h3>
                <p className="text-sm text-[#9CA3AF] mb-4">
                  매일 쌓여가는 학습 영수증이 당신만의 기록 보관소가 됩니다.
                  과거의 나와 오늘의 나를 비교해보세요.
                </p>
                <div className="relative mt-4 h-32">
                  <div className="absolute inset-x-4 top-2 h-20 bg-white/5 rounded-xl border border-[#333] rotate-[-4deg]" />
                  <div className="absolute inset-x-2 top-6 h-20 bg-white/10 rounded-xl border border-[#4b5563] rotate-[2deg]" />
                  <div className="absolute inset-x-0 top-10 h-20 bg-white rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.4)] flex items-center px-4 gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center text-xs font-mono text-[#CCFF00] -rotate-6">
                      SB
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-black">
                        알고리즘 주간 리포트
                      </span>
                      <span className="text-[11px] text-gray-500">
                        총 7시간 · 3일 연속
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 카드 3: 실시간 몰입 스퀘어 */}
              <div className="relative overflow-hidden rounded-2xl bg-[#111111] border border-[#333333] p-6 transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(204,255,0,0.35)]">
                <h3 className="text-lg font-semibold mb-3 text-white">
                  실시간 몰입 스퀘어
                </h3>
                <p className="text-sm text-[#9CA3AF] mb-4">
                  지금 이 순간, 다른 사용자들이 어디에서 무엇에 몰입하고 있는지
                  천천히 흘러가는 피드로 보여줍니다.
                </p>
                <div className="relative h-28 overflow-hidden rounded-xl bg-[#020617] border border-[#1f2937]">
                  <motion.div
                    className="absolute inset-x-4 flex flex-col gap-2 py-3"
                    initial={{ y: 0 }}
                    animate={{ y: ['0%', '-50%'] }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    {[
                      'CS 개념 복습',
                      '토익 LC 2세트',
                      '코딩 테스트 준비',
                      '영어 회화 스터디',
                      '논문 읽기 30분',
                      '프로젝트 리팩토링',
                    ].map((label, idx) => (
                      <div
                        key={idx}
                        className="w-full h-14 rounded-lg bg-white/5 border border-[#4b5563] flex items-center px-3 gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-mono text-[#E5E7EB]">
                            LIVE · @{`user${idx + 1}`}
                          </span>
                          <span className="text-xs text-white truncate">
                            {label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;

