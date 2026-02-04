import React from 'react';
import { FeatureReceipt } from './FeatureReceipt';
import type { StudyItem } from '../types';

interface DashboardProps {
  items: StudyItem[];
  onAddItem: (item: StudyItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ items, onAddItem }) => {
  return (
    <FeatureReceipt
      items={items}
      onAddItem={onAddItem}
    />
  );
}

