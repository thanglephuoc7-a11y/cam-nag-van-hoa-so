
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './components/HomeScreen';
import KnowledgeScreen from './components/KnowledgeScreen';
import QuizScreen from './components/QuizScreen';
import ScenariosScreen from './components/ScenariosScreen';
import AdvisorScreen from './components/AdvisorScreen';
import HistoryScreen from './components/ResultsScreen';
import GameScreen from './components/GameScreen';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import { Screen } from './constants';
import type { QuizResult, User, ScenarioHistoryItem } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { users } from './data/users';

const MainApp: React.FC = () => {
  const { setLang } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Home);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistoryItem[]>([]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setLang(user.lang);
  };

  const handleQuizComplete = useCallback((result: QuizResult) => {
    setQuizHistory(prev => [...prev, result]);
    navigateTo(Screen.History);
  }, []);
  
  const handleScenarioAnalyzed = useCallback((analysis: Omit<ScenarioHistoryItem, 'timestamp'>) => {
    setScenarioHistory(prev => [...prev, { ...analysis, timestamp: new Date().toISOString() }]);
    // NOTE: Removed navigation to history to allow users to stay on the scenarios page.
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setLang('vi'); // Reset language on logout
    // Reset state on logout
    setCurrentScreen(Screen.Home);
    setQuizHistory([]);
    setScenarioHistory([]);
  };
  
  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    const userIndex = users.findIndex(u => u.name === updatedUser.name);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Knowledge:
        return <KnowledgeScreen />;
      case Screen.Quiz:
        return <QuizScreen onQuizComplete={handleQuizComplete} />;
      case Screen.Scenarios:
        return <ScenariosScreen onScenarioAnalyzed={handleScenarioAnalyzed} />;
      case Screen.Game:
        return <GameScreen />;
      case Screen.Advisor:
        return <AdvisorScreen />;
      case Screen.History:
        return <HistoryScreen quizHistory={quizHistory} scenarioHistory={scenarioHistory} />;
      case Screen.Profile:
        return <ProfileScreen currentUser={currentUser!} onProfileUpdate={handleProfileUpdate} />;
      case Screen.Home:
      default:
        return <HomeScreen navigateTo={navigateTo} />;
    }
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col min-h-screen text-gray-800">
      <Header onNavigate={navigateTo} onLogout={handleLogout} currentUser={currentUser} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div key={currentScreen} className="screen-transition">
          {renderScreen()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <MainApp />
  </LanguageProvider>
);


export default App;