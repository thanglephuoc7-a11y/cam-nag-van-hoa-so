
import React from 'react';
import { AlertTriangleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface SeverityBadgeProps {
  score: number;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ score }) => {
  const { t } = useLanguage();
  const getSeverity = (): { level: string; color: string; bgColor: string } => {
    if (score <= 3) return { level: t('severity_low'), color: 'text-green-800', bgColor: 'bg-green-100' };
    if (score <= 7) return { level: t('severity_medium'), color: 'text-yellow-800', bgColor: 'bg-yellow-100' };
    return { level: t('severity_high'), color: 'text-red-800', bgColor: 'bg-red-100' };
  };

  const { level, color, bgColor } = getSeverity();

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-full ${bgColor} ${color}`}>
      <AlertTriangleIcon className="w-5 h-5 mr-2" />
      <span className="font-bold">{t('severity_badge_label')}: {level} ({score}/10)</span>
    </div>
  );
};

export default SeverityBadge;