import React, { useState, useEffect } from 'react';

/** 전역 그리드 패턴 (opacity 0.05) + 마우스 따라다니는 네온 라임 글로우 */
export const GlobalBackground: React.FC = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />
      <div
        className="fixed pointer-events-none z-0 w-[400px] h-[400px] rounded-full transition-opacity duration-300"
        style={{
          left: pos.x - 200,
          top: pos.y - 200,
          background: 'radial-gradient(circle, rgba(204,255,0,0.08) 0%, transparent 70%)',
        }}
        aria-hidden
      />
    </>
  );
}
