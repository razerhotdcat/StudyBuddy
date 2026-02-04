import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import type { StudySessionDoc } from '../firebase';
import { deleteStudySession } from '../firebase';
import { getRandomManagerComment } from '../lib/managerComments';
import { ZigzagEdge } from './ZigzagEdge';

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
};

const formatDate = (ts: { toDate: () => Date } | null) => {
  if (!ts) return '—';
  const d = ts.toDate();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

interface ReceiptDetailModalProps {
  session: StudySessionDoc | null;
  userId: string | null;
  onClose: () => void;
  onDeleted: (deletedId: string) => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  session,
  userId,
  onClose,
  onDeleted,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const managerIndexPhrase = useMemo(() => getRandomManagerComment('collection_index'), [session?.id]);

  const handleDelete = async () => {
    if (!userId || !session) return;
    setDeleting(true);
    try {
      await deleteStudySession(userId, session.id);
      setShowDeleteConfirm(false);
      onDeleted(session.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (!session) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="relative flex flex-col items-center max-h-[85vh]"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 글로벌 영수증 스타일: #FFFFFF 배경, #000000 글자, 지그재그 하단 */}
          <div
            className="w-[min(320px,90vw)] max-h-[75vh] overflow-y-auto overflow-x-visible rounded-t-lg border-2 border-brand-lime border-b-0 pb-6"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45), 0 12px 24px -8px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05), 0 0 40px rgba(204,255,0,0.08)',
            }}
          >
            <div className="p-5 pb-4 font-mono" style={{ color: '#000000' }}>
              {/* 헤더 */}
              <div className="flex flex-col items-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2" style={{ background: '#000000', color: '#ccff00' }}>
                  SB
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#000000' }}>Flow Receipt</p>
                <p className="text-xs font-medium mt-1" style={{ color: '#000000' }}>{formatDate(session.createdAt)}</p>
              </div>

              {/* 활동명 / 시간 */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="text-lg font-bold leading-tight flex-1" style={{ color: '#000000' }}>
                  {session.mode === 'target' && <span className="text-brand-lime mr-1">◉</span>}
                  {session.subject}
                </h3>
                <span className="text-sm font-bold bg-brand-lime/90 px-2 py-1 rounded shrink-0" style={{ color: '#000000' }}>
                  {formatDuration(session.minutes)}
                </span>
              </div>

              {/* 핵심 인사이트 */}
              {session.keyInsight && (
                <div className="ml-2 pl-3 border-l-2 border-brand-lime/50 py-2 mb-4 bg-brand-lime/5 rounded-r">
                  <div className="text-[10px] font-bold uppercase mb-1 bg-brand-lime/80 px-2 py-0.5 inline-block rounded" style={{ color: '#000000' }}>
                    KEY INSIGHT
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#000000' }}>{session.keyInsight}</p>
                </div>
              )}

              {/* 오늘의 한마디 */}
              {session.dailyNote && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#000000' }}>오늘의 한마디</p>
                  <p className="text-sm font-medium italic" style={{ color: '#000000' }}>&quot;{session.dailyNote}&quot;</p>
                </div>
              )}

              {/* 몰입 로그 */}
              {session.flowLog && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#000000' }}>Flow Log</p>
                  <p className="text-sm font-medium leading-relaxed pl-2 border-l border-gray-300" style={{ color: '#000000' }}>
                    {session.flowLog}
                  </p>
                </div>
              )}

              {/* 생각 노트 리스트 */}
              {session.thoughtNotes && session.thoughtNotes.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-brand-lime font-bold uppercase tracking-wider mb-2">
                    ✦ THOUGHTS
                  </p>
                  <ul className="space-y-2">
                    {session.thoughtNotes.map((note, idx) => (
                      <li
                        key={`${note.timestamp}-${idx}`}
                        className="flex gap-2 text-xs border-l border-gray-300 pl-2"
                        style={{ color: '#000000' }}
                      >
                        <span className="font-mono font-bold shrink-0">{note.timestamp}</span>
                        <span className="font-medium">{note.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-b-2 border-dashed border-gray-300 my-4" />

              {/* Manager's Index */}
              <div className="mb-4 rounded border-2 border-brand-lime bg-brand-lime/15 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 leading-snug" style={{ color: '#000000' }}>
                  Manager&apos;s Index
                </p>
                <p className="text-[13px] font-bold break-words leading-relaxed" style={{ color: '#000000' }}>
                  {managerIndexPhrase}
                </p>
              </div>

              <p className="text-[10px] font-bold text-center uppercase tracking-widest" style={{ color: '#000000' }}>
                Thank you for your process
              </p>

              {/* 삭제 버튼 */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium hover:text-red-400 border border-gray-300 hover:border-red-400/50 rounded transition-colors"
                  style={{ color: '#000000' }}
                >
                  <Trash2 size={12} />
                  삭제
                </button>
              </div>
            </div>
            <div className="overflow-visible pb-2">
              <ZigzagEdge fill="#FFFFFF" height={12} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 p-2 rounded-full border-2 border-brand-lime text-brand-lime hover:bg-brand-lime hover:text-black transition-colors"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </motion.div>
      </div>

      {/* 삭제 확인 팝업 */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setShowDeleteConfirm(false)}
            />
            <motion.div
              className="relative w-full max-w-sm rounded-xl border-2 border-brand-lime bg-[#1a1a1a] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm text-white mb-2">
                이 기록은 파쇄되어 복구할 수 없습니다.
              </p>
              <p className="text-sm font-bold text-brand-lime mb-6">
                정말 삭제할까요?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-lg border-2 border-brand-lime text-brand-lime font-bold hover:bg-brand-lime/10 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
