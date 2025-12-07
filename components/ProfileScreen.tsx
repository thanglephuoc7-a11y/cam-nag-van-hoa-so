
import React, { useState } from 'react';
import type { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileScreenProps {
  currentUser: User;
  onProfileUpdate: (updatedUser: User) => void;
}

const BIO_MAX_LENGTH = 150;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, onProfileUpdate }) => {
  const { t, lang } = useLanguage();
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [previewUrl, setPreviewUrl] = useState(currentUser.avatarUrl || 'https://i.pravatar.cc/150');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setAvatarUrl(newUrl);
    setSuccessMessage('');
    if (newUrl.startsWith('http://') || newUrl.startsWith('https://')) {
        setPreviewUrl(newUrl);
        setError('');
    } else if (newUrl === '') {
        setPreviewUrl('https://i.pravatar.cc/150');
        setError('');
    } else {
        setError(t('profile_invalid_url'));
    }
  };
  
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
    setSuccessMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;

    const finalUrl = avatarUrl.trim() === '' ? `https://i.pravatar.cc/150?u=${currentUser.name.replace(/\s/g, '')}` : avatarUrl;

    const updatedUser = { ...currentUser, avatarUrl: finalUrl, bio };
    onProfileUpdate(updatedUser);
    setSuccessMessage(t('profile_update_success'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
  };

  const isUnchanged = avatarUrl === (currentUser.avatarUrl || '') && bio === (currentUser.bio || '');

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#0B72B9] mb-8">{t('profile_title')}</h2>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Avatar and URL Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 text-center">
              <p className="font-semibold text-sm text-gray-600 mb-2">{t('profile_preview')}</p>
              <img
                src={previewUrl}
                alt="Avatar Preview"
                className="w-32 h-32 rounded-full border-4 border-[#0B72B9] object-cover shadow-md bg-gray-200"
                onError={(e) => { e.currentTarget.src = 'https://i.pravatar.cc/150'; }}
              />
            </div>
            <div className="flex-grow w-full">
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">{t('profile_avatar_label')}</label>
                <input
                  type="url"
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={handleUrlChange}
                  placeholder={t('profile_avatar_placeholder')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0B72B9] focus:border-[#0B72B9]"
                />
                 {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          </div>
          
          {/* User Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('profile_username')}</label>
              <p className="mt-1 p-2 bg-gray-100 rounded-md">{currentUser.name}</p>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">{t('profile_join_date')}</label>
              <p className="mt-1 p-2 bg-gray-100 rounded-md">{formatDate(currentUser.joinDate)}</p>
            </div>
            <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">{t('profile_last_login')}</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-md">{formatDate(currentUser.lastLogin)}</p>
            </div>
          </div>
          
          {/* Bio Section */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">{t('profile_bio_label')}</label>
            <textarea
                id="bio"
                value={bio}
                onChange={handleBioChange}
                maxLength={BIO_MAX_LENGTH}
                placeholder={t('profile_bio_placeholder')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0B72B9] focus:border-[#0B72B9] resize-none"
                rows={3}
            />
            <p className="text-right text-xs text-gray-500 mt-1">
                {t('profile_bio_chars_left').replace('{count}', String(BIO_MAX_LENGTH - bio.length))}
            </p>
          </div>

          {successMessage && <p className="text-green-600 text-center font-semibold animate-pulse">{successMessage}</p>}

          <div className="text-right border-t pt-6">
            <button
              type="submit"
              className="bg-[#0B72B9] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-[#085a94] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!!error || isUnchanged}
            >
              {t('profile_save_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileScreen;