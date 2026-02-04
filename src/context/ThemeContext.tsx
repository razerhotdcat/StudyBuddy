import React, { createContext, useContext, useState, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  /** 다크: #0A0A0A, 라이트: 소프트 그레이 #F2F2F7 (Soft Paper) */
  bg: string;
  text: string;
  /** 카드/패널 배경: 라이트 시 화이트 + 테두리 */
  panelBg: string;
  /** 패널/입력창 테두리 (라이트: #E5E7EB) */
  panelBorder: string;
  /** 메인 버튼 배경: 다크=연두, 라이트=블랙(잉크) */
  primaryButtonBg: string;
  primaryButtonText: string;
}

const BG_DARK = '#0A0A0A';
const BG_LIGHT = '#F2F2F7'; // Soft Paper
const TEXT_DARK = '#ffffff';
const TEXT_LIGHT = '#1f2937';
const PANEL_DARK = '#0f0f0f';
const PANEL_LIGHT = '#ffffff';
const PANEL_BORDER_DARK = '#1F2937';
const PANEL_BORDER_LIGHT = '#E5E7EB';
const BTN_DARK_BG = '#CCFF00';
const BTN_DARK_TEXT = '#000000';
const BTN_LIGHT_BG = '#1a1a1a';
const BTN_LIGHT_TEXT = '#ffffff';

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
