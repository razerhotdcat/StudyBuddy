import React, { useEffect, useState } from 'react';
import { Grid } from 'lucide-react';
import { fetchSquareFeed, incrementSquareReaction, type SquareFeedItem } from '../../firebase';
import { AIManagerBubble } from '../AIManagerBubble';
import { SquareReceiptCard } from '../SquareReceiptCard';
import { ReceiptFrame } from '../ReceiptFrame';
import { useTheme } from '../../context/ThemeContext';

export const Square: React.FC = () => {
  const theme = useTheme();
  const [feed, setFeed] = useState<SquareFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactingIds, setReactingIds] = useState<Set<string>>(new Set());

  const loadFeed = () => {
    setLoading(true);
    fetchSquareFeed()
      .then(setFeed)
      .catch(() => setFeed([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleReaction = (item: SquareFeedItem) => {
    if (reactingIds.has(item.id)) return;
    setReactingIds((prev) => new Set(prev).add(item.id));
    setFeed((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, reactions: x.reactions + 1 } : x))
    );
    incrementSquareReaction(item.id)
      .catch(() => {
        setFeed((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, reactions: x.reactions - 1 } : x))
        );
      })
      .finally(() => {
        setReactingIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: theme.bg }}>
        <div className="w-10 h-10 border-2 border-brand-lime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="relative py-0 min-h-[70vh] flex flex-col transition-colors" style={{ background: theme.bg, color: theme.text }}>
      <div className="sticky top-0 z-10 border-b-2 border-brand-lime overflow-hidden shrink-0" style={{ background: theme.bg }}>
        <div className="py-3 flex items-center">
          <div className="flex shrink-0 items-center gap-2 px-4 border-r-2 border-brand-lime">
            <span className="text-brand-lime font-mono text-xs font-bold animate-pulse">LIVE</span>
            <Grid size={18} className="text-brand-lime" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              className="inline-flex whitespace-nowrap text-brand-lime font-mono text-sm font-bold tracking-widest"
              style={{ animation: 'ticker 30s linear infinite' }}
            >
              <span className="px-8">RECEIPTS • SQUARE • </span>
              <span className="px-8">방금 누군가 영수증을 인쇄했습니다 • </span>
              <span className="px-8">RECEIPTS • SQUARE • </span>
              <span className="px-8">방금 누군가 영수증을 인쇄했습니다 • </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-0 right-0 top-[52px] bottom-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" aria-hidden />
      <div
        className="relative z-10 flex-1 flex flex-col-reverse justify-end gap-6 px-4 md:px-6 py-6 overflow-y-auto min-h-0 overflow-x-visible max-w-full"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="w-full max-w-2xl mx-auto">
          <ReceiptFrame caption="실시간 영수증 — 누군가의 성장이 지금도 인쇄되고 있습니다." className="w-full max-w-full" fontSize={18}>
            {feed.length === 0 ? (
              <div className="text-center py-12 font-mono" style={{ fontSize: 18 }}>
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Grid size={32} className="text-brand-lime" />
                </div>
                <p className="text-gray-600">아직 공유된 영수증이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feed.map((item) => (
                  <SquareReceiptCard
                    key={item.id}
                    item={item}
                    onReaction={handleReaction}
                    isReacting={reactingIds.has(item.id)}
                  />
                ))}
              </div>
            )}
          </ReceiptFrame>
        </div>
      </div>
      <AIManagerBubble message={null} />

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};
