import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface ProfileContext {
  nickname?: string;
  jobGoal?: string;
}

/** Thought Log 한 건 (타임스탬프 + 텍스트) */
export interface ThoughtLogItem {
  timestamp: string;
  text: string;
}

/** 정산 시 AI 응답 */
export interface AISettlementResult {
  growthSummary: string;
  managerNote: string;
}

const SYSTEM_PERSONA = (profile?: ProfileContext) => {
  const who = profile?.jobGoal
    ? `이 사용자는 "${profile.jobGoal}"을/를 목표로 하고 있어.`
    : '';
  const name = profile?.nickname ? `닉네임은 ${profile.nickname}.` : '';
  return `너는 'Study Buddy' 앱의 AI 점주이자 학습 Curator야. 사용자의 Thought Log(메모)와 세션 흐름을 보고,
1) 오늘의 학습 흐름을 한 줄로 큐레이션해 주고,
2) 다음 세션에서 어디에 집중하면 좋을지 '다음 목표'를 아주 구체적으로 제안해.
말투는 친근하고 힙하지만, 조언은 구체적이고 실행 가능해야 해. 이모티콘은 최소로. ${who} ${name}`.trim();
};

/**
 * 발행(정산) 시: 모든 Thought Log를 분석해 [오늘의 성장 요약 한 줄] + [AI 점주의 한마디] 생성
 */
export async function getAISettlement(
  thoughtLogs: ThoughtLogItem[],
  profile?: ProfileContext
): Promise<AISettlementResult> {
  if (!genAI) {
    return {
      growthSummary: '오늘도 한 걸음 성장하셨습니다.',
      managerNote: 'AI 점주가 곧 찾아올 거예요. (API 키를 설정하면 맞춤 멘트를 받을 수 있어요)',
    };
  }

  const textLogs =
    thoughtLogs.length > 0
      ? thoughtLogs.map((t) => `[${t.timestamp}] ${t.text}`).join('\n')
      : '(메모 없음)';

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PERSONA(profile),
  });

  const prompt = `아래는 사용자가 세션 중에 적은 Thought Log(메모)야. 이걸 분석해서 JSON만 답해줘. 다른 말 없이 JSON 객체 하나만.

\`\`\`json
{
  "growthSummary": "오늘의 학습 흐름을 한 줄로 큐레이션한 문장 (20자 내외)",
  "managerNote": "다음 세션에서 어디에 집중하면 좋을지 제안하는 Curator 한마디 (격려 + 구체 제안, 30자 내외)"
}
\`\`\`

주의:
- growthSummary에는 오늘의 학습 맥락/패턴을 요약해서 적어.
- managerNote에는 '다음 목표'나 '다음 한 스텝'을 꼭 포함해.

Thought Log:
${textLogs}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const raw = response.text()?.trim() || '';

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as AISettlementResult;
      return {
        growthSummary: String(parsed.growthSummary || '').slice(0, 80) || '오늘도 한 걸음.',
        managerNote: String(parsed.managerNote || '').slice(0, 100) || '수고했어요!',
      };
    }
  } catch (e) {
    console.error('[AI] Settlement failed', e);
  }

  return {
    growthSummary: '오늘도 한 걸음 성장하셨습니다.',
    managerNote: '내일도 영수증 찍어오세요!',
  };
}

/**
 * 실시간: 타이머/메모 시점에 맞춰 격려·팩폭 한 줄 생성 (라이브 코멘트)
 */
export async function getAILiveComment(
  context: {
    timerMinutes: number;
    lastThought?: string;
    thoughtCount: number;
    subject?: string;
  },
  profile?: ProfileContext
): Promise<string> {
  if (!genAI) {
    const fallbacks = [
      '오... 이 개념까지 정리하시다니!',
      '영수증이 길어지고 있어요. 좀 더 힘내세요!',
      '메모가 쌓일수록 나중에 보물이 됩니다.',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PERSONA(profile),
  });

  const { timerMinutes, lastThought, thoughtCount, subject } = context;
  const prompt = `상황: 사용자가 ${subject || '활동'} 중이고, 타이머 ${timerMinutes}분째야. 지금까지 메모 ${thoughtCount}개 적음.${lastThought ? ` 방금 메모: "${lastThought}"` : ''}
위 상황에 맞는 격려나 팩폭 한 문장만 짧게 (20자 내외) 답해줘. 따옴표 없이 문장만.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim().replace(/^["']|["']$/g, '') || '';
    return text.slice(0, 60) || '좀 더 쌓아보세요!';
  } catch (e) {
    console.error('[AI] Live comment failed', e);
  }

  const fallbacks = [
    '오... 이 개념까지 정리하시다니!',
    '영수증이 길어지고 있어요. 좀 더 힘내세요!',
    '메모가 쌓일수록 나중에 보물이 됩니다.',
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
