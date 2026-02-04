import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImagePlus } from 'lucide-react';
import { updateUserProfile, uploadProfileImage, type UserProfileDoc } from '../firebase';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  initialProfile: UserProfileDoc | null;
  onSaved: (profile: UserProfileDoc) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  uid,
  initialProfile,
  onSaved,
}) => {
  const [nickname, setNickname] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [jobGoal, setJobGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNickname(initialProfile?.nickname ?? '');
      setPhotoURL(initialProfile?.photoURL ?? '');
      setPreviewUrl(initialProfile?.photoURL ?? null);
      setJobGoal(initialProfile?.jobGoal ?? '');
      setError(null);
    }
  }, [isOpen, initialProfile]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.target.value = '';

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);
    setError(null);
    try {
      const url = await uploadProfileImage(uid, file);
      setPhotoURL(url);
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
      setError('이미지 업로드에 실패했습니다.');
      setPreviewUrl(photoURL || null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateUserProfile(uid, {
        nickname: nickname.trim() || undefined,
        photoURL: photoURL.trim() || undefined,
        jobGoal: jobGoal.trim() || undefined,
      });
      onSaved({
        nickname: nickname.trim() || undefined,
        photoURL: photoURL.trim() || undefined,
        jobGoal: jobGoal.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-md rounded-xl border-2 border-brand-lime bg-[#1a1a1a] p-6 shadow-2xl shadow-brand-lime/10"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              프로필 설정
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-lime"
              aria-label="닫기"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                별명 (Nickname)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="표시할 이름"
                className="w-full rounded-lg border border-gray-700 bg-[#222] px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                프로필 이미지
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-2 border-brand-lime bg-[#222] overflow-hidden shrink-0 flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="프로필 미리보기"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-2xl">?</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-brand-lime text-brand-lime font-bold hover:bg-brand-lime hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImagePlus size={18} />
                    {uploading ? '업로드 중...' : '이미지 선택'}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                나의 직업 / 목표
              </label>
              <textarea
                value={jobGoal}
                onChange={(e) => setJobGoal(e.target.value)}
                placeholder="한 줄로 소개해보세요"
                rows={3}
                className="w-full rounded-lg border border-gray-700 bg-[#222] px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime resize-none"
              />
            </div>

            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">영수증 출력 소리</p>
              <p className="text-xs text-gray-500">기본 프린터 비프음 사용 중 · 추후 .mp3 커스텀 예정</p>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 font-bold hover:bg-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-lg bg-brand-lime text-black font-bold hover:bg-white transition-colors disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
