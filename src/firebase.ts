import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  increment as firestoreIncrement,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  type User,
} from 'firebase/auth';

// Vite 환경변수 기반 Firebase 설정
// 실제 값은 프로젝트 루트의 .env 파일 등에 아래 키들로 설정해주세요.
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_STORAGE_BUCKET=...
// VITE_FIREBASE_MESSAGING_SENDER_ID=...
// VITE_FIREBASE_APP_ID=...
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 환경 변수 유효성 체크 (비어 있으면 콘솔에 에러 출력)
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value) {
    console.error(
      `[Firebase] 환경 변수 누락: ${key}. VITE_FIREBASE_* 값을 .env 에서 확인해주세요.`,
    );
  }
});

// 앱이 이미 초기화돼 있다면 재사용 (Vite HMR 대응)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore / Storage 인스턴스 export
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth 인스턴스 및 Provider export
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 브라우저 로컬 스토리지 기반으로 인증 유지
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('[Auth] Persistence set to browserLocalPersistence');
  })
  .catch((error) => {
    console.error('[Auth] Persistence 설정 중 오류 발생', error);
  });

// Google 로그인 함수
export async function signInWithGoogle(): Promise<User> {
  console.log('[Auth] Google 로그인 시도');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('[Auth] Google 로그인 성공', {
      uid: result.user.uid,
      email: result.user.email,
    });
    return result.user;
  } catch (error) {
    console.error('[Auth] Google 로그인 중 오류 발생', error);
    throw error;
  }
}

// 로그아웃 함수
export async function signOutUser() {
  console.log('[Auth] 로그아웃 시도');
  try {
    await signOut(auth);
    console.log('[Auth] 로그아웃 성공');
  } catch (error) {
    console.error('[Auth] 로그아웃 중 오류 발생', error);
    throw error;
  }
}

export interface ThoughtNote {
  timestamp: string;
  text: string;
}

export interface StudySessionPayload {
  subject: string;
  minutes: number;
  keyInsight?: string;
  dailyNote?: string;
  flowLog?: string;
  mode?: 'flow' | 'target';
  thoughtNotes?: ThoughtNote[];
  createdAt?: Date;
  category?: string;
  categoryEmoji?: string;
  categoryName?: string;
  categoryColor?: string;
  elapsedFormatted?: string;
}

/**
 * 로그인한 유저의 UID 기준으로 활동/세션을 저장하는 유틸 함수
 * users/{uid}/studySessions 콜렉션에 문서를 추가합니다.
 */
export async function saveStudySession(
  uid: string,
  payload: StudySessionPayload,
) {
  if (!uid) {
    throw new Error('유저 UID가 필요합니다.');
  }

  const { subject, minutes, keyInsight, dailyNote, flowLog, mode, thoughtNotes, createdAt, category, categoryEmoji, categoryName, categoryColor, elapsedFormatted } = payload;

  if (!subject.trim()) {
    throw new Error('활동명을 입력해주세요.');
  }

  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error('시간(분)은 0보다 큰 숫자여야 합니다.');
  }

  const sessionsCol = collection(db, 'users', uid, 'studySessions');

  const sessionData: any = {
    subject,
    minutes,
    createdAt: createdAt ?? serverTimestamp(),
  };

  // 선택 필드들은 값이 있을 때만 추가
  if (keyInsight?.trim()) sessionData.keyInsight = keyInsight.trim();
  if (dailyNote?.trim()) sessionData.dailyNote = dailyNote.trim();
  if (flowLog?.trim()) sessionData.flowLog = flowLog.trim();
  if (mode) sessionData.mode = mode;
  if (thoughtNotes && thoughtNotes.length > 0) sessionData.thoughtNotes = thoughtNotes;
  if (category) sessionData.category = category;
  if (categoryEmoji) sessionData.categoryEmoji = categoryEmoji;
  if (categoryName) sessionData.categoryName = categoryName;
  if (categoryColor) sessionData.categoryColor = categoryColor;
  if (elapsedFormatted) sessionData.elapsedFormatted = elapsedFormatted;

  await addDoc(sessionsCol, sessionData);
}

/** Firestore에서 읽어온 세션 한 건 (createdAt은 Timestamp) */
export interface StudySessionDoc {
  id: string;
  subject: string;
  minutes: number;
  keyInsight?: string;
  dailyNote?: string;
  flowLog?: string;
  mode?: 'flow' | 'target';
  thoughtNotes?: ThoughtNote[];
  createdAt: Timestamp | null;
  category?: string;
  categoryEmoji?: string;
  categoryName?: string;
  categoryColor?: string;
  elapsedFormatted?: string;
}

/** 영수증 한 장에 담긴 세션 항목 (receipts 컬렉션 내 sessions 배열) */
export interface ReceiptSessionItem {
  subject: string;
  duration: number;
  keyInsight?: string;
  category?: string;
  categoryEmoji?: string;
  categoryName?: string;
  categoryColor?: string;
  elapsedFormatted?: string;
}

/** 카테고리별 통계 */
export interface CategoryStatItem {
  categoryId: string;
  categoryName?: string;
  categoryEmoji?: string;
  count: number;
  totalMinutes: number;
  formatted: string;
}

/** 영수증 문서 (users/{uid}/receipts) */
export interface ReceiptDoc {
  id: string;
  sessions: ReceiptSessionItem[];
  totalFormatted: string;
  categoryStats: CategoryStatItem[];
  createdAt: Timestamp | null;
}

/**
 * 사용자의 studySessions 서브컬렉션을 날짜 역순으로 조회
 */
export async function fetchStudySessions(uid: string): Promise<StudySessionDoc[]> {
  if (!uid) return [];
  const sessionsCol = collection(db, 'users', uid, 'studySessions');
  const q = query(sessionsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      subject: data.subject ?? '',
      minutes: data.minutes ?? 0,
      keyInsight: data.keyInsight,
      dailyNote: data.dailyNote,
      flowLog: data.flowLog,
      mode: data.mode,
      thoughtNotes: data.thoughtNotes,
      createdAt: data.createdAt ?? null,
      category: data.category,
      categoryEmoji: data.categoryEmoji,
      categoryName: data.categoryName,
      categoryColor: data.categoryColor,
      elapsedFormatted: data.elapsedFormatted,
    } as StudySessionDoc;
  });
}

/**
 * 영수증 한 장 저장 (users/{uid}/receipts)
 * sessions: elapsedFormatted 포함한 세션 배열, totalFormatted, categoryStats
 */
export async function saveReceipt(
  uid: string,
  payload: {
    sessions: ReceiptSessionItem[];
    totalFormatted: string;
    categoryStats: CategoryStatItem[];
  },
) {
  if (!uid) throw new Error('유저 UID가 필요합니다.');
  const receiptsCol = collection(db, 'users', uid, 'receipts');
  await addDoc(receiptsCol, {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

/**
 * 사용자 영수증 목록 조회 (날짜 역순)
 */
export async function fetchReceipts(uid: string): Promise<ReceiptDoc[]> {
  if (!uid) return [];
  const receiptsCol = collection(db, 'users', uid, 'receipts');
  const q = query(receiptsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      sessions: data.sessions ?? [],
      totalFormatted: data.totalFormatted ?? '',
      categoryStats: data.categoryStats ?? [],
      createdAt: data.createdAt ?? null,
    } as ReceiptDoc;
  });
}

/** Firestore users/{uid} 프로필 문서 */
export interface UserProfileDoc {
  nickname?: string;
  photoURL?: string;
  jobGoal?: string;
  updatedAt?: ReturnType<typeof serverTimestamp>;
  /** 도전과제 ID 배열 */
  achievements?: string[];
  /** 현재 레벨 (1부터) */
  level?: number;
  /** 누적 경험치 */
  exp?: number;
  /** 가입일 (Timestamp) */
  joinDate?: ReturnType<typeof serverTimestamp>;
}

const EXP_PER_RECEIPT = 10;
const EXP_PER_LEVEL = 50;

function expToLevel(exp: number): number {
  if (exp <= 0) return 1;
  return Math.floor(exp / EXP_PER_LEVEL) + 1;
}

/**
 * 사용자 프로필 조회 (users/{uid})
 */
export async function getUserProfile(uid: string): Promise<UserProfileDoc | null> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data() as UserProfileDoc;
}

/**
 * 사용자 프로필 업데이트 (users/{uid}). 기존 필드와 머지.
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<{ nickname: string; photoURL: string; jobGoal: string }>,
) {
  const userRef = doc(db, 'users', uid);
  const existing = (await getDoc(userRef)).data() || {};
  await setDoc(userRef, {
    ...existing,
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * 영수증 발행 시 경험치 추가 및 레벨업 여부 반환.
 * users/{uid}에 exp 증가, 필요 시 level·joinDate 초기화.
 */
export async function addExpOnReceipt(uid: string): Promise<{ leveledUp: boolean; newLevel: number }> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  const data = snap.exists() ? snap.data() : {};
  const currentExp = typeof data.exp === 'number' ? data.exp : 0;
  const currentLevel = typeof data.level === 'number' ? data.level : expToLevel(currentExp);
  const newExp = currentExp + EXP_PER_RECEIPT;
  const newLevel = expToLevel(newExp);
  const leveledUp = newLevel > currentLevel;

  await setDoc(userRef, {
    ...data,
    exp: newExp,
    level: newLevel,
    ...(snap.exists() ? {} : { joinDate: serverTimestamp() }),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return { leveledUp, newLevel };
}

/**
 * studySessions 서브컬렉션에서 문서 한 건 삭제 (복구 불가)
 */
export async function deleteStudySession(uid: string, sessionId: string): Promise<void> {
  if (!uid || !sessionId) throw new Error('uid와 sessionId가 필요합니다.');
  const sessionRef = doc(db, 'users', uid, 'studySessions', sessionId);
  await deleteDoc(sessionRef);
}

/**
 * 프로필 이미지를 Storage에 업로드하고 다운로드 URL 반환
 * 경로: users/{uid}/avatar/{timestamp}_filename
 */
export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `users/${uid}/avatar/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

const isSameDay = (ts: Timestamp | null, date: Date): boolean => {
  if (!ts) return false;
  const d = ts.toDate();
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
};

/** 오늘(로컬 날짜) 발행된 세션만 반환 */
export async function fetchTodaySessions(uid: string): Promise<StudySessionDoc[]> {
  const all = await fetchStudySessions(uid);
  const today = new Date();
  return all.filter((s) => isSameDay(s.createdAt, today));
}

/** 최근 7일 일별 집중 시간(분) 배열 [오늘, 어제, ...] */
export async function fetchWeekMinutes(uid: string): Promise<number[]> {
  const all = await fetchStudySessions(uid);
  const days: number[] = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  for (const s of all) {
    if (!s.createdAt) continue;
    const d = s.createdAt.toDate();
    const diff = (today.getTime() - d.getTime()) / (24 * 60 * 60 * 1000);
    const index = Math.floor(diff);
    if (index >= 0 && index < 7) days[index] += s.minutes;
  }
  return days;
}

/** 광장 피드 한 건 (익명, 성만 노출 예: 이**) */
export interface SquareFeedItem {
  id: string;
  subject: string;
  minutes: number;
  authorLabel?: string;
  reactions: number;
  createdAt: Timestamp | null;
}

const squareFeedCol = () => collection(db, 'squareFeed');

/** 이름을 성만 노출 (홍길동 → 홍**) */
export function maskDisplayName(name: string | null | undefined): string {
  if (!name || !name.trim()) return '익명';
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed + '**';
  return trimmed.charAt(0) + '**';
}

/** 광장에 발행 (익명, authorLabel 예: 이**) */
export async function addToSquareFeed(payload: {
  subject: string;
  minutes: number;
  authorLabel?: string;
}): Promise<void> {
  await addDoc(squareFeedCol(), {
    subject: payload.subject,
    minutes: payload.minutes,
    authorLabel: payload.authorLabel ?? '익명',
    reactions: 0,
    createdAt: serverTimestamp(),
  });
}

/** 광장 카드 응원(불꽃) 수 증가 */
export async function incrementSquareReaction(feedId: string): Promise<void> {
  const ref = doc(db, 'squareFeed', feedId);
  await updateDoc(ref, { reactions: firestoreIncrement(1) });
}

/** 광장 피드 최신순 조회 (인덱스 없이 메모리 정렬) */
export async function fetchSquareFeed(limitCount = 50): Promise<SquareFeedItem[]> {
  const snapshot = await getDocs(squareFeedCol());
  const list = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      subject: data.subject ?? '',
      minutes: data.minutes ?? 0,
      authorLabel: data.authorLabel ?? '익명',
      reactions: typeof data.reactions === 'number' ? data.reactions : 0,
      createdAt: data.createdAt ?? null,
    } as SquareFeedItem;
  });
  list.sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return b.createdAt.toMillis() - a.createdAt.toMillis();
  });
  return list.slice(0, limitCount);
}

