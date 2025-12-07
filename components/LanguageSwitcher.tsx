
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`flex items-center space-x-1 bg-gray-200 p-1 rounded-full ${className}`}>
        <button
            onClick={() => setLang('vi')}
            className={`px-3 py-1 text-sm rounded-full transition-colors font-semibold ${lang === 'vi' ? 'bg-white text-[#0B72B9] shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            aria-pressed={lang === 'vi'}
        >
            🇻🇳 VI
        </button>
        <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-sm rounded-full transition-colors font-semibold ${lang === 'en' ? 'bg-white text-[#0B72B9] shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            aria-pressed={lang === 'en'}
        >
            🇬🇧 EN
        </button>
    </div>
  );
};

export default LanguageSwitcher;
