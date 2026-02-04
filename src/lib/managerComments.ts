/**
 * AI 매니저(점주) 짧은 코멘트 - 기록 보조용.
 * 현재는 랜덤 문자열 반환. 추후 getGeminiManagerComment(context, payload) 등으로 교체 가능.
 */

export type ManagerCommentContext = 'workshop_reaction' | 'collection_index';

const WORKSHOP_REACTIONS: string[] = [
  '기록을 안전하게 받아 적고 있습니다.',
  '중요한 인사이트군요.',
  '잘 받아 적었어요.',
  '한 줄 한 줄 쌓여 가고 있어요.',
  '기록이 쌓일수록 보물이 됩니다.',
  '받아 적는 중입니다.',
  '메모 잘 남기고 있어요.',
];

const COLLECTION_INDEX_PHRASES: string[] = [
  '이 기록은 튼튼하게 보관되었습니다.',
  'Manager\'s Index: 정리 완료.',
  '보관 상태 양호.',
  '이 영수증은 안전하게 보관 중입니다.',
  '분류·보관 완료.',
];

/**
 * 현재는 랜덤 스트링 반환.
 * 추후: export async function getManagerComment(ctx, payload) { return await getGeminiManagerComment(ctx, payload) ?? getRandomManagerComment(ctx); }
 */
export function getRandomManagerComment(context: ManagerCommentContext): string {
  const list = context === 'workshop_reaction' ? WORKSHOP_REACTIONS : COLLECTION_INDEX_PHRASES;
  return list[Math.floor(Math.random() * list.length)];
}
