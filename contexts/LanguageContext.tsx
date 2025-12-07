
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { languageData } from '../data/language';
import type { Lang } from '../types';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>('vi');

  const t = (key: string): string => {
    if (languageData[key] && languageData[key][lang]) {
      return languageData[key][lang];
    }
    console.warn(`Translation key "${key}" not found for lang "${lang}"`);
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
