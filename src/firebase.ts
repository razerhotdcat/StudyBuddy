import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
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

// Firestore 인스턴스 export
export const db = getFirestore(app);

// Auth 인스턴스 및 Provider export
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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

export interface StudySessionPayload {
  subject: string;
  minutes: number;
  createdAt?: Date;
}

/**
 * 로그인한 유저의 UID 기준으로 공부 세션을 저장하는 유틸 함수
 * users/{uid}/studySessions 콜렉션에 문서를 추가합니다.
 */
export async function saveStudySession(
  uid: string,
  payload: StudySessionPayload,
) {
  if (!uid) {
    throw new Error('유저 UID가 필요합니다.');
  }

  const { subject, minutes, createdAt } = payload;

  if (!subject.trim()) {
    throw new Error('과목명을 입력해주세요.');
  }

  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error('공부 시간(분)은 0보다 큰 숫자여야 합니다.');
  }

  const sessionsCol = collection(db, 'users', uid, 'studySessions');

  await addDoc(sessionsCol, {
    subject,
    minutes,
    createdAt: createdAt ?? serverTimestamp(),
  });
}

