
import { languageData } from '../data/language';
import type { Lang } from '../types';

export const t = (key: string, lang: Lang): string => {
  if (languageData[key] && languageData[key][lang]) {
    return languageData[key][lang];
  }
  console.warn(`Translation key "${key}" not found for lang "${lang}"`);
  return key; // Fallback to key if not found
};
