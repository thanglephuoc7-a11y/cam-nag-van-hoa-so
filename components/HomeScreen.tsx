


import React from 'react';
import { Screen } from '../constants';
import { BookOpenIcon, CheckSquareIcon, MessageSquareIcon, BarChartIcon, GiftIcon, UsersIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeScreenProps {
  navigateTo: (screen: Screen) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigateTo }) => {
  const { t } = useLanguage();

  const menuItems = [
    { screen: Screen.Knowledge, titleKey: 'home_knowledge_title', descriptionKey: 'home_knowledge_desc', icon: <BookOpenIcon className="w-12 h-12 text-[#0B72B9]"/>, color: 'bg-blue-100' },
    { screen: Screen.Quiz, titleKey: 'home_quiz_title', descriptionKey: 'home_quiz_desc', icon: <CheckSquareIcon className="w-12 h-12 text-green-500"/>, color: 'bg-green-100' },
    { screen: Screen.Scenarios, titleKey: 'home_scenarios_title', descriptionKey: 'home_scenarios_desc', icon: <UsersIcon className="w-12 h-12 text-yellow-500"/>, color: 'bg-yellow-100' },
    { screen: Screen.Game, titleKey: 'home_game_title', descriptionKey: 'home_game_desc', icon: <GiftIcon className="w-12 h-12 text-red-500"/>, color: 'bg-red-100' },
    { screen: Screen.Advisor, titleKey: 'home_advisor_title', descriptionKey: 'home_advisor_desc', icon: <MessageSquareIcon className="w-12 h-12 text-indigo-500"/>, color: 'bg-indigo-100' },
    { screen: Screen.History, titleKey: 'home_history_title', descriptionKey: 'home_history_desc', icon: <BarChartIcon className="w-12 h-12 text-purple-500"/>, color: 'bg-purple-100' },
  ];

  return (
    <div className="text-center">
      <div className="bg-white shadow-lg rounded-xl p-8 mb-12 border border-gray-200">
        <h2 className="text-4xl font-bold text-[#0B72B9] mb-4">{t('home_welcome_title')}</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {t('home_welcome_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems.map((item) => (
          <div
            key={item.screen}
            onClick={() => navigateTo(item.screen)}
            className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col items-center"
          >
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${item.color} transition-transform group-hover:scale-110`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">{t(item.titleKey)}</h3>
            <p className="text-gray-500 text-sm">{t(item.descriptionKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
