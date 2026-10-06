import { useCallback, createContext, useContext, ReactNode } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { Lang, i18n, LangKey } from '../i18n';
import { PostProvider } from './PostContext';

interface AppContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: LangKey) => string;
  theme: 'dark' | 'light';
  isManualTheme: boolean;
  toggleTheme: () => void;
  resetThemeToAuto: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { lang, toggleLang } = useLanguage();
  const { theme, isManual: isManualTheme, toggleTheme, resetToAuto: resetThemeToAuto } = useTheme();

  // 使用 useCallback 缓存 t 函数,避免每次渲染都重新创建
  const t = useCallback(
    (key: LangKey) => {
      return i18n[lang][key] || key;
    },
    [lang]
  );

  return (
    <AppContext.Provider
      value={{ lang, toggleLang, t, theme, isManualTheme, toggleTheme, resetThemeToAuto }}
    >
      <PostProvider>{children}</PostProvider>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
