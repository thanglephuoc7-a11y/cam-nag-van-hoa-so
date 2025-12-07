
import React from 'react';
import { Screen, SCREEN_TITLES } from '../constants';
import type { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  currentUser: User;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout, currentUser }) => {
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => onNavigate(Screen.Home)}>
          <div className="bg-[#0B72B9] p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#0B72B9]">Cẩm Nang Văn Hóa Số</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          {(Object.keys(Screen) as Array<keyof typeof Screen>).filter(key => key !== 'Profile').map((key) => (
            <button
              key={key}
              onClick={() => onNavigate(Screen[key])}
              className="text-gray-600 hover:text-[#0B72B9] font-medium transition-colors"
            >
              {t(SCREEN_TITLES[Screen[key]])}
            </button>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div 
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => onNavigate(Screen.Profile)}
            >
              <img 
                src={currentUser.avatarUrl || 'https://i.pravatar.cc/150'}
                alt="User Avatar" 
                className="w-10 h-10 rounded-full border-2 border-gray-300 group-hover:border-[#0B72B9] transition-colors object-cover" 
              />
              <span className="hidden sm:inline text-gray-700 font-medium group-hover:text-[#0B72B9] transition-colors">{currentUser.name}</span>
            </div>
            <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
            >
                {t('logout')}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
