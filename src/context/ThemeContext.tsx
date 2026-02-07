import React, { createContext, useContext, useState, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  /** 다크: #0A0A0A, 라이트: 블루 그레이 #FAFBFC */
  bg: string;
  text: string;
  /** 카드/패널 배경: 라이트 #FFFFFF */
  panelBg: string;
  /** 패널/입력창 테두리 (라이트: #E5E7EB) */
  panelBorder: string;
  /** 메인 버튼: 다크 #CCFF00(라임), 라이트 #3B82F6(블루) */
  primaryButtonBg: string;
  primaryButtonText: string;
}

const BG_DARK = '#0A0A0A';
const BG_LIGHT = '#FAFBFC';
const TEXT_DARK = '#FFFFFF';
const TEXT_LIGHT = '#1C1C1E';
const PANEL_DARK = '#1C1C1E';
const PANEL_LIGHT = '#FFFFFF';
const PANEL_BORDER_DARK = '#2C2C2E';
const PANEL_BORDER_LIGHT = '#E5E7EB';
const BTN_DARK_BG = '#CCFF00';
const BTN_DARK_TEXT = '#000000';
const BTN_LIGHT_BG = '#3B82F6';
const BTN_LIGHT_TEXT = '#FFFFFF';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value: ThemeContextValue = {
    mode,
    setMode,
    toggle,
    bg: mode === 'dark' ? BG_DARK : BG_LIGHT,
    text: mode === 'dark' ? TEXT_DARK : TEXT_LIGHT,
    panelBg: mode === 'dark' ? PANEL_DARK : PANEL_LIGHT,
    panelBorder: mode === 'dark' ? PANEL_BORDER_DARK : PANEL_BORDER_LIGHT,
    primaryButtonBg: mode === 'dark' ? BTN_DARK_BG : BTN_LIGHT_BG,
    primaryButtonText: mode === 'dark' ? BTN_DARK_TEXT : BTN_LIGHT_TEXT,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
