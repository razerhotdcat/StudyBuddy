import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Archive, Calendar, Grid, User } from 'lucide-react';

export type TabId = 'workshop' | 'collection' | 'daily-report' | 'square' | 'my-office';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'workshop' as TabId, label: 'WORKSHOP', icon: Wrench },
  { id: 'collection' as TabId, label: 'COLLECTION', icon: Archive },
  { id: 'daily-report' as TabId, label: 'DAILY REPORT', icon: Calendar },
  { id: 'square' as TabId, label: 'SQUARE', icon: Grid },
  { id: 'my-office' as TabId, label: 'MY OFFICE', icon: User },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="sticky top-16 z-40 bg-gray-900 border-b border-gray-800 isolate">
      <div className="container mx-auto px-4 relative">
        <nav className="flex items-center gap-1 overflow-x-auto" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={tab.id === 'collection' ? 'tab-collection' : undefined}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                className={`relative flex items-center gap-2 px-6 py-4 font-mono text-xs font-bold tracking-wider transition-colors whitespace-nowrap cursor-pointer pointer-events-auto ${
                  isActive
                    ? 'text-brand-lime'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-lime"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
