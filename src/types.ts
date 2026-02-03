export interface ReceiptItem {
  id: string;
  task: string;
  category: string;
  status: 'completed' | 'in-progress';
}

export interface NavItem {
  label: string;
  href: string;
}

// 공부 영수증(Receipt)에서 사용할 기본 공부 항목 타입
export interface StudyItem {
  // 과목명
  subject: string;
  // 공부 시간 (분 단위)
  duration: number;
}