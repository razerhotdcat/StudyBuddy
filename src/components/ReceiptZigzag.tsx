import React from 'react';

interface ReceiptZigzagProps {
  /** 지그재그 배경/색상 (영수증 하단 배경과 동일하게) */
  color?: string;
  /** 높이는 고정(16px), 가로만 조정 가능하도록 남겨둠 */
  width?: string;
}

const ReceiptZigzag: React.FC<ReceiptZigzagProps> = ({
  color = '#FFFFFF',
  width = '100%',
}) => (
  <div
    style={{
      width,
      height: '16px',
      background: color,
      clipPath:
        'polygon(0 0, 4% 100%, 8% 0, 12% 100%, 16% 0, 20% 100%, 24% 0, 28% 100%, 32% 0, 36% 100%, 40% 0, 44% 100%, 48% 0, 52% 100%, 56% 0, 60% 100%, 64% 0, 68% 100%, 72% 0, 76% 100%, 80% 0, 84% 100%, 88% 0, 92% 100%, 96% 0, 100% 100%, 100% 0)',
    }}
  />
);

export default ReceiptZigzag;
