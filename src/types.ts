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

// 타임스탬프 기반 생각 노트
export interface ThoughtNote {
  timestamp: string; // 'HH:MM' 형식
  text: string;
}

// 활동/세션 기록 타입 (범용적으로 확장)
export interface StudyItem {
  // 활동명 (구 과목명)
  subject: string;
  // 시간 (분 단위)
  duration: number;
  // 핵심 인사이트 (선택)
  keyInsight?: string;
  // 오늘의 한마디 (선택)
  dailyNote?: string;
  // 몰입 로그 (선택)
  flowLog?: string;
  // 모드: 자유 기록(Flow) 또는 목표 설정(Target)
  mode?: 'flow' | 'target';
  // 타임스탬프 기반 생각 노트 리스트
  thoughtNotes?: ThoughtNote[];
}