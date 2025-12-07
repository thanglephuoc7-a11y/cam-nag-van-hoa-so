
import React, { useState } from 'react';
import type { User } from '../types';
import { users } from '../data/users';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

type View = 'login' | 'register' | 'forgot';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { lang, t } = useLanguage();
  const [view, setView] = useState<View>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.name === name && u.password === password);
    if (user) {
      setError('');
      const updatedUser = {
        ...user,
        lang, // Update language preference from login screen
        lastLogin: new Date().toISOString(),
      };
      // In a real app, you'd update this on the server. Here we mutate the mock data.
      const userIndex = users.findIndex(u => u.name === name);
      users[userIndex] = updatedUser;
      onLoginSuccess(updatedUser);
    } else {
      setError(t('wrong_pw'));
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.name === name)) {
      setError(t('name_exists'));
      return;
    }
    const newUser: User = {
      name,
      password,
      lang,
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      avatarUrl: `https://i.pravatar.cc/150?u=${name.replace(/\s/g, '')}`,
      bio: '',
    };
    users.push(newUser);
    setError('');
    setMessage(t('create_acc'));
    setView('login');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const userIndex = users.findIndex(u => u.name === name);
    if (userIndex !== -1) {
      const newPassword = Math.random().toString(36).substring(2, 8);
      users[userIndex].password = newPassword;
      setError('');
      alert(`${t('reset_pw')} ${newPassword}`);
      setView('login');
    } else {
      setError(t('not_found'));
    }
  };

  const resetForm = () => {
    setName('');
    setPassword('');
    setError('');
    setMessage('');
  };
  
  const renderForm = () => {
    switch (view) {
      case 'register':
        return (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-[#0B72B9]">{t('register')}</h2>
            <input type="text" placeholder={t('enter_name')} value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />
            <input type="password" placeholder={t('enter_pw')} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />
            <button type="submit" className="w-full bg-[#0B72B9] text-white py-2 rounded-md hover:bg-[#085a94]">{t('register')}</button>
            <button type="button" onClick={() => { setView('login'); resetForm(); }} className="w-full text-center text-sm text-gray-600 hover:underline">{t('back_to_login')}</button>
          </form>
        );
      case 'forgot':
        return (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-[#0B72B9]">{t('forgot_pw')}</h2>
            <input type="text" placeholder={t('enter_name')} value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />
            <button type="submit" className="w-full bg-[#0B72B9] text-white py-2 rounded-md hover:bg-[#085a94]">Reset Password</button>
            <button type="button" onClick={() => { setView('login'); resetForm(); }} className="w-full text-center text-sm text-gray-600 hover:underline">{t('back_to_login')}</button>
          </form>
        );
      case 'login':
      default:
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-[#0B72B9]">{t('login')}</h2>
            {message && <p className="text-green-600 text-center">{message}</p>}
            <input type="text" placeholder={t('enter_name')} value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />
            <input type="password" placeholder={t('enter_pw')} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />
            <button type="submit" className="w-full bg-[#0B72B9] text-white py-2 rounded-md hover:bg-[#085a94]">{t('login')}</button>
            <div className="flex justify-between text-sm">
                <button type="button" onClick={() => { setView('register'); resetForm(); }} className="text-gray-600 hover:underline">{t('new_user')} {t('register')}</button>
                <button type="button" onClick={() => { setView('forgot'); resetForm(); }} className="text-gray-600 hover:underline">{t('need_help')} {t('forgot_pw')}</button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4 relative">
        <LanguageSwitcher className="absolute top-4 right-4" />
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
            <div className="bg-[#0B72B9] p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Cẩm Nang Văn Hóa Số</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {renderForm()}
      </div>
    </div>
  );
};

export default LoginScreen;