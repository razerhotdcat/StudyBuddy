import React from 'react';
import { FeatureReceipt } from '../FeatureReceipt';
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
  user?: { displayName?: string | null } | null;
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
    <FeatureReceipt
      items={items}
      onAddItem={onAddItem}
      isResetting={isResetting}
      onResetComplete={onResetComplete}
      onPrintReceipt={onPrintReceipt}
      onLevelUp={onLevelUp}
      profile={profile}
      user={user}
    />
  );
};
