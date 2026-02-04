import React from 'react';

/** 거친 지그재그 절취선 - 모든 탭/모달/카드 하단 통일 */
export const ZigzagEdge: React.FC<{ className?: string; fill?: string; height?: number }> = ({
  className = '',
  fill = '#FFFFFF',
  height = 14,
}) => (
  <div className={`w-full overflow-hidden leading-none ${className}`} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
    <svg className="block w-[calc(100%+2px)]" viewBox="0 0 1200 14" preserveAspectRatio="none" style={{ height: `${height}px` }}>
      <path
        fill={fill}
        d="M0,0 L0,14 L25,4 L50,14 L75,3 L100,14 L125,5 L150,14 L175,2 L200,14 L225,6 L250,14 L275,4 L300,14 L325,3 L350,14 L375,5 L400,14 L425,2 L450,14 L475,6 L500,14 L525,4 L550,14 L575,3 L600,14 L625,5 L650,14 L675,4 L700,14 L725,2 L750,14 L775,6 L800,14 L825,3 L850,14 L875,5 L900,14 L925,4 L950,14 L975,3 L1000,14 L1025,5 L1050,14 L1075,4 L1100,14 L1125,2 L1150,14 L1175,6 L1200,14 L1200,0 Z"
      />
    </svg>
  </div>
);
