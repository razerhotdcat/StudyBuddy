import React from 'react';
import { Workshop20 } from '../Workshop20';
import type { StudyItem } from '../../types';
import type { ProfileContext } from '../../lib/ai';

interface WorkshopProps {
  items: StudyItem[];
  onAddItem: (item: StudyItem) => void;
  isResetting?: boolean;
  onResetComplete?: () => void;
  onPrintReceipt?: () => void;
  onLevelUp?: (newLevel: number) => void;
  profile?: ProfileContext | null;
  user?: { displayName?: string | null; email?: string | null } | null;
}

export const Workshop: React.FC<WorkshopProps> = ({
  items,
  onAddItem,
  isResetting = false,
  onResetComplete,
  onPrintReceipt,
  onLevelUp,
  profile,
  user,
}) => {
  return (
    <Workshop20
      items={items}
      onAddItem={onAddItem}
      onPrintReceipt={onPrintReceipt}
      isResetting={isResetting}
      onResetComplete={onResetComplete}
      user={user}
    />
  );
};
